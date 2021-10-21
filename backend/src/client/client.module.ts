import { HttpModule, Module } from '@nestjs/common';
import { IsochroneService } from './isochrone/isochrone.service';
import { MailSenderService } from './mail/mail-sender.service';
import { OverpassService } from './overpass/overpass.service';

@Module({
  providers: [OverpassService, IsochroneService, MailSenderService],
  imports: [HttpModule],
  exports: [OverpassService, IsochroneService, MailSenderService],
})
export class ClientModule {}
