import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {SubscriptionListener} from './listener/subscription.listener';
import {User, Userschema} from './schema/user.schema';
import {UserController} from './user.controller';
import {UserService} from './user.service';
import {Subscription, Subscriptionschema} from "./schema/subscription.schema";
import {SubscriptionService} from "./subscription.service";
import {ClientModule} from "../client/client.module";
import { InviteCode, InviteCodeSchema } from './schema/invite-code.schema';
import { InviteCodeService } from './invite-code.service';
import {InviteCodeController} from "./invite-code.controller";

@Module({
    imports: [
        MongooseModule.forFeature([{name: User.name, schema: Userschema}, {
            name: Subscription.name,
            schema: Subscriptionschema
        },
        {
            name: InviteCode.name,
            schema: InviteCodeSchema
        },
    
    ]),
        ClientModule
    ],
    providers: [UserService, SubscriptionService, SubscriptionListener, InviteCodeService],
    exports: [UserService, SubscriptionService],
    controllers: [UserController, InviteCodeController],
})
export class UserModule {
}
