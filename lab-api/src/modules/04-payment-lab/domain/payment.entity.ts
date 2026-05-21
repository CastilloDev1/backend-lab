import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Payment {

    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ name: 'account_id', type: 'integer' })
    accountId: number;

    @Column({ type: 'integer' })
    amount: number;

    @Column({ name: 'external_reference', type: 'varchar', length: 120, unique: true })
    externalReference: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

}
