import { Body, Controller, Post } from "@nestjs/common";

import { CreatePaymentBrokenUseCase } from "../stages/01-duplicate-execution/broken/create-payment-broken.use-case";
import { CreatePaymentUniqueUseCase } from "../stages/01-duplicate-execution/fixed-with-unique/create-payment-unique.use-case";
import { CreatePaymentTransactionUseCase } from "../stages/02-atomicity/fixed-with-transaction/create-payment-transaction.use-case";

type CreatePaymentRequest = {
    accountId: number;
    amount: number;
    externalReference: string;
}

@Controller('payment-lab')
export class PaymentLabController {
    constructor(
        private readonly createPaymentBrokenUseCase: CreatePaymentBrokenUseCase,
        private readonly createPaymentUniqueUseCase: CreatePaymentUniqueUseCase,
        private readonly createPaymentTransactionUseCase: CreatePaymentTransactionUseCase
    ){}

    @Post('stage-01/broken/create-payment')
    brokenCreatePayment(@Body() body: CreatePaymentRequest) {
        return this.createPaymentBrokenUseCase.execute(body);
    }

    @Post('stage-01/unique/create-payment')
    uniqueCreatePayment(@Body() body: CreatePaymentRequest) {
        return this.createPaymentUniqueUseCase.execute(body);
    }

    @Post('stage-02/fixed-with-transaction/create-payment')
    fixedWithTransactionCreatePayment(@Body() body: CreatePaymentRequest) {
        return this.createPaymentTransactionUseCase.execute(body);
    }
}