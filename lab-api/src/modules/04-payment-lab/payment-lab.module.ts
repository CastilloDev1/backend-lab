import { Module } from "@nestjs/common";

import { TypeOrmModule } from "@nestjs/typeorm";

import { Account } from "./domain/account.entity";
import { Payment } from "./domain/payment.entity";

import { PaymentLabController } from "./controller/payment-lab.controller";
import { AccountSeederService } from "./infraestructure/seed/account-seeder";
import { CreatePaymentBrokenUseCase } from "./stages/01-duplicate-execution/broken/create-payment-broken.use-case";
import { CreatePaymentUniqueUseCase } from "./stages/01-duplicate-execution/fixed-with-unique/create-payment-unique.use-case";
import { CreatePaymentTransactionUseCase } from "./stages/02-atomicity/fixed-with-transaction/create-payment-transaction.use-case";

@Module({
    imports: [TypeOrmModule.forFeature([Account, Payment])],
    controllers: [PaymentLabController],
    providers: [
        AccountSeederService,
        CreatePaymentBrokenUseCase,
        CreatePaymentUniqueUseCase,
        CreatePaymentTransactionUseCase,
    ]
})
export class PaymentLabModule {}