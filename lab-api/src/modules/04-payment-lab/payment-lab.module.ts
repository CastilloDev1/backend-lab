import { Module } from "@nestjs/common";

import { TypeOrmModule } from "@nestjs/typeorm";

import { Account } from "./domain/account.entity";
import { Payment } from "./domain/payment.entity";
import { OutBoxEvent } from "./domain/outbox-event.entity";

import { PaymentLabController } from "./controller/payment-lab.controller";
import { AccountSeederService } from "./infraestructure/seed/account-seeder";
import { CreatePaymentBrokenUseCase } from "./stages/01-duplicate-execution/broken/create-payment-broken.use-case";
import { CreatePaymentUniqueUseCase } from "./stages/01-duplicate-execution/fixed-with-unique/create-payment-unique.use-case";
import { CreatePaymentTransactionUseCase } from "./stages/02-atomicity/fixed-with-transaction/create-payment-transaction.use-case";
import { CreatePaymentExternalBrokenUseCase } from "./stages/03-transaction-boundary/broken-external-inside-transaction/create-payment-external-broken.use-case";
import { CreatePaymentSafeBoundaryUseCase } from "./stages/03-transaction-boundary/safer-boundary/create-payment-safe-boundary.use-case";
import { CreatePaymentOutboxPreviewUseCase } from "./stages/04-external-consistency/fixed-with-outbox-preview/create-payment-outbox-preview.use-case";

@Module({
    imports: [TypeOrmModule.forFeature([Account, Payment, OutBoxEvent])],
    controllers: [PaymentLabController],
    providers: [
        AccountSeederService,
        CreatePaymentBrokenUseCase,
        CreatePaymentUniqueUseCase,
        CreatePaymentTransactionUseCase,
        CreatePaymentExternalBrokenUseCase,
        CreatePaymentSafeBoundaryUseCase,
        CreatePaymentOutboxPreviewUseCase,
    ]
})
export class PaymentLabModule {}