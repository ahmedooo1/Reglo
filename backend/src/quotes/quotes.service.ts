import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { nanoid } from 'nanoid';
import { Quote, QuoteStatus } from './quote.entity';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteStatusDto } from './dto/update-quote-status.dto';
import { UsersService } from '../users/users.service';
import { ClientsService } from '../clients/clients.service';
import { MailService } from '../mail/mail.service';

function quoteTotalLabel(items: Quote['items']) {
  let subtotal = 0;
  let vat = 0;
  for (const i of items) {
    const lineTotal = i.quantity * i.unitPriceCents;
    subtotal += lineTotal;
    vat += Math.round((lineTotal * i.vatRate) / 100);
  }
  return ((subtotal + vat) / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(Quote) private readonly quotesRepo: Repository<Quote>,
    private readonly usersService: UsersService,
    private readonly clientsService: ClientsService,
    private readonly mailService: MailService,
  ) {}

  async create(ownerId: string, dto: CreateQuoteDto) {
    const client = await this.clientsService.findOneForOwner(dto.clientId, ownerId);
    const number = await this.usersService.nextQuoteNumber(ownerId);
    const quote = this.quotesRepo.create({
      number,
      publicToken: nanoid(16),
      owner: { id: ownerId } as any,
      client,
      items: dto.items,
      validUntil: dto.validUntil,
      notes: dto.notes,
      status: 'brouillon',
    });
    return this.quotesRepo.save(quote);
  }

  findAllForOwner(ownerId: string) {
    return this.quotesRepo.find({
      where: { owner: { id: ownerId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneForOwner(id: string, ownerId: string) {
    const quote = await this.quotesRepo.findOne({ where: { id, owner: { id: ownerId } } });
    if (!quote) throw new NotFoundException('Devis introuvable');
    return quote;
  }

  async findByToken(token: string) {
    const quote = await this.quotesRepo.findOne({ where: { publicToken: token } });
    if (!quote) throw new NotFoundException('Devis introuvable');
    return quote;
  }

  async findWithOwnerByToken(token: string) {
    const quote = await this.quotesRepo.findOne({
      where: { publicToken: token },
      relations: ['owner'],
    });
    if (!quote) throw new NotFoundException('Devis introuvable');
    return quote;
  }

  async updateStatus(id: string, ownerId: string, status: QuoteStatus) {
    await this.findOneForOwner(id, ownerId);
    await this.quotesRepo.update(id, { status });
    return this.findOneForOwner(id, ownerId);
  }

  async updateStatusByToken(token: string, dto: UpdateQuoteStatusDto, ip?: string, userAgent?: string) {
    const quote = await this.findByToken(token);
    // Only a quote actually awaiting a response can be accepted/refused --
    // without this, the public endpoint would let anyone with the link
    // jump straight from 'brouillon' to 'accepte', or flip an already
    // accepted/refused quote back and forth.
    if (quote.status !== 'envoye') {
      throw new BadRequestException("Ce devis ne peut plus être accepté ou refusé dans son état actuel.");
    }

    if (dto.status === 'accepte') {
      const name = dto.name?.trim();
      if (!name || dto.consent !== true) {
        throw new BadRequestException('Merci de renseigner votre nom et de confirmer votre accord avant de continuer.');
      }
      await this.quotesRepo.update(quote.id, {
        status: 'accepte',
        acceptedByName: name,
        acceptedAt: new Date(),
        acceptedIp: ip || null,
        acceptedUserAgent: userAgent || null,
      });
    } else {
      await this.quotesRepo.update(quote.id, { status: 'refuse' });
    }
    return this.findByToken(token);
  }

  async findOneWithOwner(id: string, ownerId: string) {
    return this.quotesRepo.findOne({
      where: { id, owner: { id: ownerId } },
      relations: ['owner'],
    });
  }

  async sendToClient(id: string, ownerId: string) {
    const quote = await this.findOneWithOwner(id, ownerId);
    if (!quote) throw new NotFoundException('Devis introuvable');
    if (!quote.client.email) {
      throw new BadRequestException("Ce client n'a pas d'adresse email enregistrée");
    }
    const base = process.env.FRONTEND_URL || 'http://localhost:3010';
    await this.mailService.sendQuoteEmail({
      to: quote.client.email,
      companyName: quote.owner.companyName || quote.owner.name,
      number: quote.number,
      totalLabel: quoteTotalLabel(quote.items),
      viewUrl: `${base}/d/${quote.publicToken}`,
    });
    if (quote.status === 'brouillon') {
      await this.quotesRepo.update(id, { status: 'envoye' });
    }
    return this.findOneForOwner(id, ownerId);
  }
}
