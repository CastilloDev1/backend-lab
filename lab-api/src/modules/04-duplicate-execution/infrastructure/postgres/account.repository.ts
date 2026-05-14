import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Account } from "../../domain/account.entity";


@Injectable()
export class AccountRepository {
    constructor(
        @InjectRepository(Account)
        private readonly accountRepo: Repository<Account>,
    ) {}

    findById(id: number): Promise<Account | null> {
        return this.accountRepo.findOneBy({ id });
    }

    async discountBalance(accountId: number, amount: number): Promise<Account> {
        const result = await this.accountRepo
        .createQueryBuilder()
        .update(Account)
        .set({ balance: () => 'balance - :amount' })
        .where('id = :id', { id: accountId })
        .andWhere('balance >= :amount')
        .setParameters({ amount: amount, id: accountId })
        .returning(['id', 'owner', 'balance'])
        .execute();

        return result.raw[0] as Account;
    }
}