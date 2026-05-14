import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SpendLedger } from '../../domain/spend-ledger.entity';
import { SpendWallet } from '../../domain/spend-wallet.entity';

@Injectable()
export class SpendWalletRepository {
  constructor(
    @InjectRepository(SpendWallet)
    private readonly repo: Repository<SpendWallet>,
  ) {}

  findById(id: number): Promise<SpendWallet | null> {
    return this.repo.findOneBy({ id });
  }

  save(row: SpendWallet): Promise<SpendWallet> {
    return this.repo.save(row);
  }

  async atomicDebit(walletId: number, amount: number): Promise<number | null> {
    const result = await this.repo
      .createQueryBuilder()
      .update(SpendWallet)
      .set({ balance: () => 'balance - :amount' })
      .where('id = :id', { id: walletId })
      .andWhere('balance >= :amount')
      .setParameter('amount', amount)
      .returning(['balance'])
      .execute();

    const row = result.raw[0] as { balance?: number } | undefined;
    return row?.balance ?? null;
  }

  /**
   * Débito + fila de ledger en una sola transacción de base de datos.
   */
  async debitAndAppendLedger(
    walletId: number,
    amount: number,
  ): Promise<number | null> {
    return this.repo.manager.transaction(async (manager) => {
      const updateResult = await manager
        .createQueryBuilder()
        .update(SpendWallet)
        .set({ balance: () => 'balance - :amount' })
        .where('id = :id', { id: walletId })
        .andWhere('balance >= :amount')
        .setParameter('amount', amount)
        .returning(['balance'])
        .execute();

      const raw = updateResult.raw[0] as { balance?: number } | undefined;
      if (raw?.balance === undefined) {
        return null;
      }

      await manager.getRepository(SpendLedger).insert({
        walletId,
        amount,
      });

      return raw.balance;
    });
  }
}
