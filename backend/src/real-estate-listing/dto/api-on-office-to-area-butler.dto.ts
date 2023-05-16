import {
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
import { parseCommaFloat } from '../../../../shared/functions/shared.functions';
import {
  ApiOnOfficeEstateBasementEnum,
  ApiOnOfficeEstateMarketTypesEnum,
  IApiOnOfficeRealEstate,
} from '@area-butler-types/on-office';

interface IApiOnOfficeRealEstateDto extends IApiOnOfficeRealEstate {
  address: string; // 'address' field comes from our side after the geocoding
  integrationParams?: IApiIntegrationParams;
  // LABELS - we need them for the csv import
  datensatznr: string; // the label for 'Id' field
  grundstuecksgroesse: string; // the label for 'grundstuecksflaeche' field
  energieeffizienzklasse: string; // the label for 'energyClass' field
  immonr: string; // the label for 'objektnr_extern' field
}

@Exclude()
class ApiOnOfficeToAreaButlerDto implements IApiRealEstateListingSchema {
  @Expose()
  @IsOptional()
  @IsString()
  userId?: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @Transform(
    ({
      obj: { objekttitel, address },
    }: {
      obj: IApiOnOfficeRealEstateDto;
    }): string => objekttitel || address,
    {
      toClassOnly: true,
    },
  )
  name: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  address: string;

  @Expose()
  @IsOptional()
  @IsString()
  externalUrl?: string;

  @Expose()
  @IsOptional()
  @IsDate()
  createdAt?: Date;

  showInSnippet = true;

  @Expose()
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiRealEstateCostDto)
  @Transform(
    ({
      obj: { kaufpreis, waehrung, kaltmiete, warmmiete },
    }: {
      obj: IApiOnOfficeRealEstateDto;
    }): ApiRealEstateCost => {
      const price = parseCommaFloat(kaufpreis);
      const coldPrice = parseCommaFloat(kaltmiete);
      const warmPrice = parseCommaFloat(warmmiete);
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
          price: { amount: price, currency },
          type: ApiRealEstateCostType.RENT_MONTHLY_WARM,
        };
      }

      if (coldPrice) {
        return {
          price: { amount: price, currency },
          type: ApiRealEstateCostType.RENT_MONTHLY_COLD,
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
      obj,
    }: {
      obj: IApiOnOfficeRealEstateDto;
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
      const numberOfRooms = parseCommaFloat(anzahl_zimmer);
      const realEstateSizeInSquareMeters = parseCommaFloat(wohnflaeche);

      const propertySizeInSquareMeters = parseCommaFloat(
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
        resultingEnergyClass &&
        Object.values(ApiEnergyEfficiency).includes(
          resultingEnergyClass.toUpperCase() as ApiEnergyEfficiency,
        )
      ) {
        characteristics.energyEfficiency =
          resultingEnergyClass.toUpperCase() as ApiEnergyEfficiency;
      }

      if (anzahl_balkone || +balkon) {
        characteristics.furnishing.push(ApiFurnishing.BALCONY);
      }

      if (
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
  characteristics?: ApiRealEstateCharacteristics;

  @Expose()
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiGeoJsonPointDto)
  location: GeoJsonPoint;

  @Expose()
  @IsOptional()
  @IsEnum(ApiRealEstateStatusEnum)
  @Transform(
    ({
      obj: { vermarktungsart, kaufpreis, warmmiete, kaltmiete },
    }: {
      obj: IApiOnOfficeRealEstateDto;
    }): ApiRealEstateStatusEnum => {
      if (
        vermarktungsart.toUpperCase() ===
          ApiOnOfficeEstateMarketTypesEnum.KAUF ||
        parseCommaFloat(kaufpreis)
      ) {
        return ApiRealEstateStatusEnum.FOR_SALE;
      }

      if (
        vermarktungsart.toUpperCase() ===
          ApiOnOfficeEstateMarketTypesEnum.MIETE ||
        parseCommaFloat(warmmiete) ||
        parseCommaFloat(kaltmiete)
      ) {
        return ApiRealEstateStatusEnum.FOR_RENT;
      }

      return ApiRealEstateStatusEnum.IN_PREPARATION;
    },
  )
  status?: ApiRealEstateStatusEnum;

  @Expose()
  @IsOptional()
  @IsString()
  @Transform(
    ({
      obj: { objektnr_extern, immonr, Id, datensatznr },
    }: {
      obj: IApiOnOfficeRealEstateDto;
    }): string => objektnr_extern || immonr || Id || datensatznr,
  )
  externalId?: string;

  @Expose()
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiIntegrationParamsDto)
  integrationParams?: IApiIntegrationParams;
}

export default ApiOnOfficeToAreaButlerDto;
