import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { response } from 'express';
import { request } from 'http';
import { AuthenticatedController } from 'src/shared/authenticated.controller';
import { InjectUser } from 'src/user/inject-user.decorator';
import { UserDocument } from 'src/user/schema/user.schema';
import { BillingService } from './billing.service';

@Controller('api/billing')
export class BillingController extends AuthenticatedController {


    constructor(private billingService: BillingService) {
        super();
    }


    @Post('create-customer-portal-link') 
    async createCustomerPortalLink(@InjectUser() user: UserDocument): Promise<string> {

        user.stripeCustomerId;
        return this.billingService.createCustomerPortalLink(user);
    }

    @Post('create-checkout-url')
    async createCheckoutUrl(@InjectUser() user: UserDocument, @Body() {priceId}: {priceId: string}) {
        return this.billingService.createCheckoutSessionUrl(user, priceId);
    }
}
