import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../../domain/payment.entity';

@Injectable()
export class PaymentRepository {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
  ) {}

  async createPayment(accountId: number, amount: number, status: string): Promise<void> {
    await this.paymentRepo
    .createQueryBuilder()
    .insert()
    .into(Payment)
    .values({
      account_id: accountId,
      amount: amount,
      status: status,
    })
    .execute();
  }
}
