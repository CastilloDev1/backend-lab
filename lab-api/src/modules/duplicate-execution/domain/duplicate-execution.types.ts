import { Account } from "./account.entity";

export type DuplicateExecutionScenario = 'problem' | 'idempotent-execution';

export interface DuplicateExecutionCommand {
  accountId: number;
  amount: number;
  idempotenciaKey: string;
}

export interface DuplicateExecutionResult {
  scenario: DuplicateExecutionScenario;
  result: {
    status: string;
    account: Account;
  };
}
