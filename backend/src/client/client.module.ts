import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { IsochroneService } from './isochrone/isochrone.service';
import { MailSenderService } from './mail/mail-sender.service';
import { OverpassService } from './overpass/overpass.service';
import { SlackSenderService } from './slack/slack-sender.service';
import { StripeService } from './stripe/stripe.service';
import { MapboxService } from './mapbox/mapbox.service';
import { PaypalService } from './paypal/paypal.service';
import { GoogleApiService } from './google/google-api.service';
import { HereGeocodeService } from './here/here-geocode.service';
import { OnOfficeApiService } from './on-office/on-office-api.service';
import { PropstackApiService } from './propstack/propstack-api.service';
import { MyVivendaApiService } from './my-vivenda/my-vivenda-api.service';
import { OpenAiApiService } from './open-ai/open-ai-api.service';

@Module({
  providers: [
    OverpassService,
    IsochroneService,
    MailSenderService,
    SlackSenderService,
    StripeService,
    MapboxService,
    PaypalService,
    GoogleApiService,
    HereGeocodeService,
    OnOfficeApiService,
    PropstackApiService,
    MyVivendaApiService,
    OpenAiApiService,
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
    GoogleApiService,
    HereGeocodeService,
    OnOfficeApiService,
    PropstackApiService,
    MyVivendaApiService,
    OpenAiApiService,
  ],
})
export class ClientModule {}
