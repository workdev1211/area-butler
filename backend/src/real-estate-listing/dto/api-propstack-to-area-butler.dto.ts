import { Exclude, Expose, Transform } from 'class-transformer';

import {
  ApiFurnishing,
  ApiRealEstateCharacteristics,
  ApiRealEstateCost,
  ApiRealEstateCostType,
  ApiRealEstateExtSourcesEnum,
  ApiRealEstateStatusEnum,
  ApiUpsertRealEstateListing,
} from '@area-butler-types/real-estate';
import {
  IPropstackRealEstate,
  PropstackRealEstStatusesEnum,
} from '../../shared/propstack.types';
import { GeoJsonPoint } from '../../shared/geo-json.types';

@Exclude()
class ApiPropstackToAreaButlerDto implements ApiUpsertRealEstateListing {
  @Expose()
  @Transform(
    ({ obj: { name, title } }: { obj: IPropstackRealEstate }): string =>
      name || title,
    { toClassOnly: true },
  )
  name: string;

  @Expose()
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
  address: string;

  @Expose()
  @Transform(
    ({ obj: { lat, lng } }: { obj: IPropstackRealEstate }): GeoJsonPoint => ({
      type: 'Point',
      coordinates: [lat, lng],
    }),
  )
  location: GeoJsonPoint;

  @Expose()
  @Transform(
    ({ obj: { price } }: { obj: IPropstackRealEstate }): ApiRealEstateCost => {
      if (!price) {
        return;
      }

      return {
        price: { amount: price, currency: '€' },
        type: ApiRealEstateCostType.SELL,
      };
    },
    { toClassOnly: true },
  )
  costStructure?: ApiRealEstateCost;

  @Expose()
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
  characteristics?: ApiRealEstateCharacteristics;

  @Expose()
  @Transform(
    ({ obj: { id } }: { obj: IPropstackRealEstate }): string => `${id}`,
    {
      toClassOnly: true,
    },
  )
  externalId?: string;

  externalSource = ApiRealEstateExtSourcesEnum.PROPSTACK;

  @Expose()
  @Transform(
    ({
      obj: {
        status: { name },
      },
    }: {
      obj: IPropstackRealEstate;
    }): ApiRealEstateStatusEnum => {
      switch (name) {
        case PropstackRealEstStatusesEnum.AKQUISE: {
          return ApiRealEstateStatusEnum.RENTED;
        }
        case PropstackRealEstStatusesEnum.IN_VERMARKTUNG: {
          return ApiRealEstateStatusEnum.MARKET_OBSERVATION;
        }
        case PropstackRealEstStatusesEnum.RESERVIERT: {
          return ApiRealEstateStatusEnum.RESERVED;
        }
        case PropstackRealEstStatusesEnum.VERKAUFT: {
          return ApiRealEstateStatusEnum.SOLD;
        }
        case PropstackRealEstStatusesEnum.INAKTIV: {
          return ApiRealEstateStatusEnum.ARCHIVED;
        }

        case PropstackRealEstStatusesEnum.IN_VORBEREITUNG:
        default: {
          return ApiRealEstateStatusEnum.IN_PREPARATION;
        }
      }
    },
    {
      toClassOnly: true,
    },
  )
  status: ApiRealEstateStatusEnum;

  showInSnippet = true;
}

export default ApiPropstackToAreaButlerDto;
