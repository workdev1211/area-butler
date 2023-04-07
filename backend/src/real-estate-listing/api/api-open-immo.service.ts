import { Injectable } from '@nestjs/common';
// import { Cron } from '@nestjs/schedule';
import { Dirent } from 'node:fs';
import { readdir, readFile, rename, unlink } from 'fs/promises';
import { join as joinPath } from 'path';

import { UserService } from '../../user/user.service';
import { RealEstateListingImportService } from '../real-estate-listing-import.service';

@Injectable()
export class ApiOpenImmoService {
  constructor(
    private readonly realEstateListingImportService: RealEstateListingImportService,
    private readonly userService: UserService,
  ) {}

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
              await this.realEstateListingImportService.importXmlFile(
                userContent.user,
                file,
              );

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
