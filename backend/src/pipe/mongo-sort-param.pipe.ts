import { Injectable, PipeTransform } from '@nestjs/common';

import { MongoParamPipe } from './mongo-param.pipe';
import { IApiMongoParams } from '@area-butler-types/types';

@Injectable()
export class MongoSortParamPipe implements PipeTransform {
  constructor(private readonly mongoParamPipe: MongoParamPipe) {}

  transform(sort: string): IApiMongoParams {
    if (sort === undefined) {
      return undefined;
    }

    const parsedSort = JSON.parse(sort);

    Object.keys(parsedSort).forEach((key) => {
      parsedSort[key] = this.mongoParamPipe.transform(parsedSort[key]);
    });

    return parsedSort;
  }
}
