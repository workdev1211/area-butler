import { Module } from '@nestjs/common';
import { IsochroneService } from './isochrone/isochrone.service';
import { MailSenderService } from './mail/mail-sender.service';
import { OverpassService } from './overpass/overpass.service';
import { SlackSenderService } from './slack/slack-sender.service';
import { StripeService } from './stripe/stripe.service';
import { MapboxService } from './mapbox/mapbox.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [
    OverpassService,
    IsochroneService,
    MailSenderService,
    SlackSenderService,
    StripeService,
    MapboxService,
  ],
  imports: [HttpModule],
  exports: [
    OverpassService,
    IsochroneService,
    MailSenderService,
    SlackSenderService,
    StripeService,
    MapboxService,
  ],
})
export class ClientModule {}
