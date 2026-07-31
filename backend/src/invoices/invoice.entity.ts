import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Client } from '../clients/client.entity';

export type InvoiceStatus = 'brouillon' | 'envoyee' | 'payee';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  number: string;

  @Column({ unique: true })
  publicToken: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  owner: User;

  @ManyToOne(() => Client, { eager: true, onDelete: 'CASCADE' })
  client: Client;

  @Column('jsonb', { default: [] })
  items: { description: string; quantity: number; unitPriceCents: number; vatRate: number }[];

  @Column({ default: 'brouillon' })
  status: InvoiceStatus;

  @Column({ type: 'date', nullable: true })
  dueDate: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  sourceQuoteId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
