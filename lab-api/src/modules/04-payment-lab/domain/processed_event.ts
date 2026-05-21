import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('processed_event')
export class ProcessedEvent {

    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ name: 'outbox_event_id', type: 'integer', nullable: false, unique: true })
    outboxEventId: number;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

}