import { Request, Response, NextFunction } from 'express';
import { Logger } from '@nestjs/common';
import * as hmacSHA256 from 'crypto-js/hmac-sha256';
import Base64 from 'crypto-js/enc-base64';

import { configService } from '../../config/config.service';

export const checkSignature = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const logger = new Logger(checkSignature.name);
  const onOfficeProviderSecret = configService.getOnOfficeProviderSecret();
  const { signature, ...queryParams } = req.query;

  const processedQueryParams = Object.keys(queryParams)
    .sort()
    .map<string[]>((key) => [key, queryParams[key] as string]);

  const url = `${req.protocol}'://'${req.get('host')}${
    req.route.path
  }?${new URLSearchParams(processedQueryParams)}`;

  logger.debug(JSON.stringify({ url, queryParams }));
  logger.debug(
    JSON.stringify({
      hmac: hmacSHA256(url, onOfficeProviderSecret).toString(Base64),
      signature,
    }),
  );

  if (hmacSHA256(url, onOfficeProviderSecret).toString(Base64) !== signature) {
    res.render('on-office/activation-iframe-wrong-signature');
    return;
  }

  next();
};
