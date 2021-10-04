import { HttpModule, Module } from '@nestjs/common';
import { GeocodingService } from './geocoding/geocoding.service';
import { IsochroneService } from './isochrone/isochrone.service';
import { MailSenderService } from './mail/mail-sender.service';
import { OverpassService } from './overpass/overpass.service';

@Module({
  providers: [GeocodingService, OverpassService, IsochroneService, MailSenderService],
  imports: [HttpModule],
  exports: [GeocodingService, OverpassService, IsochroneService, MailSenderService],
})
export class ClientModule {}
