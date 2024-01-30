import { Exclude, Expose, Transform, Type } from 'class-transformer';

import {
  ApiFurnishing,
  ApiRealEstateCharacteristics,
  ApiRealEstateCost,
  ApiRealEstateCostType,
  ApiUpsertRealEstateListing,
} from '@area-butler-types/real-estate';
import {
  IPropstackProcessedRealEstate,
  IPropstackRealEstate,
} from '../../shared/propstack.types';
import { GeoJsonPoint } from '../../shared/geo-json.types';
import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import ApiIntegrationParamsDto from '../../dto/api-integration-params.dto';
import { IApiIntegrationParams } from '@area-butler-types/integration';
import { propstackRealEstMarketTypeNames } from '../../../../shared/constants/propstack';
import ApiGeoJsonPointDto from '../../dto/api-geo-json-point.dto';
import ApiRealEstateCostDto from '../../dto/api-real-estate-cost.dto';
import ApiRealEstateCharacteristicsDto from '../../dto/api-real-estate-characteristics.dto';

@Exclude()
class ApiPropstackToAreaButlerDto implements ApiUpsertRealEstateListing {
  @Expose()
  @IsOptional()
  @IsString()
  userId?: string;

  @Expose()
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiIntegrationParamsDto)
  integrationParams?: IApiIntegrationParams;

  @Expose()
  @IsNotEmpty()
  @Transform(
    ({ obj: { name, title } }: { obj: IPropstackRealEstate }): string =>
      name || title,
    { toClassOnly: true },
  )
  @IsString()
  name: string;

  @Expose()
  @IsNotEmpty()
  @Transform(
    ({
      obj: {
        address,
        short_address,
        street,
        house_number,
        zip_code,
        city,
        region,
        country,
      },
    }: {
      obj: IPropstackRealEstate;
    }): string =>
      address ||
      short_address ||
      `${street} ${house_number}, ${zip_code} ${city || region}, ${country}`,
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

  // TODO should be expanded further
  // keep in mind that property structure with 'expand' option differs from the structure without it
  @Expose()
  @IsOptional()
  @Transform(
    ({
      obj: { price, base_rent: baseRent },
    }: {
      obj: IPropstackRealEstate;
    }): ApiRealEstateCost => {
      if (price) {
        const priceValue = (
          price !== null && typeof price === 'object' ? price.value : price
        ) as number;

        return priceValue
          ? {
              price: {
                amount: priceValue,
                currency: '€',
              },
              type: ApiRealEstateCostType.SELL,
            }
          : undefined;
      }

      if (baseRent) {
        const rentValue = (
          baseRent !== null && typeof baseRent === 'object'
            ? baseRent.value
            : baseRent
        ) as number;

        return rentValue
          ? {
              price: {
                amount: rentValue,
                currency: '€',
              },
              type: ApiRealEstateCostType.RENT_MONTHLY_COLD,
            }
          : undefined;
      }
    },
    { toClassOnly: true },
  )
  @IsObject()
  @ValidateNested()
  @Type(() => ApiRealEstateCostDto)
  costStructure?: ApiRealEstateCost;

  @Expose()
  @IsOptional()
  @Transform(
    ({
      obj: {
        number_of_rooms: numberOfRooms,
        living_space: realEstateSizeInSquareMeters,
        property_space_value: propertySizeInSquareMeters,
        furnishings,
      },
    }: {
      obj: IPropstackRealEstate;
    }): ApiRealEstateCharacteristics => {
      const furnishing = [];
      const characteristics: ApiRealEstateCharacteristics = { furnishing };

      if (numberOfRooms) {
        characteristics.numberOfRooms = numberOfRooms;
      }
      if (realEstateSizeInSquareMeters) {
        characteristics.realEstateSizeInSquareMeters =
          realEstateSizeInSquareMeters;
      }
      if (propertySizeInSquareMeters) {
        characteristics.propertySizeInSquareMeters = propertySizeInSquareMeters;
      }

      if (!furnishings) {
        return characteristics;
      }

      const {
        cellar,
        balcony,
        garden,
        kitchen_complete: fittedKitchen,
        ramp,
      } = furnishings;

      if (cellar) {
        furnishing.push(ApiFurnishing.BASEMENT);
      }
      if (balcony) {
        furnishing.push(ApiFurnishing.BALCONY);
      }
      if (garden) {
        furnishing.push(ApiFurnishing.GARDEN);
      }
      if (fittedKitchen) {
        furnishing.push(ApiFurnishing.FITTED_KITCHEN);
      }
      if (ramp) {
        furnishing.push(ApiFurnishing.ACCESSIBLE);
      }

      return characteristics;
    },
  )
  @IsObject()
  @ValidateNested()
  @Type(() => ApiRealEstateCharacteristicsDto)
  characteristics?: ApiRealEstateCharacteristics;

  @Expose()
  @IsOptional()
  // @Transform(
  //   ({ obj: { id } }: { obj: IPropstackRealEstate }): string => `${id}`,
  //   {
  //     toClassOnly: true,
  //   },
  // )
  @IsString()
  externalId?: string;

  @Expose()
  @IsOptional()
  @Transform(
    ({
      obj: { areaButlerStatus2, marketing_type: marketingType },
    }: {
      obj: IPropstackProcessedRealEstate;
    }): string =>
      areaButlerStatus2 ||
      (marketingType
        ? propstackRealEstMarketTypeNames.find(
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
  @Transform(
    ({
      obj: { status, property_status, areaButlerStatus },
    }: {
      obj: IPropstackProcessedRealEstate;
    }): string => areaButlerStatus || (status || property_status)?.name,
    {
      toClassOnly: true,
    },
  )
  @IsString()
  status2?: string;

  showInSnippet = true;
}

export default ApiPropstackToAreaButlerDto;
