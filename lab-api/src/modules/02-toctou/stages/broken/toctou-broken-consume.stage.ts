import { BadRequestException, Injectable } from '@nestjs/common';

import { ToctouCreditRepository } from '../../infrastructure/postgres/toctou-credit.repository';

@Injectable()
export class ToctouBrokenConsumeStage {
  constructor(private readonly toctouCreditRepository: ToctouCreditRepository) {}

  async execute(resourceId: number, amount: number) {

    // 1. Leer el recurso
    const row = await this.toctouCreditRepository.findById(resourceId);

    if (!row) {
      throw new BadRequestException('Recurso no encontrado');
    }

    // 2. Esperar 3 segundos para simular una operación concurrente
    await new Promise((resolve) => setTimeout(resolve, 3000));

    if (row.credits < amount) {
      throw new BadRequestException('Créditos insuficientes (check TOCTOU)');
    }

    // 4. Restar la cantidad de créditos
    row.credits -= amount;

    // 5. Guardar el recurso
    await this.toctouCreditRepository.save(row);

    return {
      stage: 'broken',
      resourceId,
      creditsRemaining: row.credits,
    };
  }
}
