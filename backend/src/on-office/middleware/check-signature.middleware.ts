import { Request, Response, NextFunction } from 'express';
import { createHmac } from 'crypto';

import { configService } from '../../config/config.service';

export const checkSignature = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const onOfficeProviderSecret = configService.getOnOfficeProviderSecret();
  const { signature, ...queryParams } = req.query;

  const processedQueryParams = Object.keys(queryParams)
    .sort()
    .map<string[]>((key) => [key, queryParams[key] as string]);

  const url = `https://${req.get('host')}${
    req.route.path
  }?${new URLSearchParams(processedQueryParams)}`;

  const hmac = createHmac('sha256', onOfficeProviderSecret)
    .update(url)
    .digest()
    .toString('hex');

  if (hmac !== signature) {
    res.render('on-office/activation-iframe-wrong-signature');
    return;
  }

  next();
};
