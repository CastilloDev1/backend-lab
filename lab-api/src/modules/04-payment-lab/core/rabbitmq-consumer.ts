import { Injectable, OnModuleInit } from "@nestjs/common";
import { getRabbitChannel } from "src/shared/messaging/rabbitmq/rabbitmq.connection";
import { DataSource } from "typeorm";

type OutboxEvent = {
    id: number;
    payload: {
        accountId: number;
        amount: number;
        externalReference: string;
    }
}

@Injectable()
export class RabbitmqConsumer implements OnModuleInit {

    private readonly QUEUE_NAME = 'payment.outbox.queue';

    constructor(
        private readonly dataSource: DataSource,
    ) { }
    async onModuleInit() {
        await this.start();
    }

    private async start() {
        const channel = await getRabbitChannel();

        await channel.assertQueue(this.QUEUE_NAME, {
            durable: true,
        });

        await channel.consume(this.QUEUE_NAME, async (message) => {

            if (!message) return;

            try {
                const payload = JSON.parse(message.content.toString());

                const outboxEvent = await this.claimNextEvents(payload.outboxEventId);

                if (!outboxEvent) {
                    console.log(`Outbox event not found or not pending ${payload.outboxEventId}`);
                    channel.ack(message);
                    return;
                }

                try {
                    await this.processPaymentEvent(outboxEvent);
                    await this.markAsProcessed(outboxEvent.id);
                    channel.ack(message);
                } catch (error) {
                    await this.markAsFailed(outboxEvent.id, error);
                    channel.nack(message, false, false);
                }
            } catch (error) {
                console.error(`Invalid RabbitMQ message: ${error}`);
                channel.nack(message, false, true);
            }

        });
    }

    private async claimNextEvents(outboxEventId: number) {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();


        try {
            const [rows] = await queryRunner.query(
                `
            UPDATE outbox_event
            SET 
              status = 'PROCESSING',
              locked_at = NOW(),
              attempts = attempts + 1,
              last_error = NULL
            WHERE id = $1
            RETURNING id, event_type, payload, status, attempts
            `,
                [outboxEventId]
            );

            await queryRunner.commitTransaction();

            return rows[0] ?? [];

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    private async processPaymentEvent(outboxEvent: OutboxEvent) {

        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {

            await queryRunner.query(
                `
            INSERT INTO processed_event (outbox_event_id)
            VALUES ($1)
            `,
                [outboxEvent.id],
            );

            // SOLO si inserto, aplica el efecto.
            const [account] = await queryRunner.query(
                `
            UPDATE account
            SET balance = balance - $1
            WHERE id = $2
                AND balance >= $1
            RETURNING id, balance
            `,
                [outboxEvent.payload.amount, outboxEvent.payload.accountId],
            );

            if (account.length === 0) {
                throw new Error('Insufficient balance');
            }

            await queryRunner.commitTransaction();

        } catch (error) {

            await queryRunner.rollbackTransaction();

            if (error.code === '23505') {

                // Ya se proceso el evento. No hago nada.
                return;

            }

            throw error;

        } finally {
            await queryRunner.release();
        }
    }

    private async markAsProcessed(outboxEventId: number) {
        await this.dataSource.query(
            `
          UPDATE outbox_event
          SET 
            status = 'PROCESSED',
            locked_at = NULL,
            last_error = NULL
          WHERE id = $1
          `,
            [outboxEventId],
        );
    }

    private async markAsFailed(outboxEventId: number, error: Error) {
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
            [outboxEventId, message],
        );
    }
}