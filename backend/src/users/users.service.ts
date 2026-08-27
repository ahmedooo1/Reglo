import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email } });
  }

  findById(id: string) {
    return this.usersRepo.findOne({ where: { id } });
  }

  async create(data: { email: string; passwordHash: string; name?: string }) {
    const user = this.usersRepo.create(data);
    return this.usersRepo.save(user);
  }

  async setEmailVerified(id: string) {
    await this.usersRepo.update(id, { emailVerified: true });
    return this.findById(id);
  }

  async updateProfile(id: string, data: Partial<User>) {
    await this.usersRepo.update(id, data);
    return this.findById(id);
  }

  async nextQuoteNumber(id: string) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    const year = new Date().getFullYear();
    const next = (user.quoteCounter || 0) + 1;
    await this.usersRepo.update(id, { quoteCounter: next });
    return `DEV-${year}-${String(next).padStart(4, '0')}`;
  }

  async nextInvoiceNumber(id: string) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    const year = new Date().getFullYear();
    const next = (user.invoiceCounter || 0) + 1;
    await this.usersRepo.update(id, { invoiceCounter: next });
    return `FAC-${year}-${String(next).padStart(4, '0')}`;
  }
}
