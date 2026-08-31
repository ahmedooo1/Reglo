import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // The app only ever receives traffic from nginx on the same host (see
  // reverse-proxy config: proxy_pass http://127.0.0.1:3029), so trusting
  // exactly one proxy hop is safe and required for req.ip / the
  // X-Forwarded-For chain to reflect the real client IP instead of
  // nginx's own loopback address -- used for the quote-acceptance audit
  // trail in quotes.controller.ts.
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3010',
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT || 3011;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Reglo API running on http://localhost:${port}/api`);
}
bootstrap();
