import { Module } from "@nestjs/common";

import { TypeOrmModule } from "@nestjs/typeorm";

import { Account } from "./domain/account.entity";
import { Payment } from "./domain/payment.entity";
import { OutBoxEvent } from "./domain/outbox-event.entity";
import { ProcessedEvent } from "./domain/processed_event";

import { PaymentLabController } from "./controller/payment-lab.controller";
import { AccountSeederService } from "./infraestructure/seed/account-seeder";
import { CreatePaymentOutboxPreviewUseCase } from "./core/create-payment-outbox-preview.use-case";
import { ProcessOutboxEventsWorker } from "./core/process-outbox-events.worker";
import { RabbitmqPublisher } from "./core/rabbitmq-publisher";
import { RabbitmqConsumer } from "./core/rabbitmq-consumer";
import { ScheduleModule } from "@nestjs/schedule";
import { OutboxRelayUseCase } from "./core/outbox-relay.use-case";

@Module({
    imports: [
        TypeOrmModule.forFeature([Account, Payment, OutBoxEvent, ProcessedEvent]),
        ScheduleModule.forRoot(),
    ],
    controllers: [PaymentLabController],
    providers: [
        AccountSeederService,
        CreatePaymentOutboxPreviewUseCase,
        ProcessOutboxEventsWorker,
        RabbitmqPublisher,
        RabbitmqConsumer,
        OutboxRelayUseCase,
    ]
})
export class PaymentLabModule {}