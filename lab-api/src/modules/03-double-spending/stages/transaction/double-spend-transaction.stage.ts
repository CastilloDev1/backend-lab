import { BadRequestException, Injectable } from '@nestjs/common';

import { SpendWalletRepository } from '../../infrastructure/postgres/spend-wallet.repository';

@Injectable()
export class DoubleSpendTransactionStage {
  constructor(private readonly spendWalletRepository: SpendWalletRepository) {}

  async execute(walletId: number, amount: number) {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const balanceRemaining =
      await this.spendWalletRepository.debitAndAppendLedger(walletId, amount);

    if (balanceRemaining === null) {
      throw new BadRequestException(
        'Balance insuficiente o wallet inexistente (misma transacción que el ledger).',
      );
    }

    return {
      stage: 'transaction',
      walletId,
      balanceRemaining,
      ledgerRecorded: true,
    };
  }
}
