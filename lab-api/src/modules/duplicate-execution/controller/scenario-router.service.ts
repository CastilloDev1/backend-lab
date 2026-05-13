import { Injectable, NotFoundException } from '@nestjs/common';

import {
    DuplicateExecutionCommand,
    DuplicateExecutionResult,
    DuplicateExecutionScenario,
} from '../domain/duplicate-execution.types';
import { ProblemScenarioService } from '../scenarios/problem.service';
import { IdempotentExecutionScenarioService } from '../scenarios/solutions/idempotent-execution.service';

@Injectable()
export class ScenarioRouterService {
    constructor(
        private readonly problemScenarioService: ProblemScenarioService,
        private readonly idempotentExecutionScenarioService: IdempotentExecutionScenarioService,
    ) { }

    execute(
        scenario: DuplicateExecutionScenario,
        command: DuplicateExecutionCommand,
    ): Promise<DuplicateExecutionResult> {
        if (scenario === 'problem') {
            return this.problemScenarioService.execute(command.accountId, command.amount);
        }

        if (scenario === 'idempotent-execution') {
            return this.idempotentExecutionScenarioService.execute(command.accountId, command.amount, command.idempotenciaKey);
        }

        throw new NotFoundException(`Escenario "${scenario}" no implementado aún`);
    }
}
