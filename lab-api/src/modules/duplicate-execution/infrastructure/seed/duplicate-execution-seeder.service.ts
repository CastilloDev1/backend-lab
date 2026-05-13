import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Account } from '../../domain/account.entity';

@Injectable()
export class DuplicateExecutionSeederService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const seededAccounts: Array<Pick<Account, 'id' | 'owner' | 'balance'>> = [
      { id: 1, owner: 'Andres', balance: 200 },
    ];

    await this.accountRepo.upsert(seededAccounts, ['id']);

    console.log(
      `DUPLICATE EXECUTION READY: ${seededAccounts.length} cuentas seed con balance inicial de 200`,
    );
  }
}
