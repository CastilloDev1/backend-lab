import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ToctouCredit } from '../../domain/toctou-credit.entity';

@Injectable()
export class ToctouCreditRepository {
  constructor(
    @InjectRepository(ToctouCredit)
    private readonly repo: Repository<ToctouCredit>,
  ) {}

  findById(id: number): Promise<ToctouCredit | null> {
    return this.repo.findOneBy({ id });
  }

  save(row: ToctouCredit): Promise<ToctouCredit> {
    return this.repo.save(row);
  }

  async conditionalConsume(id: number, amount: number): Promise<number | null> {
    const result = await this.repo
      .createQueryBuilder()
      .update(ToctouCredit)
      .set({ credits: () => 'credits - :amount' })
      .where('id = :id', { id })
      .andWhere('credits >= :amount')
      .setParameter('amount', amount)
      .returning(['credits'])
      .execute();

    const row = result.raw[0] as { credits?: number } | undefined;
    return row?.credits ?? null;
  }
}
