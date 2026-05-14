import { Account } from './account.entity';

export type DuplicateExecutionStage =
  | 'broken'
  | 'idempotency'
  | 'crash'
  | 'states';

export type PaymentOperationState =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED';

export interface PayBrokenBody {
  accountId: number;
  amount: number;
}

export interface PayWithIdempotencyBody {
  accountId: number;
  amount: number;
  idempotenciaKey: string;
}

export interface PayStatesBody {
  accountId: number;
  amount: number;
  operationKey: string;
}

export interface DuplicateExecutionResult {
  stage: DuplicateExecutionStage;
  result: {
    status: string;
    account?: Account;
    operationState?: PaymentOperationState;
    operationKey?: string;
  };
}
