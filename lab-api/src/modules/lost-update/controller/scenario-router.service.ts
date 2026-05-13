import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductCommand, ProductResult, ProductScenario } from '../domain/product.types';
import { ProblemScenarioService } from '../scenarios/problem.service';
import { AtomicUpdateScenarioService } from '../scenarios/solutions/atomic-update.service';

@Injectable()
export class ScenarioRouterService {
  
  constructor(
    private readonly problemScenarioService: ProblemScenarioService,
    private readonly atomicUpdateScenarioService: AtomicUpdateScenarioService,
  ) {}

  execute(scenario: ProductScenario, command: ProductCommand): Promise<ProductResult> {
    if (scenario === 'problem') {
      return this.problemScenarioService.execute(command);
    }

    if (scenario === 'atomic-update') {
      return this.atomicUpdateScenarioService.execute(command);
    }

    throw new NotFoundException(`Escenario "${scenario}" no implementado aún`);
  }
}