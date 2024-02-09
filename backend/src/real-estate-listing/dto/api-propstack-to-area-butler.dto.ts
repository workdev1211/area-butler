import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Exclude, Expose, Transform, Type } from 'class-transformer';

import {
  ApiRealEstateCharacteristics,
  ApiRealEstateCost,
  ApiRealEstateExtSourcesEnum,
  IApiRealEstateListingSchema,
} from '@area-butler-types/real-estate';
import { GeoJsonPoint } from '../../shared/geo-json.types';
import ApiIntegrationParamsDto from '../../dto/api-real-estate-integration-params.dto';
import { IApiRealEstateIntegrationParams } from '@area-butler-types/integration';
import { propstackPropertyMarketTypeNames } from '../../../../shared/constants/propstack';
import ApiGeoJsonPointDto from '../../dto/api-geo-json-point.dto';
import ApiRealEstateCostDto from '../../dto/api-real-estate-cost.dto';
import ApiRealEstateCharacteristicsDto from '../../dto/api-real-estate-characteristics.dto';
import {
  IPropstackProperty,
  IPropstackWebhookProperty,
  TPropstackProcProperty,
} from '../../shared/propstack.types';

@Exclude()
abstract class ApiPropstackToAreaButlerDto<
  T extends IPropstackProperty | IPropstackWebhookProperty,
> implements IApiRealEstateListingSchema
{
  @Expose()
  @Transform(
    ({
      obj: {
        address,
        // left just in case
        // short_address,
        // street,
        // house_number,
        // zip_code,
        // city,
        // region,
        // country,
      },
    }: {
      obj: TPropstackProcProperty<T>;
    }): string => address,
    // left just in case
    // address ||
    // short_address ||
    // `${street} ${house_number}, ${zip_code} ${city || region}, ${country}`,
    { toClassOnly: true },
  )
  @IsNotEmpty()
  @IsString()
  address: string;

  @Expose()
  @Type(() => ApiGeoJsonPointDto)
  // currently we obtain and assign it by ourselves based on the provided address
  // @Transform(
  //   ({ obj: { lat, lng } }: { obj: IPropstackRealEstate }): GeoJsonPoint => ({
  //     type: 'Point',
  //     coordinates: [lat, lng],
  //   }),
  // )
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  location: GeoJsonPoint;

  @Expose()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Expose()
  @Type(() => ApiIntegrationParamsDto)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  integrationParams?: IApiRealEstateIntegrationParams;

  @Expose()
  @IsOptional()
  @IsString()
  userId?: string;

  @Expose()
  @IsOptional()
  @IsEnum(ApiRealEstateExtSourcesEnum)
  externalSource?: ApiRealEstateExtSourcesEnum;

  @Expose()
  @IsOptional()
  @IsString()
  externalId?: string;

  @Expose()
  @IsOptional()
  @IsString()
  externalUrl?: string;

  @Expose()
  @Type(() => ApiRealEstateCharacteristicsDto)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  characteristics?: ApiRealEstateCharacteristics;

  @Expose()
  @Type(() => ApiRealEstateCostDto)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  costStructure?: ApiRealEstateCost;

  @Expose()
  @Transform(
    ({
      obj: { areaButlerStatus2, marketing_type: marketingType },
    }: {
      obj: TPropstackProcProperty<T>;
    }): string =>
      areaButlerStatus2 ||
      (marketingType
        ? propstackPropertyMarketTypeNames.find(
            ({ value }) => value === marketingType,
          )?.text
        : undefined),
    {
      toClassOnly: true,
    },
  )
  @IsOptional()
  @IsString()
  status?: string;

  @Expose()
  @IsOptional()
  @IsString()
  status2?: string;
}

export default ApiPropstackToAreaButlerDto;
