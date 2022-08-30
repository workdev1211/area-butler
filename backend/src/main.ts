import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json } from 'body-parser';
const cloneBuffer = require('clone-buffer');

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ exposedHeaders: ['Content-Disposition'] });

  app.use(
    json({
      limit: '10mb',
      verify: (req: any, res, buf, encoding) => {
        if (req.headers['stripe-signature'] && Buffer.isBuffer(buf)) {
          req.rawBody = cloneBuffer(buf);
        }

        return true;
      },
    }),
  );

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

  app.useGlobalPipes(new ValidationPipe({ forbidUnknownValues: true }));
  await app.listen(process.env.PORT || 3000, process.env.HOST || '0.0.0.0');
}

bootstrap();
