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
  IPropstackWebhookProperty,
  TPropstackProcProperty,
} from '../../shared/types/propstack';
import ApiPropstackToAreaButlerDto from './api-propstack-to-area-butler.dto';

@Exclude()
class ApiPropstackWebhookToAreaButlerDto extends ApiPropstackToAreaButlerDto<IPropstackWebhookProperty> {
  @Expose()
  @Transform(
    ({
      obj: { address, name, title },
    }: {
      obj: TPropstackProcProperty<IPropstackWebhookProperty>;
    }): string => name || title?.value || address,
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
        balcony,
        cellar,
        garden,
        ramp,
        guest_toilet: guestRestRoom,
        kitchen_complete: fittedKitchen,
        living_space: realEstateSizeInSquareMeters,
        number_of_rooms: numberOfRooms,
        property_space_value: propertySizeInSquareMeters,
      },
    }: {
      obj: TPropstackProcProperty<IPropstackWebhookProperty>;
    }): ApiRealEstateCharacteristics => {
      const furnishing: ApiFurnishing[] = [];
      const characteristics: ApiRealEstateCharacteristics = { furnishing };

      if (numberOfRooms?.value) {
        characteristics.numberOfRooms = numberOfRooms.value;
      }
      if (realEstateSizeInSquareMeters?.value) {
        characteristics.realEstateSizeInSquareMeters =
          realEstateSizeInSquareMeters.value;
      }
      if (propertySizeInSquareMeters) {
        characteristics.propertySizeInSquareMeters = propertySizeInSquareMeters;
      }

      if (balcony?.value) {
        furnishing.push(ApiFurnishing.BALCONY);
      }
      if (cellar?.value) {
        furnishing.push(ApiFurnishing.BASEMENT);
      }
      if (garden?.value) {
        furnishing.push(ApiFurnishing.GARDEN);
      }
      if (guestRestRoom?.value) {
        furnishing.push(ApiFurnishing.GUEST_REST_ROOMS);
      }
      if (fittedKitchen?.value) {
        furnishing.push(ApiFurnishing.FITTED_KITCHEN);
      }
      if (ramp?.value) {
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
      obj: TPropstackProcProperty<IPropstackWebhookProperty>;
    }): ApiRealEstateCost => {
      if (!price?.value && !coldRent?.value && !warmRent?.value) {
        return undefined;
      }

      let priceValue = price?.value;
      let priceType = ApiRealEstateCostType.SELL;

      if (!priceValue && coldRent?.value) {
        priceValue = coldRent.value;
        priceType = ApiRealEstateCostType.RENT_MONTHLY_COLD;
      }
      if (!priceValue && warmRent?.value) {
        priceValue = warmRent.value;
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
      obj: { property_status, areaButlerStatus },
    }: {
      obj: TPropstackProcProperty<IPropstackWebhookProperty>;
    }): string => areaButlerStatus || property_status?.name,
    {
      toClassOnly: true,
    },
  )
  @IsOptional()
  @IsString()
  status2?: string;
}

export default ApiPropstackWebhookToAreaButlerDto;
