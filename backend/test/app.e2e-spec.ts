import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { configService } from '../src/config/config.service';

describe('Config', () => {
    let mongod: MongoMemoryServer;
    let app: INestApplication;
  
    beforeAll(async () => {
      mongod = await MongoMemoryServer.create({instance:{port:27097}});

      const uri = mongod.getUri();

      const moduleRef = await Test.createTestingModule({
        imports: [AppModule],
      })
        .compile();
  
      app = moduleRef.createNestApplication();
      await app.init();
    });
  
    it(`/GET config`, () => {
      return request(app.getHttpServer())
        .get('/api/config')
        .expect(200)
        .expect(configService.getFrontendConfig());
    });
  
    afterAll(async () => {
      await app.close();
      await mongod.stop();
    });
  });