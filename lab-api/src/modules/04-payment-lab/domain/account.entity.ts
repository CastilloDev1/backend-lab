import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Account {

    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ name: 'owner_name', type: 'varchar', length: 120 })
    ownerName: string;

    @Column({ type: 'integer' })
    balance: number;

}
