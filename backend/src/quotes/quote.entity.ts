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

export type QuoteStatus = 'brouillon' | 'envoye' | 'accepte' | 'refuse';

@Entity('quotes')
export class Quote {
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
  status: QuoteStatus;

  @Column({ type: 'date', nullable: true })
  validUntil: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Lightweight e-signature audit trail, captured when a client accepts via
  // the public link (see QuotesService.updateStatusByToken) -- gives the
  // owner something to point to if a client later disputes having agreed,
  // without building a full qualified e-signature integration.
  @Column({ type: 'varchar', length: 200, nullable: true })
  acceptedByName: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  acceptedAt: Date | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  acceptedIp: string | null;

  @Column({ type: 'text', nullable: true })
  acceptedUserAgent: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
