import { BadRequestException, Injectable } from '@nestjs/common';

import { SpendWalletRepository } from '../../infrastructure/postgres/spend-wallet.repository';

@Injectable()
export class DoubleSpendAtomicStage {
  constructor(private readonly spendWalletRepository: SpendWalletRepository) {}

  async execute(walletId: number, amount: number) {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const balance = await this.spendWalletRepository.atomicDebit(walletId, amount);

    if (balance === null) {
      throw new BadRequestException('Balance insuficiente o wallet inexistente');
    }

    return {
      stage: 'atomic-balance-update',
      walletId,
      balanceRemaining: balance,
    };
  }
}
