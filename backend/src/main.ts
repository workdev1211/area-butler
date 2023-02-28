import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json } from 'body-parser';
import { resolve } from 'path';

import { AppModule } from './app.module';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const cloneBuffer = require('clone-buffer');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
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

  app.useStaticAssets(resolve('./src/public'));
  app.setBaseViewsDir(resolve('./src/views'));
  app.setViewEngine('hbs');

  app.useGlobalPipes(new ValidationPipe({ forbidUnknownValues: true }));
  await app.listen(process.env.PORT || 3000, process.env.HOST || '0.0.0.0');
}

void bootstrap();
