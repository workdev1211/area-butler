import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class MongoParamPipe implements PipeTransform {
  transform(paramValue: string): number {
    return +paramValue || 0;
  }
}
