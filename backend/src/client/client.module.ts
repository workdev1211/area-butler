import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { IsochroneService } from './isochrone/isochrone.service';
import { MailSenderService } from './mail/mail-sender.service';
import { OverpassService } from './overpass/overpass.service';
import { SlackSenderService } from './slack/slack-sender.service';
import { StripeService } from './stripe/stripe.service';
import { MapboxService } from './mapbox/mapbox.service';
import { PaypalService } from './paypal/paypal.service';
import { GoogleGeocodeService } from './google/google-geocode.service';

@Module({
  providers: [
    OverpassService,
    IsochroneService,
    MailSenderService,
    SlackSenderService,
    StripeService,
    MapboxService,
    PaypalService,
    GoogleGeocodeService,
  ],
  imports: [HttpModule],
  exports: [
    OverpassService,
    IsochroneService,
    MailSenderService,
    SlackSenderService,
    StripeService,
    MapboxService,
    PaypalService,
    GoogleGeocodeService,
  ],
})
export class ClientModule {}
