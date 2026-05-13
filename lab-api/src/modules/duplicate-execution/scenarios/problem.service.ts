import { Injectable } from '@nestjs/common';
import { DuplicateExecutionResult } from '../domain/duplicate-execution.types';
import { AccountRepository } from '../infrastructure/postgres/account.repository';
import { PaymentRepository } from '../infrastructure/postgres/payment.repository';

@Injectable()
export class ProblemScenarioService {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly paymentRepository: PaymentRepository,
  ) {}

  async execute(accountId: number, amount: number): Promise<DuplicateExecutionResult> {
    const account = await this.accountRepository.discountBalance(accountId, amount);
  
    if (!account) {
      throw new Error('Insufficient funds');
    }
  
    await this.paymentRepository.createPayment(accountId, amount, 'COMPLETED');

    return {
      scenario: 'problem',
      result: {
        status: 'payment_completed',
        account,
      },
    };
  }
}
