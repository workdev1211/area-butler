import { Body, Controller, HttpCode, Post, Req, Res } from "@nestjs/common";
import { BillingService } from "./billing.service";


@Controller('api/billing')
export class BillingWebhookController {


    constructor(private billingService: BillingService) {}

    @Post('webhook')
    @HttpCode(200)
    async consumeWebhook(@Req() request, @Body() body: any) : Promise<void> {
        this.billingService.consumeWebhook(request, body);
    }

}