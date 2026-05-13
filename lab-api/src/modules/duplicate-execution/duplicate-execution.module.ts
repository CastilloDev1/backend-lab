import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DuplicateExecutionController } from './controller/duplicate-execution.controller';
import { ScenarioRouterService } from './controller/scenario-router.service';
import { Account } from './domain/account.entity';
import { Payment } from './domain/payment.entity';
import { AccountRepository } from './infrastructure/postgres/account.repository';
import { PaymentRepository } from './infrastructure/postgres/payment.repository';
import { DuplicateExecutionSeederService } from './infrastructure/seed/duplicate-execution-seeder.service';
import { ProblemScenarioService } from './scenarios/problem.service';
import { IdempotentExecutionScenarioService } from './scenarios/solutions/idempotent-execution.service';
import { IdempotenciaKeyRepository } from './infrastructure/postgres/idempotencia-key.repository';
import { IdempotenciaKey } from './domain/idempotencia-key.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Account, Payment, IdempotenciaKey])],
  controllers: [DuplicateExecutionController],
  providers: [
    ScenarioRouterService,
    ProblemScenarioService,
    IdempotentExecutionScenarioService,
    IdempotenciaKeyRepository,
    AccountRepository,
    PaymentRepository,
    DuplicateExecutionSeederService,
  ],
})
export class DuplicateExecutionModule {}
