import { BadRequestException, Injectable } from '@nestjs/common';

import { SpendWalletRepository } from '../../infrastructure/postgres/spend-wallet.repository';

@Injectable()
export class DoubleSpendBrokenStage {
  constructor(private readonly spendWalletRepository: SpendWalletRepository) {}

  async execute(walletId: number, amount: number) {
    const wallet = await this.spendWalletRepository.findById(walletId);

    if (!wallet) {
      throw new BadRequestException('Wallet no encontrada');
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));

    if (wallet.balance < amount) {
      throw new BadRequestException('Balance insuficiente');
    }

    wallet.balance -= amount;
    await this.spendWalletRepository.save(wallet);

    return {
      stage: 'broken',
      walletId,
      balanceRemaining: wallet.balance,
    };
  }
}
