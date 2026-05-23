import { Body, Controller, Post } from "@nestjs/common";

import { CreatePaymentOutboxPreviewUseCase } from "../core/create-payment-outbox-preview.use-case";
import { ProcessOutboxEventsWorker } from "../core/process-outbox-events.worker";

type CreatePaymentRequest = {
    accountId: number;
    amount: number;
    externalReference: string;
}

@Controller('payment-lab')
export class PaymentLabController {
    constructor(
        private readonly createPaymentOutboxPreviewUseCase: CreatePaymentOutboxPreviewUseCase,
        private readonly processOutboxEventsWorker: ProcessOutboxEventsWorker,
    ){}

    @Post('payments')
    createPayment(@Body() body: CreatePaymentRequest) {
      return this.createPaymentOutboxPreviewUseCase.execute(body);
    }
  
    @Post('outbox/process-once')
    processOutboxOnce() {
      return this.processOutboxEventsWorker.processOnce(1);
    }

    @Post('outbox/process-batch')
    processOutboxBatch() {
      return this.processOutboxEventsWorker.processBatch(10);
    }
}