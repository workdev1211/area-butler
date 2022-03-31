import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'body-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
const cloneBuffer = require('clone-buffer');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(
    json({
      limit: '5mb',
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
      .setTitle('AreaButler')
      .setDescription('The Area Butler API description')
      .setVersion('1.0')
      .addTag('areabutler')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  await app.listen(process.env.PORT || 3000, process.env.HOST || '0.0.0.0');
}
bootstrap();
