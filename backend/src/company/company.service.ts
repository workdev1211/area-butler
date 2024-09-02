import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';

import { Company, TCompanyDocument } from './schema/company.schema';

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
}
