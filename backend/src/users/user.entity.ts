import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ nullable: true })
  name: string;

  // Profil entreprise (pour l'entete des devis/factures)
  @Column({ nullable: true })
  companyName: string;

  @Column({ nullable: true })
  siret: string;

  @Column({ nullable: true })
  vatNumber: string;

  @Column({ nullable: true, type: 'text' })
  address: string;

  @Column({ nullable: true })
  iban: string;

  @Column({ default: 30 })
  defaultPaymentTermsDays: number;

  @Column({ default: 0 })
  quoteCounter: number;

  @Column({ default: 0 })
  invoiceCounter: number;

  @CreateDateColumn()
  createdAt: Date;
}
