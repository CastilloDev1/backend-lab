import { Body, Controller, Post, Query } from '@nestjs/common';

import type {
  DuplicateExecutionCommand,
  DuplicateExecutionScenario,
} from '../domain/duplicate-execution.types';
import { ScenarioRouterService } from './scenario-router.service';

@Controller('duplicate-executions')
export class DuplicateExecutionController {
  constructor(private readonly scenarioRouterService: ScenarioRouterService) {}

  @Post()
  execute(
    @Body() body: DuplicateExecutionCommand,
    @Query('scenario') scenario: DuplicateExecutionScenario = 'problem',
  ) {
    return this.scenarioRouterService.execute(scenario, body);
  }
}
