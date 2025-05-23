import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import { resolve } from 'path';
import * as Sentry from '@sentry/node';

import { AppModule } from './app.module';
import { configService } from './config/config.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const cloneBuffer = require('clone-buffer');

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger:
      configService.getSystemEnv() !== 'prod'
        ? ['log', 'error', 'warn', 'debug', 'verbose']
        : ['log', 'error', 'warn', 'debug'],
  });

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENV,
    tracesSampleRate: 1.0,
    debug: true,
  });

  app.enableCors({ exposedHeaders: ['Content-Disposition'] });

  app.use([
    json({
      limit: '20mb',
      verify: (req: any, res, buf, encoding) => {
        if (req.headers['stripe-signature'] && Buffer.isBuffer(buf)) {
          req.rawBody = cloneBuffer(buf);
        }

        return true;
      },
    }),
    urlencoded({ extended: true, limit: '20mb' }),
  ]);

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .addBearerAuth()
      .setTitle('AreaButler')
      .setDescription('The AreaButler API description')
      .setVersion('1.0')
      .addTag('areabutler')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  app.useStaticAssets(resolve('./src/public'));
  app.setBaseViewsDir(resolve('./src/views'));
  app.setViewEngine('hbs');

  app.useGlobalPipes(
    new ValidationPipe({
      forbidUnknownValues: true,
      transform: true,
      transformOptions: { exposeUnsetFields: false },
    }),
  );

  await app.listen(process.env.PORT || 3000, process.env.HOST || '0.0.0.0');
}

void bootstrap();
