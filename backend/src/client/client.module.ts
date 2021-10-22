import { HttpModule, Module } from '@nestjs/common';
import { IsochroneService } from './isochrone/isochrone.service';
import { MailSenderService } from './mail/mail-sender.service';
import { OverpassService } from './overpass/overpass.service';
import { SlackSenderService } from './slack/slack-sender.service';

@Module({
  providers: [OverpassService, IsochroneService, MailSenderService, SlackSenderService],
  imports: [HttpModule],
  exports: [OverpassService, IsochroneService, MailSenderService, SlackSenderService],
})
export class ClientModule {}
