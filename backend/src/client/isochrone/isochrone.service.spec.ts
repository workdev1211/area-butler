import { Test, TestingModule } from '@nestjs/testing';
import { IsochroneService } from './isochrone.service';

describe('IsochroneService', () => {
  let service: IsochroneService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IsochroneService],
    }).compile();

    service = module.get<IsochroneService>(IsochroneService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
