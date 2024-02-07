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
} from '../../shared/propstack.types';
import ApiPropstackToAreaButlerDto from './api-propstack-to-area-butler.dto';

@Exclude()
class ApiPropstackFetchToAreaButlerDto extends ApiPropstackToAreaButlerDto<IPropstackProperty> {
  @Expose()
  @IsNotEmpty()
  @Transform(
    ({
      obj: { name, title },
    }: {
      obj: TPropstackProcProperty<IPropstackProperty>;
    }): string => name || title,
    { toClassOnly: true },
  )
  @IsString()
  name: string;

  @Expose()
  @IsOptional()
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
  )
  @IsObject()
  @ValidateNested()
  @Type(() => ApiRealEstateCharacteristicsDto)
  characteristics?: ApiRealEstateCharacteristics;

  @Expose()
  @IsOptional()
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
  @IsString()
  status2?: string;
}

export default ApiPropstackFetchToAreaButlerDto;
