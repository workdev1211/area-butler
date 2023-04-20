import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

import { RealEstateListingService } from '../real-estate-listing.service';

@Injectable()
export class InjectRealEstateListingInterceptor implements NestInterceptor {
  constructor(
    private readonly realEstateListingService: RealEstateListingService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const req = context.switchToHttp().getRequest();
    const { id: realEstateListingId } = req.params;
    const integrationUser = req.principal;

    req.realEstateListing =
      await this.realEstateListingService.fetchRealEstateListingById(
        integrationUser,
        realEstateListingId,
      );

    return next.handle();
  }
}
