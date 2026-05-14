import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SpendWallet } from '../../domain/spend-wallet.entity';

@Injectable()
export class DoubleSpendingSeederService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(SpendWallet)
    private readonly repo: Repository<SpendWallet>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.repo.upsert([{ id: 1, balance: 200 }], ['id']);
    console.log('DOUBLE SPENDING READY: wallet id=1 balance=200');
  }
}
