import { Injectable, UnsupportedMediaTypeException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';

import { Company, TCompanyDocument } from './schema/company.schema';
import {
  ICompanyConfig,
  TCompanyExportMatch,
  TCompConfBase64Key,
} from '@area-butler-types/company';
import { compConfBase64Keys } from '../../../shared/constants/company';
import { isBase64Image } from '../shared/decorators/is-base64-image.decorator';
import { AreaButlerExportTypesEnum } from '@area-butler-types/types';

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
    { _id: companyDbId, config }: TCompanyDocument,
    newConfig: ICompanyConfig,
  ): Promise<void> {
    const updateQuery: UpdateQuery<TCompanyDocument> = Object.entries(
      newConfig,
    ).reduce(
      (result, [key, value]) => {
        let resultValue = value;

        if (key === 'exportMatching') {
          resultValue = this.processExpMatch(
            config.exportMatching,
            resultValue,
          );
        }

        if (!resultValue) {
          result.$unset[`config.${key}`] = 1;
          return result;
        }

        if (
          compConfBase64Keys.includes(key as TCompConfBase64Key) &&
          !isBase64Image(resultValue)
        ) {
          throw new UnsupportedMediaTypeException();
        }

        result.$set[`config.${key}`] = resultValue;

        return result;
      },
      {
        $set: {},
        $unset: {},
      },
    );

    await this.updateOne({ _id: companyDbId }, updateQuery);
  }

  private processExpMatch(
    oldExpMatch: TCompanyExportMatch | undefined,
    newExpMatch: TCompanyExportMatch | undefined,
  ): TCompanyExportMatch | undefined {
    const oldLinkWithAddress =
      oldExpMatch?.[AreaButlerExportTypesEnum.LINK_WITH_ADDRESS];
    const oldLinkWoAddress =
      oldExpMatch?.[AreaButlerExportTypesEnum.LINK_WO_ADDRESS];

    if (
      !oldLinkWithAddress?.isSpecialLink &&
      !oldLinkWoAddress?.isSpecialLink
    ) {
      return newExpMatch;
    }

    let resultExpMatch = newExpMatch;

    const newLinkWithAddress =
      resultExpMatch?.[AreaButlerExportTypesEnum.LINK_WITH_ADDRESS];
    const newLinkWoAddress =
      resultExpMatch?.[AreaButlerExportTypesEnum.LINK_WO_ADDRESS];

    const isNoResExpMatch =
      !resultExpMatch &&
      ((oldLinkWithAddress?.isSpecialLink && !newLinkWithAddress) ||
        (oldLinkWoAddress?.isSpecialLink && !newLinkWoAddress));

    if (isNoResExpMatch) {
      resultExpMatch = {};
    }
    if (oldLinkWithAddress?.isSpecialLink && !newLinkWithAddress) {
      resultExpMatch[AreaButlerExportTypesEnum.LINK_WITH_ADDRESS] =
        oldLinkWithAddress;
    }
    if (oldLinkWoAddress?.isSpecialLink && !newLinkWoAddress) {
      resultExpMatch[AreaButlerExportTypesEnum.LINK_WO_ADDRESS] =
        oldLinkWoAddress;
    }

    return resultExpMatch;
  }
}
