import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

type CreatePaymentProviderOkDbFailsInput = {
  accountId: number;
  amount: number;
  externalReference: string;
};

@Injectable()
export class CreatePaymentProviderOkDbFailsUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(input: CreatePaymentProviderOkDbFailsInput) {
    const providerResponse = await this.simulateProviderPayment(input);

    throw new Error(
      'Database failed after provider approved the payment',
    );

    await this.dataSource.query(
      `
      INSERT INTO payment_lab_payments (
        account_id,
        amount,
        external_reference
      )
      VALUES ($1, $2, $3)
      `,
      [input.accountId, input.amount, input.externalReference],
    );

    return {
      message: 'Payment registered',
      providerResponse,
    };
  }

  private async simulateProviderPayment(input: CreatePaymentProviderOkDbFailsInput) {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      providerPaymentId: `provider-${input.externalReference}`,
      status: 'APPROVED',
    };
  }
}