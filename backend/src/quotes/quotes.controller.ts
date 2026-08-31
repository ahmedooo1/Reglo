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
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteStatusDto } from './dto/update-quote-status.dto';
import { generateDocumentPdf } from '../common/pdf/pdf.util';

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: any, @Body() dto: CreateQuoteDto) {
    return this.quotesService.create(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req: any) {
    return this.quotesService.findAllForOwner(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.quotesService.findOneForOwner(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Req() req: any, @Body('status') status: any) {
    return this.quotesService.updateStatus(id, req.user.id, status);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/send')
  sendToClient(@Param('id') id: string, @Req() req: any) {
    return this.quotesService.sendToClient(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/pdf')
  async pdf(@Param('id') id: string, @Req() req: any, @Res() res: Response) {
    const quote = await this.quotesService.findOneWithOwner(id, req.user.id);
    if (!quote) throw new NotFoundException('Devis introuvable');
    const buffer = await generateDocumentPdf({
      type: 'devis',
      number: quote.number,
      date: quote.createdAt,
      dueOrValidDate: quote.validUntil ? new Date(quote.validUntil) : undefined,
      company: quote.owner,
      client: quote.client,
      items: quote.items,
      notes: quote.notes,
    });
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename=${quote.number}.pdf` });
    res.send(buffer);
  }

  // Acces public pour le client (lien partage, sans authentification)
  @Get('public/:token')
  async findByToken(@Param('token') token: string) {
    const quote = await this.quotesService.findByToken(token);
    // acceptedIp/acceptedUserAgent are for the owner's audit trail only --
    // no reason to echo them back on the public, unauthenticated response.
    const { acceptedIp, acceptedUserAgent, ...publicQuote } = quote;
    return publicQuote;
  }

  @Patch('public/:token/status')
  updateStatusByToken(@Param('token') token: string, @Body() dto: UpdateQuoteStatusDto, @Req() req: any) {
    return this.quotesService.updateStatusByToken(token, dto, req.ip, req.headers['user-agent']);
  }

  @Get('public/:token/pdf')
  async publicPdf(@Param('token') token: string, @Res() res: Response) {
    const quote = await this.quotesService.findWithOwnerByToken(token);
    const buffer = await generateDocumentPdf({
      type: 'devis',
      number: quote.number,
      date: quote.createdAt,
      dueOrValidDate: quote.validUntil ? new Date(quote.validUntil) : undefined,
      company: quote.owner,
      client: quote.client,
      items: quote.items,
      notes: quote.notes,
    });
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename=${quote.number}.pdf` });
    res.send(buffer);
  }
}
