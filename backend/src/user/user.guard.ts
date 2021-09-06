import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { UserService } from "./user.service";

@Injectable()
export class UserGuard implements CanActivate {
  constructor(private userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const email = request.user?.email;
    const user = await this.userService.findByEmail(email);
    if (!!user) {
      request.principal = user;
    }
    return true;
  }
}