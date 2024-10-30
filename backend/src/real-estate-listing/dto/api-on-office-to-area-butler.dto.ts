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
  ApiEnergyEfficiency,
  ApiFurnishing,
  ApiRealEstateCharacteristics,
  ApiRealEstateCost,
  ApiRealEstateCostType,
  ApiRealEstateExtSourcesEnum,
  IApiRealEstateListingSchema,
} from '@area-butler-types/real-estate';
import { GeoJsonPoint } from '../../shared/types/geo-json';
import {
  IApiIntegrationParams,
  IApiRealEstateIntegrationParams,
} from '@area-butler-types/integration';
import ApiRealEstateCostDto from '../../dto/api-real-estate-cost.dto';
import ApiRealEstateCharacteristicsDto from '../../dto/api-real-estate-characteristics.dto';
import ApiGeoJsonPointDto from '../../dto/api-geo-json-point.dto';
import {
  ApiOnOfficeEstateBasementEnum,
  IApiOnOfficeRealEstate,
} from '@area-butler-types/on-office';
import { parseOnOfficeFloat } from '../../shared/functions/on-office';
import ApiRealEstateIntegrationParamsDto from '../../dto/api-real-estate-integration-params.dto';

export interface IApiOnOfficeProcessedRealEstate
  extends IApiOnOfficeRealEstate {
  address: string; // 'address' field comes from our side after the geocoding
  integrationParams?: IApiIntegrationParams;
  // LABELS - we need them for the csv import
  datensatznr: string; // the label for 'Id' field
  status: string; // the label for 'status2' field
  grundstuecksgroesse: string; // the label for 'grundstuecksflaeche' field
  energieeffizienzklasse: string; // the label for 'energyClass' field
  // immonr: string; // the label for 'objektnr_extern' field
  areaButlerStatus?: string; // this field comes from our side
  areaButlerStatus2?: string; // this field comes from our side
  externe_url?: string;
}

@Exclude()
class ApiOnOfficeToAreaButlerDto implements IApiRealEstateListingSchema {
  @Expose()
  @IsNotEmpty()
  @IsString()
  address: string;

  @Expose()
  @Type(() => ApiGeoJsonPointDto)
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  location: GeoJsonPoint;

  @Expose()
  @Transform(
    ({
      obj: { objekttitel, objekttyp, address },
    }: {
      obj: IApiOnOfficeProcessedRealEstate;
    }): string => objekttitel || objekttyp || address,
    {
      toClassOnly: true,
    },
  )
  @IsNotEmpty()
  @IsString()
  name: string;

  @Expose()
  @Type(() => ApiRealEstateIntegrationParamsDto)
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
  @Transform(
    ({
      obj: { externe_url },
      value,
    }: {
      obj: IApiOnOfficeProcessedRealEstate;
      value: string;
    }): string => value || externe_url,
    {
      toClassOnly: true,
    },
  )
  @IsOptional()
  @IsString()
  externalUrl?: string;

  @Expose()
  @Type(() => ApiRealEstateCharacteristicsDto)
  @Transform(
    ({
      obj,
    }: {
      obj: IApiOnOfficeProcessedRealEstate;
    }): ApiRealEstateCharacteristics => {
      const {
        anzahl_zimmer,
        wohnflaeche,
        grundstuecksflaeche,
        grundstuecksgroesse,
        energyClass,
        energieeffizienzklasse,
        balkon,
        anzahl_balkone,
        unterkellert,
      } = obj;

      const resultingEnergyClass = energyClass || energieeffizienzklasse;
      const numberOfRooms = parseOnOfficeFloat(anzahl_zimmer);
      const realEstateSizeInSquareMeters = parseOnOfficeFloat(wohnflaeche);

      const propertySizeInSquareMeters = parseOnOfficeFloat(
        grundstuecksflaeche || grundstuecksgroesse,
      );

      const characteristics = {
        furnishing: [],
      } as ApiRealEstateCharacteristics;

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

      if (
        typeof resultingEnergyClass === 'string' &&
        Object.values(ApiEnergyEfficiency).includes(
          resultingEnergyClass.toUpperCase() as ApiEnergyEfficiency,
        )
      ) {
        characteristics.energyEfficiency =
          resultingEnergyClass.toUpperCase() as ApiEnergyEfficiency;
      }

      if (balkon === 'true' || +anzahl_balkone) {
        characteristics.furnishing.push(ApiFurnishing.BALCONY);
      }

      if (
        typeof unterkellert === 'string' &&
        [
          ApiOnOfficeEstateBasementEnum.JA,
          ApiOnOfficeEstateBasementEnum.TEIL,
          ApiOnOfficeEstateBasementEnum.TEILWEISE,
        ].includes(unterkellert.toUpperCase() as ApiOnOfficeEstateBasementEnum)
      ) {
        characteristics.furnishing.push(ApiFurnishing.BASEMENT);
      }

      return Object.keys(characteristics).length === 1 &&
        characteristics.furnishing.length === 0
        ? undefined
        : characteristics;
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
      obj: { kaufpreis, waehrung, kaltmiete, warmmiete },
    }: {
      obj: IApiOnOfficeProcessedRealEstate;
    }): ApiRealEstateCost => {
      const price = parseOnOfficeFloat(kaufpreis);
      const coldPrice = parseOnOfficeFloat(kaltmiete);
      const warmPrice = parseOnOfficeFloat(warmmiete);
      const currency =
        !waehrung || waehrung.toUpperCase() === 'EUR' ? '€' : waehrung;

      if (price) {
        return {
          price: { amount: price, currency },
          type: ApiRealEstateCostType.SELL,
        };
      }

      if (warmPrice) {
        return {
          price: { amount: warmPrice, currency },
          type: ApiRealEstateCostType.RENT_MONTHLY_WARM,
        };
      }

      if (coldPrice) {
        return {
          price: { amount: coldPrice, currency },
          type: ApiRealEstateCostType.RENT_MONTHLY_COLD,
        };
      }

      return undefined;
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
      obj: { areaButlerStatus, vermarktungsart },
    }: {
      obj: IApiOnOfficeProcessedRealEstate;
    }): string => areaButlerStatus || vermarktungsart,
    { toClassOnly: true },
  )
  @IsOptional()
  @IsString()
  status?: string;

  @Expose()
  @Transform(
    ({
      obj: { areaButlerStatus2, status2, status },
    }: {
      obj: IApiOnOfficeProcessedRealEstate;
    }): string => areaButlerStatus2 || status2 || status,
    { toClassOnly: true },
  )
  @IsOptional()
  @IsString()
  status2?: string;

  @Expose()
  @Transform(
    ({
      obj: { objekttyp },
    }: {
      obj: IApiOnOfficeProcessedRealEstate;
    }): string => objekttyp ?? undefined,
    {
      toClassOnly: true,
    },
  )
  @IsOptional()
  @IsString()
  type?: string;
}

export default ApiOnOfficeToAreaButlerDto;
