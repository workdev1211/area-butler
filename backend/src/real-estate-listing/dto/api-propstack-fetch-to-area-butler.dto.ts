import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Exclude, Expose, Transform, Type } from 'class-transformer';

import {
  ApiFurnishing,
  ApiRealEstateCharacteristics,
  ApiRealEstateCost,
  ApiRealEstateCostType,
} from '@area-butler-types/real-estate';
import ApiRealEstateCostDto from '../../dto/api-real-estate-cost.dto';
import ApiRealEstateCharacteristicsDto from '../../dto/api-real-estate-characteristics.dto';
import {
  IPropstackProperty,
  TPropstackProcProperty,
} from '../../shared/types/propstack';
import ApiPropstackToAreaButlerDto from './api-propstack-to-area-butler.dto';

@Exclude()
class ApiPropstackFetchToAreaButlerDto extends ApiPropstackToAreaButlerDto<IPropstackProperty> {
  @Expose()
  @Transform(
    ({
      obj: { address, name, title },
    }: {
      obj: TPropstackProcProperty<IPropstackProperty>;
    }): string => name || title || address,
    { toClassOnly: true },
  )
  @IsNotEmpty()
  @IsString()
  name: string;

  @Expose()
  @Type(() => ApiRealEstateCharacteristicsDto)
  @Transform(
    ({
      obj: {
        number_of_rooms: numberOfRooms,
        living_space: realEstateSizeInSquareMeters,
        property_space_value: propertySizeInSquareMeters,
        furnishings,
      },
    }: {
      obj: TPropstackProcProperty<IPropstackProperty>;
    }): ApiRealEstateCharacteristics => {
      const furnishing: ApiFurnishing[] = [];
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
        balcony,
        cellar,
        garden,
        guest_toilet: guestRestRoom,
        kitchen_complete: fittedKitchen,
        ramp,
      } = furnishings;

      if (balcony) {
        furnishing.push(ApiFurnishing.BALCONY);
      }
      if (cellar) {
        furnishing.push(ApiFurnishing.BASEMENT);
      }
      if (garden) {
        furnishing.push(ApiFurnishing.GARDEN);
      }
      if (guestRestRoom) {
        furnishing.push(ApiFurnishing.GUEST_REST_ROOMS);
      }
      if (fittedKitchen) {
        furnishing.push(ApiFurnishing.FITTED_KITCHEN);
      }
      if (ramp) {
        furnishing.push(ApiFurnishing.ACCESSIBLE);
      }

      return characteristics;
    },
    { toClassOnly: true },
  )
  @IsOptional()
  @IsObject()
  @ValidateNested()
  characteristics?: ApiRealEstateCharacteristics;

  @Expose()
  @Type(() => ApiRealEstateCostDto)
  @Transform(
    ({
      obj: { price, base_rent: coldRent, total_rent: warmRent },
    }: {
      obj: TPropstackProcProperty<IPropstackProperty>;
    }): ApiRealEstateCost => {
      if (!price && !coldRent && !warmRent) {
        return undefined;
      }

      let priceValue = price;
      let priceType = ApiRealEstateCostType.SELL;

      if (!price && coldRent) {
        priceValue = coldRent;
        priceType = ApiRealEstateCostType.RENT_MONTHLY_COLD;
      }
      if (!price && warmRent) {
        priceValue = warmRent;
        priceType = ApiRealEstateCostType.RENT_MONTHLY_WARM;
      }

      return {
        price: {
          amount: priceValue,
          currency: '€',
        },
        type: priceType,
      };
    },
    { toClassOnly: true },
  )
  @IsOptional()
  @IsObject()
  @ValidateNested()
  costStructure?: ApiRealEstateCost;

  @Expose()
  @Transform(
    ({
      obj: { status, areaButlerStatus },
    }: {
      obj: TPropstackProcProperty<IPropstackProperty>;
    }): string => areaButlerStatus || status?.name,
    {
      toClassOnly: true,
    },
  )
  @IsOptional()
  @IsString()
  status2?: string;

  @Expose()
  @Transform(
    ({
      obj: {
        object_type: objectType,
        rs_type: rsType,
        rs_category: rsCategory,
      },
    }: {
      obj: TPropstackProcProperty<IPropstackProperty>;
    }): string => {
      if (!objectType && !rsType && !rsCategory) {
        return;
      }

      let resultType = '';

      if (objectType) {
        resultType += objectType;
      }
      if (rsType) {
        resultType += resultType.length ? ` | ${rsType}` : rsType;
      }
      if (rsCategory) {
        resultType += resultType.length ? ` | ${rsCategory}` : rsCategory;
      }

      return resultType;
    },
    {
      toClassOnly: true,
    },
  )
  @IsOptional()
  @IsString()
  type?: string;
}

export default ApiPropstackFetchToAreaButlerDto;
