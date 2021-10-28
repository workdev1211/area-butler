import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'body-parser';
const cloneBuffer = require('clone-buffer');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(json({
    verify: (req: any, res, buf, encoding) => {
      if (req.headers['stripe-signature'] && Buffer.isBuffer(buf)) {
      	req.rawBody = cloneBuffer(buf);
      }
      return true;
    },
}));
  await app.listen(process.env.PORT || 3000, process.env.HOST || '0.0.0.0');
}
bootstrap();
