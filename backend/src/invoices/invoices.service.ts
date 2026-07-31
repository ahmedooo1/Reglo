import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { nanoid } from 'nanoid';
import { Invoice, InvoiceStatus } from './invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UsersService } from '../users/users.service';
import { ClientsService } from '../clients/clients.service';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice) private readonly invoicesRepo: Repository<Invoice>,
    private readonly usersService: UsersService,
    private readonly clientsService: ClientsService,
  ) {}

  private withComputed(invoice: Invoice) {
    const isOverdue =
      invoice.status === 'envoyee' &&
      !!invoice.dueDate &&
      new Date(invoice.dueDate) < new Date();
    return { ...invoice, isOverdue };
  }

  async create(ownerId: string, dto: CreateInvoiceDto) {
    const client = await this.clientsService.findOneForOwner(dto.clientId, ownerId);
    const number = await this.usersService.nextInvoiceNumber(ownerId);
    const invoice = this.invoicesRepo.create({
      number,
      publicToken: nanoid(16),
      owner: { id: ownerId } as any,
      client,
      items: dto.items,
      dueDate: dto.dueDate,
      notes: dto.notes,
      sourceQuoteId: dto.sourceQuoteId,
      status: 'brouillon',
    });
    return this.invoicesRepo.save(invoice);
  }

  async findAllForOwner(ownerId: string) {
    const invoices = await this.invoicesRepo.find({
      where: { owner: { id: ownerId } },
      order: { createdAt: 'DESC' },
    });
    return invoices.map((i) => this.withComputed(i));
  }

  async findOneForOwner(id: string, ownerId: string) {
    const invoice = await this.invoicesRepo.findOne({ where: { id, owner: { id: ownerId } } });
    if (!invoice) throw new NotFoundException('Facture introuvable');
    return this.withComputed(invoice);
  }

  async findByToken(token: string) {
    const invoice = await this.invoicesRepo.findOne({ where: { publicToken: token } });
    if (!invoice) throw new NotFoundException('Facture introuvable');
    return this.withComputed(invoice);
  }

  async findWithOwnerByToken(token: string) {
    const invoice = await this.invoicesRepo.findOne({
      where: { publicToken: token },
      relations: ['owner'],
    });
    if (!invoice) throw new NotFoundException('Facture introuvable');
    return invoice;
  }

  findOneRaw(id: string) {
    return this.invoicesRepo.findOne({ where: { id }, relations: ['owner'] });
  }

  async findOneWithOwner(id: string, ownerId: string) {
    return this.invoicesRepo.findOne({
      where: { id, owner: { id: ownerId } },
      relations: ['owner'],
    });
  }

  async updateStatus(id: string, ownerId: string, status: InvoiceStatus) {
    await this.findOneForOwner(id, ownerId);
    await this.invoicesRepo.update(id, { status });
    return this.findOneForOwner(id, ownerId);
  }

  async markPaid(invoiceId: string) {
    await this.invoicesRepo.update(invoiceId, { status: 'payee' });
    return this.invoicesRepo.findOne({ where: { id: invoiceId } });
  }
}
