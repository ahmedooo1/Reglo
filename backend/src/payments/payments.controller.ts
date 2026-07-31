import { Controller, Headers, Param, Post, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('invoice/:token/checkout-session')
  createCheckoutSession(@Param('token') token: string) {
    return this.paymentsService.createCheckoutSessionForToken(token);
  }

  @Post('webhook')
  async webhook(@Req() req: any, @Headers('stripe-signature') signature: string) {
    const event = this.paymentsService.constructEvent(req.rawBody, signature);
    await this.paymentsService.handleWebhookEvent(event);
    return { received: true };
  }
}
