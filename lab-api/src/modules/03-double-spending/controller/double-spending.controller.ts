import { Body, Controller, Post } from '@nestjs/common';

import { DoubleSpendBrokenStage } from '../stages/broken/double-spend-broken.stage';
import { DoubleSpendAtomicStage } from '../stages/atomic-balance-update/double-spend-atomic.stage';
import { DoubleSpendTransactionStage } from '../stages/transaction/double-spend-transaction.stage';

interface DoubleSpendBody {
  walletId?: number;
  amount: number;
}

@Controller('double-spending')
export class DoubleSpendingController {
  constructor(
    private readonly broken: DoubleSpendBrokenStage,
    private readonly atomic: DoubleSpendAtomicStage,
    private readonly transaction: DoubleSpendTransactionStage,
  ) {}

  @Post('broken/pay')
  brokenPay(@Body() body: DoubleSpendBody) {
    return this.broken.execute(body.walletId ?? 1, body.amount);
  }

  @Post('atomic-balance-update/pay')
  atomicPay(@Body() body: DoubleSpendBody) {
    return this.atomic.execute(body.walletId ?? 1, body.amount);
  }

  @Post('transaction/pay')
  transactionPay(@Body() body: DoubleSpendBody) {
    return this.transaction.execute(body.walletId ?? 1, body.amount);
  }
}
