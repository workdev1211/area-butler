import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Exclude, Expose, Transform, Type } from 'class-transformer';

import {
  ApiEnergyEfficiency,
  ApiFurnishing,
  ApiRealEstateCharacteristics,
  ApiRealEstateCost,
  ApiRealEstateCostType,
  ApiRealEstateStatusEnum,
  IApiRealEstateListingSchema,
} from '@area-butler-types/real-estate';
import { GeoJsonPoint } from '../../shared/geo-json.types';
import { IApiIntegrationParams } from '@area-butler-types/integration';
import ApiRealEstateCostDto from '../../dto/api-real-estate-cost.dto';
import ApiRealEstateCharacteristicsDto from '../../dto/api-real-estate-characteristics.dto';
import ApiGeoJsonPointDto from '../../dto/api-geo-json-point.dto';
import ApiIntegrationParamsDto from '../../dto/api-integration-params.dto';

@Exclude()
class OnOfficeEstateToAreaButlerEstateDto
  implements IApiRealEstateListingSchema
{
  @Expose()
  @IsOptional()
  @IsString()
  userId?: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @Transform(({ obj: { objekttitel } }): string => objekttitel, {
    toClassOnly: true,
  })
  name: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }): string => value, { toClassOnly: true })
  address: string;

  @Expose()
  @IsOptional()
  @IsString()
  externalUrl?: string;

  @Expose()
  @IsOptional()
  @IsDate()
  createdAt?: Date;

  @Expose()
  @IsOptional()
  @IsBoolean()
  showInSnippet?: boolean;

  @Expose()
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiRealEstateCostDto)
  @Transform(
    ({
      obj: { kaufpreis, waehrung, kaltmiete, warmmiete },
    }): ApiRealEstateCost => {
      const price = +kaufpreis;
      const coldPrice = +kaltmiete;
      const warmPrice = +warmmiete;
      const currency = waehrung === 'EUR' ? '€' : waehrung;

      if (price) {
        return {
          price: { amount: price, currency },
          type: ApiRealEstateCostType.SELL,
        };
      }

      if (coldPrice) {
        return {
          price: { amount: price, currency },
          type: ApiRealEstateCostType.RENT_MONTHLY_COLD,
        };
      }

      if (warmPrice) {
        return {
          price: { amount: price, currency },
          type: ApiRealEstateCostType.RENT_MONTHLY_WARM,
        };
      }

      return undefined;
    },
    { toClassOnly: true },
  )
  costStructure?: ApiRealEstateCost;

  @Expose()
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiRealEstateCharacteristicsDto)
  @Transform(
    ({
      obj: {
        anzahl_zimmer,
        wohnflaeche,
        grundstuecksflaeche,
        energyClass,
        anzahl_balkone,
        unterkellert,
      },
    }): ApiRealEstateCharacteristics => {
      const characteristics = {
        furnishing: [],
      } as ApiRealEstateCharacteristics;

      if (+anzahl_zimmer) {
        characteristics.numberOfRooms = +anzahl_zimmer;
      }

      if (+wohnflaeche) {
        characteristics.realEstateSizeInSquareMeters = +wohnflaeche;
      }

      if (+grundstuecksflaeche) {
        characteristics.propertySizeInSquareMeters = +grundstuecksflaeche;
      }

      if (
        energyClass &&
        Object.values(ApiEnergyEfficiency).includes(energyClass)
      ) {
        characteristics.energyEfficiency = energyClass;
      }

      if (anzahl_balkone) {
        characteristics.furnishing.push(ApiFurnishing.BALCONY);
      }

      if (unterkellert) {
        characteristics.furnishing.push(ApiFurnishing.BASEMENT);
      }

      return Object.keys(characteristics).length === 1 &&
        characteristics.furnishing.length === 0
        ? undefined
        : characteristics;
    },
    { toClassOnly: true },
  )
  characteristics?: ApiRealEstateCharacteristics;

  @Expose()
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiGeoJsonPointDto)
  @Transform(({ value }): GeoJsonPoint => value, { toClassOnly: true })
  location: GeoJsonPoint;

  @Expose()
  @IsOptional()
  @IsEnum(ApiRealEstateStatusEnum)
  status?: ApiRealEstateStatusEnum;

  @Expose()
  @IsOptional()
  @IsString()
  externalId?: string;

  @Expose()
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiIntegrationParamsDto)
  @Transform(({ value }): IApiIntegrationParams => value, { toClassOnly: true })
  integrationParams?: IApiIntegrationParams;
}

export default OnOfficeEstateToAreaButlerEstateDto;
