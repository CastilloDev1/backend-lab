import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('outbox_event')
export class OutBoxEvent {

    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ name: 'event_type', type: 'varchar', length: 120, nullable: false })

    eventType: string;

    @Column({ type: 'jsonb', nullable: false })
    payload: Record<string, unknown>;

    @Column({ type: 'varchar', length: 30, nullable: false })
    status: 'PENDING' | 'PROCESSED' | 'FAILED';
    
    @CreateDateColumn({ name: 'created_at', nullable: false })
    createdAt: Date;
}