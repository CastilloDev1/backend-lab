import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Account } from "../../domain/account.entity";

@Injectable()
export class AccountSeederService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.accountRepo.upsert([{ ownerName: 'Andrés Castillo', balance: 100000 }], ['id']);
    console.log('ACCOUNT SEED READY');
  }
}
