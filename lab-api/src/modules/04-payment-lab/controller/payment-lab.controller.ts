import { Body, Controller, Post } from "@nestjs/common";

import { CreatePaymentBrokenUseCase } from "../stages/01-duplicate-execution/broken/create-payment-broken.use-case";
import { CreatePaymentUniqueUseCase } from "../stages/01-duplicate-execution/fixed-with-unique/create-payment-unique.use-case";
import { CreatePaymentTransactionUseCase } from "../stages/02-atomicity/fixed-with-transaction/create-payment-transaction.use-case";
import { CreatePaymentSafeBoundaryUseCase } from "../stages/03-transaction-boundary/safer-boundary/create-payment-safe-boundary.use-case";
import { CreatePaymentExternalBrokenUseCase } from "../stages/03-transaction-boundary/broken-external-inside-transaction/create-payment-external-broken.use-case";
import { CreatePaymentOutboxPreviewUseCase } from "../stages/04-external-consistency/fixed-with-outbox-preview/create-payment-outbox-preview.use-case";

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
        private readonly createPaymentTransactionUseCase: CreatePaymentTransactionUseCase,
        private readonly createPaymentExternalBrokenUseCase: CreatePaymentExternalBrokenUseCase,
        private readonly createPaymentSafeBoundaryUseCase: CreatePaymentSafeBoundaryUseCase,
        private readonly createPaymentOutboxPreviewUseCase: CreatePaymentOutboxPreviewUseCase,
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

    @Post('stage-03/broken-external-inside-transaction/create-payment')
    brokenExternalInsideTransactionCreatePayment(@Body() body: CreatePaymentRequest) {
        return this.createPaymentExternalBrokenUseCase.execute(body);
    }

    @Post('stage-03/broken-external-inside-transaction/create-payment')
    fixedExternalInsideTransactionFixedWithTransactionCreatePayment(@Body() body: CreatePaymentRequest) {
        return this.createPaymentSafeBoundaryUseCase.execute(body);
    }

    @Post('stage-04/fixed-with-outbox-preview/create-payment')
    fixedWithOutboxPreviewCreatePayment(@Body() body: CreatePaymentRequest) {
        return this.createPaymentOutboxPreviewUseCase.execute(body);
    }
}