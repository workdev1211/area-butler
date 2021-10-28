import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {UserListener} from './listener/user.listener';
import {User, Userschema} from './schema/user.schema';
import {UserController} from './user.controller';
import {UserService} from './user.service';
import {Subscription, Subscriptionschema} from "./schema/subscription.schema";

@Module({
    imports: [
        MongooseModule.forFeature([{name: User.name, schema: Userschema}, {
            name: Subscription.name,
            schema: Subscriptionschema
        }]),
    ],
    providers: [UserService, UserListener],
    exports: [UserService],
    controllers: [UserController],
})
export class UserModule {
}
