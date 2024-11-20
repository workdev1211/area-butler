import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { IApiOnOfficeRealEstate } from '@area-butler-types/on-office';
import { TIntegrationUserDocument } from '../../user/schema/integration-user.schema';
import {
  IApiIntSetPropPubLinksReq,
  IntegrationTypesEnum,
  TUpdEstTextFieldParams,
} from '@area-butler-types/integration';
import { GeoJsonPoint } from '../../shared/types/geo-json';
import { RealEstateListingIntService } from '../../real-estate-listing/real-estate-listing-int.service';
import { mapRealEstateListingToApiRealEstateListing } from '../../real-estate-listing/mapper/real-estate-listing.mapper';
import ApiOnOfficeToAreaButlerDto from '../../real-estate-listing/dto/api-on-office-to-area-butler.dto';
import { ApiRealEstateListing } from '@area-butler-types/real-estate';
import { ApiCoordinates } from '@area-butler-types/types';
import { PlaceService } from '../../place/place.service';
import { GeocodeResult } from '@googlemaps/google-maps-services-js';
import structuredClone from '@ungap/structured-clone';
import { OnOfficeQueryBuilderService } from './query-builder/on-office-query-builder.service';
import { processOnOfficeEstateId } from '../shared/on-office.functions';

interface IProcessEstateData {
  onOfficeEstate: IApiOnOfficeRealEstate;
  place: GeocodeResult;
  realEstate: ApiRealEstateListing;
}

@Injectable()
export class OnOfficeEstateService {
  private readonly integrationType = IntegrationTypesEnum.ON_OFFICE;
  private readonly logger = new Logger(OnOfficeEstateService.name);

  constructor(
    private readonly onOfficeQueryBuilderService: OnOfficeQueryBuilderService,
    private readonly placeService: PlaceService,
    private readonly realEstateListingIntService: RealEstateListingIntService,
  ) {}

  async setPublicLinks(
    integrationUser: TIntegrationUserDocument,
    { integrationId, publicLinkParams }: IApiIntSetPropPubLinksReq,
  ): Promise<void> {
    const textFieldsParams: TUpdEstTextFieldParams[] = [];

    const queryBuilder = this.onOfficeQueryBuilderService.setUserParams(
      integrationUser.parameters,
    );

    for (const { exportType, isLinkEntity, title, url } of publicLinkParams) {
      if (isLinkEntity) {
        queryBuilder.createLink({
          integrationId,
          title,
          url,
        });

        continue;
      }

      textFieldsParams.push({
        exportType,
        text: url,
      });
    }

    if (textFieldsParams.length) {
      queryBuilder.updateTextFields(
        integrationId,
        textFieldsParams,
        integrationUser.company.config.exportMatching,
      );
    }

    await queryBuilder.exec();
  }

  // should be the only method to save estate record to our db
  async processEstateData(
    integrationUser: TIntegrationUserDocument,
    estateData: IApiOnOfficeRealEstate,
  ): Promise<IProcessEstateData> {
    const processedEstate = structuredClone(estateData);

    const {
      Id: estateId,
      breitengrad: lat,
      laengengrad: lng,
      strasse: street,
      hausnummer: houseNumber,
      plz: zipCode,
      ort: city,
      land: country,
    } = processedEstate;

    let locationAddress = `${street} ${houseNumber}, ${zipCode} ${city}, ${country}`;

    const locationCoordinates: ApiCoordinates = {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    };

    let place = await this.placeService.fetchPlace({
      location: locationAddress,
      user: integrationUser,
    });

    if (!place) {
      locationAddress = undefined;

      place = await this.placeService.fetchPlace({
        location: locationCoordinates,
        user: integrationUser,
      });
    }

    if (!place) {
      this.logger.error(
        `${this.processEstateData.name}. User ${integrationUser.integrationUserId}. Estate ${estateId}.`,
        locationAddress,
        locationCoordinates,
      );

      throw new UnprocessableEntityException('Adresse nicht gefunden!'); // Address is not found
    }

    const resultEstateId = processOnOfficeEstateId(estateId);

    if (!resultEstateId) {
      this.logger.error(
        `${this.processEstateData.name}. User ${integrationUser.integrationUserId}. Estate ${estateId}.`,
      );

      throw new UnprocessableEntityException(
        'onOffice real estate id could not be processed!!',
      );
    }

    Object.assign(processedEstate, {
      integrationParams: {
        integrationId: resultEstateId,
        integrationType: this.integrationType,
        integrationUserId: integrationUser.integrationUserId,
      },
      address: locationAddress || place.formatted_address,
      location: {
        type: 'Point',
        coordinates: [place.geometry.location.lat, place.geometry.location.lng],
      } as GeoJsonPoint,
    });

    const realEstate = mapRealEstateListingToApiRealEstateListing(
      integrationUser,
      await this.realEstateListingIntService.upsertOneByIntParams(
        plainToInstance(ApiOnOfficeToAreaButlerDto, processedEstate, {
          excludeExtraneousValues: true,
          exposeUnsetFields: false,
        }),
      ),
    );

    return {
      place,
      realEstate,
      onOfficeEstate: processedEstate,
    };
  }
}
