import { Injectable, UnsupportedMediaTypeException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';

import { Company, TCompanyDocument } from './schema/company.schema';
import { ICompanyConfig, TCompConfBase64Key } from '@area-butler-types/company';
import { compConfBase64Keys } from '../../../shared/constants/company';
import { isBase64Image } from '../shared/decorators/is-base64-image.decorator';

@Injectable()
export class CompanyService {
  constructor(
    @InjectModel(Company.name)
    private readonly companyModel: Model<TCompanyDocument>,
  ) {}

  create(): Promise<TCompanyDocument> {
    return this.companyModel.create({});
  }

  async upsert(
    filterQuery: FilterQuery<TCompanyDocument>,
    updateQuery: UpdateQuery<TCompanyDocument>,
  ): Promise<TCompanyDocument> {
    return this.companyModel.findOneAndUpdate(filterQuery, updateQuery, {
      new: true,
      upsert: true,
    });
  }

  async updateOne(
    filterQuery: FilterQuery<TCompanyDocument>,
    updateQuery: UpdateQuery<TCompanyDocument>,
  ): Promise<void> {
    await this.companyModel.updateOne(filterQuery, updateQuery);
  }

  async updateConfig(
    companyDbId: Types.ObjectId,
    config: ICompanyConfig,
  ): Promise<void> {
    const updateQuery: UpdateQuery<TCompanyDocument> = Object.entries(
      config,
    ).reduce(
      (result, [key, value]) => {
        if (value) {
          if (
            compConfBase64Keys.includes(key as TCompConfBase64Key) &&
            !isBase64Image(value)
          ) {
            throw new UnsupportedMediaTypeException();
          }

          result.$set[`config.${key}`] = value;
        } else {
          result.$unset[`config.${key}`] = 1;
        }

        return result;
      },
      {
        $set: {},
        $unset: {},
      },
    );

    await this.updateOne({ _id: companyDbId }, updateQuery);
  }
}
