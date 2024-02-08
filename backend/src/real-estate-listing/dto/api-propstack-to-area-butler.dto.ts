import {
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
  IApiRealEstateListingSchema,
} from '@area-butler-types/real-estate';
import { GeoJsonPoint } from '../../shared/geo-json.types';
import ApiIntegrationParamsDto from '../../dto/api-integration-params.dto';
import { IApiIntegrationParams } from '@area-butler-types/integration';
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
  @IsOptional()
  @IsString()
  userId?: string;

  @Expose()
  @IsOptional()
  @IsString()
  externalId?: string;

  @Expose()
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiIntegrationParamsDto)
  integrationParams?: IApiIntegrationParams;

  @Expose()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Expose()
  @IsNotEmpty()
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
  @IsString()
  address: string;

  @Expose()
  @IsNotEmpty()
  // currently we obtain and assign it by ourselves based on the provided address
  // @Transform(
  //   ({ obj: { lat, lng } }: { obj: IPropstackRealEstate }): GeoJsonPoint => ({
  //     type: 'Point',
  //     coordinates: [lat, lng],
  //   }),
  // )
  @IsObject()
  @ValidateNested()
  @Type(() => ApiGeoJsonPointDto)
  location: GeoJsonPoint;

  @Expose()
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiRealEstateCostDto)
  costStructure?: ApiRealEstateCost;

  @Expose()
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiRealEstateCharacteristicsDto)
  characteristics?: ApiRealEstateCharacteristics;

  @Expose()
  @IsOptional()
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
  @IsString()
  status?: string;

  @Expose()
  @IsOptional()
  @IsString()
  status2?: string;
}

export default ApiPropstackToAreaButlerDto;
