import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { DataSource } from "typeorm";

type CreatePaymentTransactionInput = {
    accountId: number;
    amount: number;
    externalReference: string;
}

@Injectable()
export class CreatePaymentSafeBoundaryUseCase {
    constructor(
        private readonly dataSource: DataSource
    ){ }

    async execute(input: CreatePaymentTransactionInput){

        //Llamada externa fuera de la transaccion para simular un proceso externo
        await new Promise((resolve) => setTimeout(resolve, 5000));

        //Creamos un query runner para manejar la transaccion
        const queryRunner = this.dataSource.createQueryRunner();

        //Conectamos al query runner
        await queryRunner.connect();

        //Iniciamos la transaccion
        await queryRunner.startTransaction();

        try {
            const account = await queryRunner.query(
                `
                SELECT id, balance
                FROM account
                WHERE id = $1
                `,
                [input.accountId]
            );
    
            if ( account.length === 0 ) {
                throw new NotFoundException('Account not found');
            }

            await queryRunner.query(
                `
                UPDATE account
                SET balance = balance - $1
                WHERE id = $2
                `,
                [input.amount, input.accountId]
            );
            
            const payment = await queryRunner.query(
                `
                INSERT INTO payment (
                    account_id, 
                    amount, 
                    external_reference
                )
                    VALUES ($1, $2, $3)
                    RETURNING id, account_id, amount, external_reference, created_at
                `,
                [input.accountId, input.amount, input.externalReference]
            );

            await queryRunner.commitTransaction();

            return {
                message: 'Payment created with transaction',
                paymentId: payment[0],
            };

        } catch (error) {
            //Si ocurre un error, revertimos la transaccion
            await queryRunner.rollbackTransaction();

            if(error.code === '23505'){
                throw new ConflictException('Duplicate payment detected');
            }

            throw error;
        } finally {
            //Cerramos el query runner
            await queryRunner.release();
        }
    }
}