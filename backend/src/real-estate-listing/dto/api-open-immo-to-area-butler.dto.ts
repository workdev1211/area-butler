import { Exclude, Expose, Transform } from 'class-transformer';

import {
  ApiFurnishing,
  ApiRealEstateCharacteristics,
  ApiRealEstateCost,
  ApiRealEstateCostType,
  ApiRealEstateStatusEnum,
  IApiRealEstateListingSchema,
} from '@area-butler-types/real-estate';
import { IOpenImmoXmlVendor } from '../../shared/types/open-immo';
import { GeoJsonPoint } from '../../shared/types/geo-json';
import { iso3166Alpha3CountryNames } from '../../../../shared/constants/location';

@Exclude()
class ApiOpenImmoToAreaButlerDto implements IApiRealEstateListingSchema {
  @Expose()
  @Transform(
    ({
      obj: {
        immobilie: {
          geo: {
            strasse: streetName,
            hausnummer: houseNumber,
            plz: postCode,
            ort: location,
            land: { iso_land: country },
          },
        },
      },
    }: {
      obj: IOpenImmoXmlVendor;
    }): string =>
      `${streetName} ${houseNumber}, ${postCode} ${location}, ${iso3166Alpha3CountryNames[country]}`,
    { toClassOnly: true },
  )
  address: string;

  @Expose()
  @Transform(
    ({
      obj: {
        immobilie: {
          geo: {
            geokoordinaten: { breitengrad: lat, laengengrad: lng },
          },
        },
      },
    }: {
      obj: IOpenImmoXmlVendor;
    }): GeoJsonPoint => ({
      type: 'Point',
      coordinates: [lat, lng],
    }),
    { toClassOnly: true },
  )
  location: GeoJsonPoint;

  @Expose()
  @Transform(
    ({
      obj: {
        immobilie: {
          geo: {
            strasse: streetName,
            hausnummer: houseNumber,
            plz: postCode,
            ort: location,
            land: { iso_land: country },
          },
        },
      },
    }: {
      obj: IOpenImmoXmlVendor;
    }): string =>
      `${streetName} ${houseNumber}, ${postCode} ${location}, ${iso3166Alpha3CountryNames[country]}`,
    { toClassOnly: true },
  )
  name: string;

  @Expose()
  @Transform(
    ({
      obj: {
        immobilie: {
          weitere_adresse: { url },
        },
      },
    }: {
      obj: IOpenImmoXmlVendor;
    }) => url || undefined,
    { toClassOnly: true },
  )
  externalUrl?: string;

  @Expose()
  @Transform(
    ({
      obj: {
        immobilie: {
          flaechen: {
            nutzflaeche: realEstateSizeInSquareMeters,
            gesamtflaeche: propertySizeInSquareMeters,
            anzahl_zimmer: numberOfRooms,
            anzahl_stellplaetze: garageParkingSpace,
          },
          ausstattung: {
            kueche: kitchen,
            heizungsart: heatingType,
            gartennutzung: garden,
            ausricht_balkon_terrasse: balcony,
            rollstuhlgerecht: accessible,
            unterkellert: basement,
          },
          zustand_angaben: {
            energiepass: { wertklasse: energyEfficiency },
          },
        },
      },
    }: {
      obj: IOpenImmoXmlVendor;
    }) => {
      const furnishing: ApiFurnishing[] = [];

      if (garageParkingSpace) {
        furnishing.push(ApiFurnishing.GARAGE_PARKING_SPACE);
      }
      if (Object.keys(kitchen).some((key) => !!kitchen[key])) {
        furnishing.push(ApiFurnishing.FITTED_KITCHEN);
      }
      if (heatingType.FUSSBODEN) {
        furnishing.push(ApiFurnishing.UNDERFLOOR_HEATING);
      }
      if (garden) {
        furnishing.push(ApiFurnishing.GARDEN);
      }
      if (Object.keys(balcony).some((key) => !!balcony[key])) {
        furnishing.push(ApiFurnishing.BALCONY);
      }
      if (accessible) {
        furnishing.push(ApiFurnishing.ACCESSIBLE);
      }
      if (basement.keller === 'JA') {
        furnishing.push(ApiFurnishing.BASEMENT);
      }

      return {
        realEstateSizeInSquareMeters,
        propertySizeInSquareMeters,
        numberOfRooms,
        energyEfficiency,
        furnishing,
      };
    },
  )
  characteristics?: ApiRealEstateCharacteristics;

  @Expose()
  @Transform(
    ({
      obj: {
        immobilie: {
          preise: {
            kaufpreis: purchasePrice,
            // TODO parse in the future
            // kaufpreisnetto: purchasePriceNet,
            // kaufpreisbrutto: purchasePriceGross,
            // nettokaltmiete: coldRentNet,
            kaltmiete: coldRent,
            warmmiete: warmRent,
          },
        },
      },
    }: {
      obj: IOpenImmoXmlVendor;
    }) => {
      if (!purchasePrice && !coldRent && !warmRent) {
        return;
      }

      const costStructure: ApiRealEstateCost = {
        price: { currency: '€' },
        type: ApiRealEstateCostType.SELL,
      };

      if (purchasePrice) {
        costStructure.price.amount = purchasePrice;
        return costStructure;
      }

      if (coldRent) {
        costStructure.price.amount = coldRent;
        costStructure.type = ApiRealEstateCostType.RENT_MONTHLY_COLD;

        return costStructure;
      }

      if (warmRent) {
        costStructure.price.amount = warmRent;
        costStructure.type = ApiRealEstateCostType.RENT_MONTHLY_WARM;

        return costStructure;
      }
    },
    { toClassOnly: true },
  )
  costStructure?: ApiRealEstateCost;

  status = ApiRealEstateStatusEnum.IN_PREPARATION;
}

export default ApiOpenImmoToAreaButlerDto;
