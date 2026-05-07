export type PaymentScenario = 'problem' | 'idempotency' | 'distributed-lock' | 'idem-lock';

export interface PaymentCommand {
  userId: string;
  amount: number;
  externalId?: string;
}

export interface PaymentResult {
  scenario: PaymentScenario;
  balance: number;
}
