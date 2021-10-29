/* eslint-disable @typescript-eslint/camelcase */
import {ApiCreateCheckout} from "@area-butler-types/billing";
import {Injectable} from "@nestjs/common";
import {configService} from "src/config/config.service";
import {UserDocument} from "src/user/schema/user.schema";
import Stripe from 'stripe';

@Injectable()
export class StripeService {

    stripeClient: Stripe;
    stripeWebhookSecret: string;

    constructor() {
        this.stripeClient = new Stripe(configService.getStripeKey(), {apiVersion: '2020-08-27'});
        this.stripeWebhookSecret = configService.getStripeWebhookSecret();
    }


    public async createCustomerPortalLink(user: UserDocument): Promise<string> {
        const stripeSession: Stripe.BillingPortal.Session = await this.stripeClient.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            locale: "de",
            return_url: configService.getBaseAppUrl()
        })

        return stripeSession.url;
    }

    public async createCheckoutSessionUrl(user: UserDocument, {
        priceId,
        amount = 1,
        trialPeriod,
        mode = 'subscription'
    }: ApiCreateCheckout): Promise<string> {
        const checkoutUrl: Stripe.Checkout.Session = await this.stripeClient.checkout.sessions.create({
            customer: user.stripeCustomerId,
            mode,
            payment_method_types: ['card'],
            billing_address_collection: 'required',
            locale: "de",
            subscription_data: {
                trial_period_days: trialPeriod
            },
            line_items: [
                {
                    price: priceId,
                    quantity: amount,
                    tax_rates: [configService.getStripeTaxId()]
                }
            ],
            success_url: `${configService.getCallbackUrl()}?${mode === 'subscription' ? 'subscriptionId' : 'checkoutId'}={CHECKOUT_SESSION_ID}`,
            cancel_url: configService.getBaseAppUrl(),
        })

        return checkoutUrl.url;
    }

    public async createCustomer(user: UserDocument): Promise<string> {

        const stripeCustomer: Stripe.Customer = await this.stripeClient.customers.create({
            email: user.email,
            name: user.fullname,
        })

        return stripeCustomer.id;
    }

    public constructEvent(request: any): Stripe.Event {
        const webhookSecret = configService.getStripeWebhookSecret();
        const signature = request.headers["stripe-signature"];
        try {
            return this.stripeClient.webhooks.constructEvent(
                request.rawBody,
                signature,
                webhookSecret
            );
        } catch (err) {
            console.error(`Webhook signature verification failed.`);
            throw new Error('Webhook signature verification failed.');
        }
    }

    public async fetchLineItemsFromCheckoutSession(checkoutSessionId: string): Promise<Stripe.LineItem[]> {
        const lineItems = await this.stripeClient.checkout.sessions.listLineItems(checkoutSessionId);
        return lineItems.data
    }

    public async fetchSubscriptionData(stripeSubscriptionId: string): Promise<Stripe.Subscription> {
        return await this.stripeClient.subscriptions.retrieve(stripeSubscriptionId);
    }
}
