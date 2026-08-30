import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { generateDocumentPdf } from '../common/pdf/pdf.util';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: any, @Body() dto: CreateInvoiceDto) {
    return this.invoicesService.create(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req: any) {
    return this.invoicesService.findAllForOwner(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.invoicesService.findOneForOwner(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Req() req: any, @Body('status') status: any) {
    return this.invoicesService.updateStatus(id, req.user.id, status);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/send')
  sendToClient(@Param('id') id: string, @Req() req: any) {
    return this.invoicesService.sendToClient(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/pdf')
  async pdf(@Param('id') id: string, @Req() req: any, @Res() res: Response) {
    const invoice = await this.invoicesService.findOneWithOwner(id, req.user.id);
    if (!invoice) throw new NotFoundException('Facture introuvable');
    const buffer = await generateDocumentPdf({
      type: 'facture',
      number: invoice.number,
      date: invoice.createdAt,
      dueOrValidDate: invoice.dueDate ? new Date(invoice.dueDate) : undefined,
      company: invoice.owner,
      client: invoice.client,
      items: invoice.items,
      notes: invoice.notes,
    });
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename=${invoice.number}.pdf` });
    res.send(buffer);
  }

  @Get('public/:token')
  findByToken(@Param('token') token: string) {
    return this.invoicesService.findByToken(token);
  }

  @Get('public/:token/pdf')
  async publicPdf(@Param('token') token: string, @Res() res: Response) {
    const invoice = await this.invoicesService.findWithOwnerByToken(token);
    const buffer = await generateDocumentPdf({
      type: 'facture',
      number: invoice.number,
      date: invoice.createdAt,
      dueOrValidDate: invoice.dueDate ? new Date(invoice.dueDate) : undefined,
      company: invoice.owner,
      client: invoice.client,
      items: invoice.items,
      notes: invoice.notes,
    });
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename=${invoice.number}.pdf` });
    res.send(buffer);
  }
}
