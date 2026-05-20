import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { DataSource } from "typeorm";

type CreatePaymentOutboxPreviewInput = {
    accountId: number;
    amount: number;
    externalReference: string;
}

@Injectable()
export class CreatePaymentOutboxPreviewUseCase {

    constructor(
        private readonly dataSource: DataSource
    ){}

    async execute(input: CreatePaymentOutboxPreviewInput){

        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const account = await this.dataSource.query(
                `
                SELECT id
                FROM account
                WHERE id = $1
                `,
                [input.accountId]
            )

            if ( account.length === 0 ) {
                throw new NotFoundException('Account not found');
            }

            const payments = await this.dataSource.query(
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

            const payment = payments[0];

            await queryRunner.query(
                `
                INSERT INTO outbox_event (
                    event_type,
                    payload,
                    status
                )
                VALUES ($1, $2, $3)
                `,
                [
                    'PAYMENT_CREATED', 
                    { 
                        paymentId: payment.id,
                        accountId: payment.account_id,
                        amount: payment.amount,
                        externalReference: payment.external_reference,
                    }, 
                    'PENDING'
                ]
            );

            await queryRunner.commitTransaction();

            return {
                message: 'Payment created and outbox event created',
                payment,
            };

        } catch (error) {
            await queryRunner.rollbackTransaction();

            if(error.code === '23505'){
                throw new ConflictException('Duplicate payment detected');
            }

            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}