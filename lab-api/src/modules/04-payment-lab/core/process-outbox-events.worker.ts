import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ProcessOutboxEventsWorker {
  constructor(private readonly dataSource: DataSource) {}

  async processOnce() {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const [rows, rowCount] = await queryRunner.query(
        `
        UPDATE outbox_event
        SET status = 'PROCESSING'
        WHERE id = (
          SELECT id
          FROM outbox_event
          WHERE status = 'PENDING'
          ORDER BY id ASC
          LIMIT 1
          FOR UPDATE SKIP LOCKED
        )
        RETURNING id, event_type, payload, status
        `,
      );

      if (!rows?.length) {
        await queryRunner.commitTransaction();

        return {
          message: 'No pending events',
        };
      }

      const event = rows[0];

      await queryRunner.query(
        `
        UPDATE account
        SET balance = balance - $1
        WHERE id = $2
        `,
        [event.payload.amount, event.payload.accountId],
      );

      await queryRunner.query(
        `
        UPDATE outbox_event
        SET status = 'PROCESSED'
        WHERE id = $1
        `,
        [event.id],
      );

      await queryRunner.commitTransaction();

      return {
        message: 'Outbox event processed',
        eventId: event.id,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}