import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';

@UseGuards(JwtAuthGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.clientsService.findAllForOwner(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.clientsService.findOneForOwner(id, req.user.id);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateClientDto) {
    return this.clientsService.create(req.user.id, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Req() req: any, @Body() dto: Partial<CreateClientDto>) {
    return this.clientsService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.clientsService.remove(id, req.user.id);
  }
}
