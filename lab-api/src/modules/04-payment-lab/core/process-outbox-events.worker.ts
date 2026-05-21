import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ProcessOutboxEventsWorker {
  constructor(private readonly dataSource: DataSource) { }

  async processOnce() {

    // 1. Recuperar eventos atascados
    await this.recoverStuckEvents();

    // 2. Reclamar evento normal
    const event = await this.claimNextEvent();

    if (!event) {
      return {
        message: 'No pending events',
      }
    }

    try {
      await this.processPaymentEvent(event);

      await this.markAsProcessed(event.id);

      return {
        message: 'Outbox event processed',
        eventId: event.id,
      }
    } catch (error) {
      await this.markFailedOrRetry(event.id, error);
      throw error;
    }

  }

  private async recoverStuckEvents() {
    await this.dataSource.query(
      `
      UPDATE outbox_event
      SET status = 'PENDING'
      WHERE status = 'PROCESSING' AND locked_at < NOW() - INTERVAL '10 seconds'
      `,
    );
  }

  private async claimNextEvent() {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();


    try {
      const [rows, rowCount] = await queryRunner.query(
        `
        UPDATE outbox_event
        SET 
          status = 'PROCESSING',
          locked_at = NOW(),
          attempts = attempts + 1,
          last_error = NULL
        WHERE id = (
          SELECT id
          FROM outbox_event
          WHERE status = 'PENDING'
          ORDER BY id ASC
          LIMIT 1
          FOR UPDATE SKIP LOCKED
        )
        RETURNING id, event_type, payload, status, attempts
        `,
      );

      await queryRunner.commitTransaction();
      return rows[0] ?? null;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async processPaymentEvent(event: {
    id: number;
    payload: {
      accountId: number;
      amount: number;
      externalReference: string;
    }
  }) {

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      await queryRunner.query(
        `
        INSERT INTO processed_event (outbox_event_id)
        VALUES ($1)
        `,
        [event.id],
      );

      // SOLO si inserto, aplica el efecto.
      await queryRunner.query(
        `
        UPDATE account
        SET balance = balance - $1
        WHERE id = $2
        `,
        [event.payload.amount, event.payload.accountId],
      );

      await queryRunner.commitTransaction();
    } catch (error) {

      await queryRunner.rollbackTransaction();

      if( error.code === '23505' ) {

        // Ya se proceso el evento. No hago nada.
        return;

      }

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async markAsProcessed(eventId: number) {
    await this.dataSource.query(
      `
      UPDATE outbox_event
      SET 
        status = 'PROCESSED',
        locked_at = NULL,
        last_error = NULL
      WHERE id = $1
      `,
      [eventId],
    );
  }

  private async markFailedOrRetry(eventId: number, error: Error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unknown error';

    await this.dataSource.query(
      `
      UPDATE outbox_event
      SET 
        status = 'FAILED',
        locked_at = NULL,
        last_error = $2
      WHERE id = $1
      `,
      [eventId, message],
    );
  }
}