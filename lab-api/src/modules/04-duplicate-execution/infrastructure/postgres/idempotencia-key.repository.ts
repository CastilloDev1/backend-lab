import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { IdempotenciaKey } from "../../domain/idempotencia-key.entity";

/** Resultado terminal de una clave de idempotencia: o payload exitoso o mensaje de error. */
export type IdempotenciaKeyOutcome =
    | { status: 'COMPLETED'; response: object }
    | { status: 'FAILED'; errorMessage: string };

@Injectable()
export class IdempotenciaKeyRepository {
    constructor(
        @InjectRepository(IdempotenciaKey)
        private readonly idempotenciaKeyRepo: Repository<IdempotenciaKey>,
    ) { }

    async save(idempotenciaKey: string, status: string): Promise<IdempotenciaKey[]> {
        try {
            const result = await this.idempotenciaKeyRepo
            .createQueryBuilder()
            .insert()
            .into(IdempotenciaKey)
            .values({ key: idempotenciaKey, status: status })
            .orIgnore("key")
            .returning("key, status")
            .execute();

            return result.raw as IdempotenciaKey[];
        } catch (error) {
            console.log(error);
            throw new Error('Error al guardar la clave de idempotencia');
        }
    }

    async getByIdempotenciaKey(idempotenciaKey: string): Promise<IdempotenciaKey[]> {
        try {
            return this.idempotenciaKeyRepo.findBy({ key: idempotenciaKey });
        }
        catch (error) {
            throw new Error('Error al obtener la clave de idempotencia');
        }
    }

    /**
     * Actualiza estado terminal: `COMPLETED` solo escribe `response`;
     * `FAILED` solo escribe `error_message`. La otra columna queda en null.
     */
    async setOutcome(
        idempotenciaKey: string,
        outcome: IdempotenciaKeyOutcome,
    ): Promise<void> {
        try {
            const values =
                outcome.status === 'COMPLETED'
                    ? {
                          status: 'COMPLETED' as const,
                          response: outcome.response,
                          error_message: null,
                          updated_at: new Date(),
                      }
                    : {
                          status: 'FAILED' as const,
                          error_message: outcome.errorMessage,
                          response: null,
                          updated_at: new Date(),
                      };

            await this.idempotenciaKeyRepo.update({ key: idempotenciaKey }, values);
        } catch (error) {
            console.log(error);
            throw new Error('Error al actualizar el resultado de la clave de idempotencia');
        }
    }
}
