import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { RabbitmqPublisher } from "./rabbitmq-publisher";
import { Interval } from "@nestjs/schedule";

@Injectable()
export class OutboxRelayUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly rabbitmqPublisher: RabbitmqPublisher
    ){}

    @Interval(10000)
    async publishPendingEvents() {
        const pendingEvents = await this.dataSource.query(
            `
            SELECT id
            FROM outbox_event
            WHERE status = 'PENDING'
            ORDER BY created_at ASC
            LIMIT 50
            `
        );

        for (const event of pendingEvents) {
            await this.rabbitmqPublisher.publishOutboxEvent(event.id.toString());
        }

    }
}
