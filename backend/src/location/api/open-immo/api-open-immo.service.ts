import { HttpException, Injectable } from '@nestjs/common';
// import { Cron } from '@nestjs/schedule';
import { XMLParser } from 'fast-xml-parser';
import { plainToInstance } from 'class-transformer';
import { Dirent } from 'node:fs';
import { readdir, readFile, rename, unlink } from 'fs/promises';
import { join as joinPath } from 'path';

import ApiOpenImmoToRealEstateDto from './dto/api-open-immo-to-real-estate.dto';
import { IOpenImmoXmlData } from '../../../shared/open-immo.types';
import { RealEstateListingService } from '../../../real-estate-listing/real-estate-listing.service';
import { UserDocument } from '../../../user/schema/user.schema';
import { ApiUpsertRealEstateListing } from '@area-butler-types/real-estate';
import { GoogleGeocodeService } from '../../../client/google/google-geocode.service';
import { UserService } from '../../../user/user.service';

@Injectable()
export class ApiOpenImmoService {
  constructor(
    private readonly realEstateListingService: RealEstateListingService,
    private readonly userService: UserService,
    private readonly googleGeocodeService: GoogleGeocodeService,
  ) {}

  async importXmlFile(user: UserDocument, file: Buffer): Promise<void> {
    const options = {
      ignoreAttributes: false,
      attributeNamePrefix: '',
      parseAttributeValue: true,
      allowBooleanAttributes: true,
    };
    const parser = new XMLParser(options);
    const parsedData: IOpenImmoXmlData = parser.parse(file);
    const realEstateListing = plainToInstance(
      ApiOpenImmoToRealEstateDto,
      parsedData.openimmo.anbieter,
    );
    await this.setAddressAndCoordinates(realEstateListing);

    await this.realEstateListingService.insertRealEstateListing(
      user,
      realEstateListing,
    );
  }

  private async setAddressAndCoordinates(
    realEstateListing: ApiUpsertRealEstateListing,
  ): Promise<void> {
    if (realEstateListing.coordinates) {
      const { formatted_address: resultingAddress } =
        await this.googleGeocodeService.fetchPlaceByCoordinates(
          realEstateListing.coordinates,
        );

      realEstateListing.address = resultingAddress;
      realEstateListing.name = resultingAddress;
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

  // TODO uncomment in future
  // @Cron('0 0 * * * *')
  async handleFtpImport() {
    const dirPath = joinPath(process.cwd(), '../shared/ftp');

    const ftpDirContent: Dirent[] = await readdir(dirPath, {
      withFileTypes: true,
    }).catch(() => undefined);

    if (ftpDirContent?.length < 2) {
      return;
    }

    // To counter the specifics of the implementation of the chosen FTP server
    const filteredFtpDirContent = ftpDirContent.filter(
      ({ name }) => name !== 'ftp',
    );

    const userContents = await Promise.all(
      filteredFtpDirContent.map(async ({ name: userId }) => {
        const user = await this.userService
          .findByIdWithSubscription(userId)
          .catch(() => undefined);

        if (!user || !user.subscription) {
          return;
        }

        const userPath = joinPath(dirPath, userId);

        return { user, path: userPath, content: await readdir(userPath) };
      }),
    );

    await Promise.all(
      userContents.map(async (userContent) => {
        if (!userContent?.content.length) {
          return;
        }

        await Promise.all(
          userContent.content.map(async (name) => {
            if (name.replace(/^.*\.(.*)$/, '$1') !== 'xml') {
              return;
            }

            const filePath = joinPath(userContent.path, name);
            const file = await readFile(filePath);

            try {
              await this.importXmlFile(userContent.user, file);
              await unlink(filePath);
            } catch (e) {
              await rename(filePath, `${filePath}.bad`);
            }
          }),
        );
      }),
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
