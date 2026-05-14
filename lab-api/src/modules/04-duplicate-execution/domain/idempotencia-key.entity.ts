import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class IdempotenciaKey {
    @PrimaryColumn()
    key: string;

    @Column({ type: 'varchar', nullable: false })
    status: string;

    @Column({ type: 'jsonb', nullable: true })
    response: object | null;

    @Column({ type: 'varchar', nullable: true })
    error_message: string | null;

    @CreateDateColumn({ type: 'timestamptz' , default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamptz', nullable: true })
    updated_at: Date;
}