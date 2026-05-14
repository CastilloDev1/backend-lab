import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaymentOperation } from '../../domain/payment-operation.entity';

@Injectable()
export class PaymentOperationRepository {
  constructor(
    @InjectRepository(PaymentOperation)
    private readonly repo: Repository<PaymentOperation>,
  ) {}

  findByKey(operationKey: string): Promise<PaymentOperation | null> {
    return this.repo.findOneBy({ operationKey });
  }

  async tryInsertPending(op: {
    operationKey: string;
    accountId: number;
    amount: number;
  }): Promise<boolean> {
    try {
      await this.repo.insert({
        operationKey: op.operationKey,
        state: 'PENDING',
        accountId: op.accountId,
        amount: op.amount,
      });
      return true;
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code;
      if (code === '23505') {
        return false;
      }
      throw e;
    }
  }

  async markProcessingIfPending(operationKey: string): Promise<boolean> {
    const res = await this.repo.update(
      { operationKey, state: 'PENDING' },
      { state: 'PROCESSING' },
    );
    return (res.affected ?? 0) > 0;
  }

  async updateState(operationKey: string, state: string): Promise<void> {
    await this.repo.update({ operationKey }, { state });
  }
}
