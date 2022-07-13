import { HttpException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as dayjs from 'dayjs';
import { createHash } from 'crypto';
import {
  CreateOrderRequestBody,
  OrderResponseBody,
} from '@paypal/paypal-js/types/apis/orders';
import {
  CreateSubscriptionRequestBody,
  SubscriptionDetail,
} from '@paypal/paypal-js/types/apis/subscriptions/subscriptions';

import { configService } from '../../config/config.service';
import { getRawPriceValue } from '../../shared/shared.functions';
import { IPaymentItem } from '../../shared/subscription.types';
import {
  IPaypalAccessToken,
  IPaypalWebhookVerificationBody,
  PaypalWebhookVerificationStatusEnum,
} from '../../shared/paypal.types';

@Injectable()
export class PaypalService {
  private readonly paymentEnv = configService.getStripeEnv();
  private readonly paypalClientId = configService.getPaypalClientId();
  private readonly paypalClientSecret = configService.getPaypalClientSecret();
  private readonly paypalWebhookId = configService.getPaypalWebhookId();

  private readonly baseUrl =
    this.paymentEnv === 'prod'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

  constructor(private readonly http: HttpService) {}

  // Create an order
  async createOrder(
    email: string,
    { item: { id, price } }: IPaymentItem,
  ): Promise<OrderResponseBody> {
    const accessToken = await this.generateAccessToken();
    const url = `${this.baseUrl}/v2/checkout/orders`;

    // Prevents invoice duplication
    const invoiceId = createHash('md5')
      .update(`${email}-${dayjs().toISOString()}`)
      .digest('hex');

    const requestBody: CreateOrderRequestBody = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'EUR',
            value: getRawPriceValue(price),
          },
          invoice_id: invoiceId,
          custom_id: id[this.paymentEnv],
        },
      ],
    };

    const { data: orderData } = await firstValueFrom<{
      data: OrderResponseBody;
    }>(
      this.http.post<OrderResponseBody>(url, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    );

    return orderData;
  }

  // Capture payment for an order
  async capturePayment(orderId): Promise<OrderResponseBody> {
    const accessToken = await this.generateAccessToken();
    const url = `${this.baseUrl}/v2/checkout/orders/${orderId}/capture`;

    const { data: orderData } = await firstValueFrom<{
      data: OrderResponseBody;
    }>(
      this.http.post<OrderResponseBody>(
        url,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    );

    if (orderData.status !== 'COMPLETED') {
      throw new HttpException('Payment was not completed!', 400);
    }

    return orderData;
  }

  async createSubscription(
    subscriptionPlanId: string,
    paymentItem: IPaymentItem,
    userId: string,
  ): Promise<SubscriptionDetail['value']> {
    const accessToken = await this.generateAccessToken();
    const url = `${this.baseUrl}/v1/billing/subscriptions`;

    const requestBody: CreateSubscriptionRequestBody = {
      plan_id: subscriptionPlanId,
      // Throws an error, left for testing purposes
      // plan_id: 'ERRSUB033',
      custom_id: JSON.stringify({
        userId,
        priceId: paymentItem.item.id[this.paymentEnv],
      }),
    };

    const { data: subscriptionDetails } = await firstValueFrom<{
      data: SubscriptionDetail['value'];
    }>(
      this.http.post<SubscriptionDetail['value']>(url, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    );

    return subscriptionDetails;
  }

  async showSubscriptionDetails(
    subscriptionId: string,
  ): Promise<SubscriptionDetail['value']> {
    const accessToken = await this.generateAccessToken();
    const url = `${this.baseUrl}/v1/billing/subscriptions/${subscriptionId}`;

    const { data: subscriptionDetails } = await firstValueFrom<{
      data: SubscriptionDetail['value'];
    }>(
      this.http.get<SubscriptionDetail['value']>(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    );

    return subscriptionDetails;
  }

  async cancelSubscription(
    subscriptionId: string,
    reason = 'Subscription was cancelled automatically!',
  ): Promise<void> {
    const accessToken = await this.generateAccessToken();
    const url = `${this.baseUrl}/v1/billing/subscriptions/${subscriptionId}/cancel`;

    await firstValueFrom<{
      data: undefined;
    }>(
      this.http.post<undefined>(
        url,
        { reason },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    );
  }

  async verifyWebhookSignature(
    webhookVerificationBody: Partial<IPaypalWebhookVerificationBody<unknown>>,
  ): Promise<void> {
    const accessToken = await this.generateAccessToken();
    const url = `${this.baseUrl}/v1/notifications/verify-webhook-signature`;
    webhookVerificationBody.webhook_id = this.paypalWebhookId;

    const {
      data: { verification_status: verificationStatus },
    } = await firstValueFrom<{
      data: { verification_status: PaypalWebhookVerificationStatusEnum };
    }>(
      this.http.post<{
        verification_status: PaypalWebhookVerificationStatusEnum;
      }>(url, webhookVerificationBody, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    );

    if (verificationStatus === PaypalWebhookVerificationStatusEnum.Failure) {
      throw new HttpException('PayPal webhook verification failed!', 400);
    }
  }

  // Generate access token
  private async generateAccessToken(): Promise<string> {
    const basicAuth = Buffer.from(
      `${this.paypalClientId}:${this.paypalClientSecret}`,
    ).toString('base64');

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');

    const {
      data: { access_token: accessToken },
    } = await firstValueFrom<{ data: IPaypalAccessToken }>(
      this.http.post<IPaypalAccessToken>(
        `${this.baseUrl}/v1/oauth2/token`,
        params,
        {
          headers: {
            Authorization: `Basic ${basicAuth}`,
          },
        },
      ),
    );

    return accessToken;
  }

  // Could become useful later
  // async showPlanDetails(
  //   planId: string,
  // ): Promise<SubscriptionDetail['value']['plan']> {
  //   const accessToken = await this.generateAccessToken();
  //   const url = `${this.baseUrl}/v1/billing/plans/${planId}`;
  //
  //   const { data: planDetails } = await firstValueFrom<{
  //     data: SubscriptionDetail['value']['plan'];
  //   }>(
  //     this.http.get<SubscriptionDetail['value']['plan']>(url, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${accessToken}`,
  //       },
  //     }),
  //   );
  //
  //   return planDetails;
  // }

  // Could become useful later
  // Generate client token, needed for the card fields of advanced integration
  // async generateClientToken() {
  //   const accessToken = await this.generateAccessToken();
  //
  //   const {
  //     data: { client_token: clientToken },
  //   } = await firstValueFrom<{ data: { client_token: string } }>(
  //     this.http.post<any>(
  //       `${this.baseUrl}/v1/identity/generate-token`,
  //       undefined,
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'Accept-Language': 'en_US',
  //           Authorization: `Bearer ${accessToken}`,
  //         },
  //       },
  //     ),
  //   );
  //
  //   return clientToken;
  // }
}
