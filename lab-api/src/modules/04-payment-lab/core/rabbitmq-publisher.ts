import { Injectable } from "@nestjs/common";
import { getRabbitChannel } from "src/shared/messaging/rabbitmq/rabbitmq.connection";

@Injectable()
export class RabbitmqPublisher {
    
    private readonly QUEUE_NAME = 'payment.outbox.queue';

    async publishOutboxEvent( outboxEventId: string ){
        const channel = await getRabbitChannel();

        await channel.assertQueue(this.QUEUE_NAME, { durable: true });

        const message = JSON.stringify({
            outboxEventId
        });

        channel.sendToQueue(
            this.QUEUE_NAME,
            Buffer.from(message),
        );

        console.log(`Outbox event ${outboxEventId} published to queue ${this.QUEUE_NAME}`);
    }
}