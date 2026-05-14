import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SpendWallet } from './domain/spend-wallet.entity';
import { SpendLedger } from './domain/spend-ledger.entity';
import { DoubleSpendingController } from './controller/double-spending.controller';
import { SpendWalletRepository } from './infrastructure/postgres/spend-wallet.repository';
import { DoubleSpendingSeederService } from './infrastructure/seed/double-spending-seeder.service';
import { DoubleSpendBrokenStage } from './stages/broken/double-spend-broken.stage';
import { DoubleSpendAtomicStage } from './stages/atomic-balance-update/double-spend-atomic.stage';
import { DoubleSpendTransactionStage } from './stages/transaction/double-spend-transaction.stage';

@Module({
  imports: [TypeOrmModule.forFeature([SpendWallet, SpendLedger])],
  controllers: [DoubleSpendingController],
  providers: [
    SpendWalletRepository,
    DoubleSpendBrokenStage,
    DoubleSpendAtomicStage,
    DoubleSpendTransactionStage,
    DoubleSpendingSeederService,
  ],
})
export class DoubleSpendingModule {}
