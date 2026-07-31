import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';
import { CreateClientDto } from './dto/create-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client) private readonly clientsRepo: Repository<Client>,
  ) {}

  findAllForOwner(ownerId: string) {
    return this.clientsRepo.find({
      where: { owner: { id: ownerId } },
      order: { name: 'ASC' },
    });
  }

  async findOneForOwner(id: string, ownerId: string) {
    const client = await this.clientsRepo.findOne({
      where: { id, owner: { id: ownerId } },
    });
    if (!client) throw new NotFoundException('Client introuvable');
    return client;
  }

  create(ownerId: string, dto: CreateClientDto) {
    const client = this.clientsRepo.create({ ...dto, owner: { id: ownerId } as any });
    return this.clientsRepo.save(client);
  }

  async update(id: string, ownerId: string, dto: Partial<CreateClientDto>) {
    await this.findOneForOwner(id, ownerId);
    await this.clientsRepo.update(id, dto);
    return this.findOneForOwner(id, ownerId);
  }

  async remove(id: string, ownerId: string) {
    await this.findOneForOwner(id, ownerId);
    await this.clientsRepo.delete(id);
    return { deleted: true };
  }
}
