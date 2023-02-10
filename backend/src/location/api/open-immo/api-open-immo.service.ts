import { HttpException, Injectable } from '@nestjs/common';
import { XMLParser } from 'fast-xml-parser';
import { plainToInstance } from 'class-transformer';

import ApiOpenImmoToRealEstateDto from './dto/api-open-immo-to-real-estate.dto';
import { IOpenImmoXmlData } from '../../../shared/open-immo.types';
import { RealEstateListingService } from '../../../real-estate-listing/real-estate-listing.service';
import { UserDocument } from '../../../user/schema/user.schema';
import { ApiUpsertRealEstateListing } from '@area-butler-types/real-estate';
import { GoogleGeocodeService } from '../../../client/google/google-geocode.service';

@Injectable()
export class ApiOpenImmoService {
  constructor(
    private readonly realEstateListingService: RealEstateListingService,
    private readonly googleGeocodeService: GoogleGeocodeService,
  ) {}

  async importXmlFile(
    user: UserDocument,
    file: Express.Multer.File,
  ): Promise<void> {
    const options = {
      ignoreAttributes: false,
      attributeNamePrefix: '',
      parseAttributeValue: true,
      allowBooleanAttributes: true,
    };
    const parser = new XMLParser(options);
    const parsedData: IOpenImmoXmlData = parser.parse(file.buffer);
    const realEstateListing = plainToInstance(
      ApiOpenImmoToRealEstateDto,
      parsedData.openimmo.anbieter,
    );
    await this.checkAddressAndCoordinates(realEstateListing);

    await this.realEstateListingService.insertRealEstateListing(
      user,
      realEstateListing,
    );
  }

  private async checkAddressAndCoordinates(
    realEstateListing: ApiUpsertRealEstateListing,
  ): Promise<void> {
    if (realEstateListing.coordinates) {
      const { formatted_address: resultingAddress } =
        await this.googleGeocodeService.fetchPlaceByCoordinates(
          realEstateListing.coordinates,
        );

      realEstateListing.address = resultingAddress;
      return;
    }

    if (realEstateListing.address) {
      const {
        geometry: { location },
      } = await this.googleGeocodeService.fetchPlaceByAddress(
        realEstateListing.address,
      );

      realEstateListing.coordinates = location;
      return;
    }

    // we should've returned by now
    throw new HttpException(
      'Please, provide correct address or coordinates!',
      400,
    );
  }

  private getDotNotatedAndFinalProperties(parsedData: unknown): {
    dotNotatedProperties: string[];
    finalProperties: string[];
  } {
    const deepKeys = (t, pre = []) =>
      Array.isArray(t)
        ? []
        : Object(t) === t
        ? Object.entries(t).flatMap(([k, v]) => deepKeys(v, [...pre, k]))
        : pre.join('.');

    const regex = /^.*\.(.*)/gm;
    const dotNotatedProperties = deepKeys(parsedData);
    const finalProperties = dotNotatedProperties.map((propertyName) =>
      propertyName.replace(regex, '$1'),
    );

    return { dotNotatedProperties, finalProperties };
  }
}
