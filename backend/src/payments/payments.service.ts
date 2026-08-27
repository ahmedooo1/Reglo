import { Injectable, NotFoundException } from '@nestjs/common';
import Stripe from 'stripe';
import { InvoicesService } from '../invoices/invoices.service';
import { computeTotals } from '../common/billing/billing.util';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(private readonly invoicesService: InvoicesService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
      apiVersion: '2024-06-20',
    });
  }

  async createCheckoutSessionForToken(token: string) {
    const invoice = await this.invoicesService.findByToken(token);
    if (!invoice) throw new NotFoundException('Facture introuvable');

    const totals = computeTotals(invoice.items);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3010';

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: { name: `Facture ${invoice.number}` },
            unit_amount: totals.totalCents,
          },
          quantity: 1,
        },
      ],
      metadata: { invoiceId: invoice.id },
      success_url: `${frontendUrl}/f/${token}?paiement=succes&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/f/${token}?paiement=annule`,
    });

    return { url: session.url };
  }

  async confirmSession(sessionId: string) {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);
    const invoiceId = session.metadata?.invoiceId;
    if (session.payment_status === 'paid' && invoiceId) {
      await this.invoicesService.markPaid(invoiceId);
      return { paid: true };
    }
    return { paid: false };
  }

  constructEvent(payload: Buffer, signature: string) {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || '',
    );
  }

  async handleWebhookEvent(event: Stripe.Event) {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const invoiceId = session.metadata?.invoiceId;
      if (invoiceId) {
        await this.invoicesService.markPaid(invoiceId);
      }
    }
  }
}
