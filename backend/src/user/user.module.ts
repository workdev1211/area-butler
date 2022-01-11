import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {SubscriptionListener} from './listener/subscription.listener';
import {User, Userschema} from './schema/user.schema';
import {UserController} from './user.controller';
import {UserService} from './user.service';
import {Subscription, Subscriptionschema} from "./schema/subscription.schema";
import {SubscriptionService} from "./subscription.service";
import {ClientModule} from "../client/client.module";

@Module({
    imports: [
        MongooseModule.forFeature([{name: User.name, schema: Userschema}, {
            name: Subscription.name,
            schema: Subscriptionschema
        }
    ]),
        ClientModule
    ],
    providers: [UserService, SubscriptionService, SubscriptionListener],
    exports: [UserService, SubscriptionService],
    controllers: [UserController],
})
export class UserModule {
}
