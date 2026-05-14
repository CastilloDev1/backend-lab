import { BadRequestException, Injectable } from '@nestjs/common';

import { DuplicateExecutionResult } from '../../domain/duplicate-execution.types';
import { IdempotenciaKeyRepository } from '../../infrastructure/postgres/idempotencia-key.repository';

/**
 * Misma reserva PROCESSING que idempotencia; luego crash simulado (sin débito ni payment).
 * La reserva está duplicada aquí a propósito para leer el flujo sin saltar a otro archivo.
 */
@Injectable()
export class PayIdempotentCrashStage {
  constructor(
    private readonly idempotenciaKeyRepository: IdempotenciaKeyRepository,
  ) {}

  async execute(
    _accountId: number,
    _amount: number,
    idempotenciaKey: string,
  ): Promise<DuplicateExecutionResult> {
    const insertRows = await this.idempotenciaKeyRepository.save(
      idempotenciaKey,
      'PROCESSING',
    );
    const isFirstRequest = insertRows.length > 0;

    if (!isFirstRequest) {
      const existingRows =
        await this.idempotenciaKeyRepository.getByIdempotenciaKey(
          idempotenciaKey,
        );
      const existing = existingRows[0];

      if (!existing) {
        throw new Error('Estado de idempotencia inconsistente');
      }

      if (existing.status === 'FAILED') {
        throw new Error(
          existing.error_message ??
            'La solicitud falló. Por favor, inténtelo de nuevo.',
        );
      }

      const now = Date.now();
      const createdAt = existing.created_at.getTime();
      const ageInSeconds = (now - createdAt) / 1000;

      if (existing.status === 'PROCESSING' && ageInSeconds > 60) {
        await this.idempotenciaKeyRepository.setOutcome(idempotenciaKey, {
          status: 'FAILED',
          errorMessage: 'PROCESSING_TIMEOUT',
        });
        throw new Error(
          'El tiempo de espera de la solicitud ha expirado. Por favor, inténtelo de nuevo.',
        );
      }

      if (existing.status === 'PROCESSING') {
        throw new BadRequestException('El pago ya está en proceso.');
      }

      if (existing.status === 'COMPLETED') {
        const parsed = existing.response as DuplicateExecutionResult;
        return {
          ...parsed,
          stage: 'crash',
        };
      }
    }

    throw new Error(
      'Simulated crash after idempotency key reserved (PROCESSING).',
    );
  }
}
