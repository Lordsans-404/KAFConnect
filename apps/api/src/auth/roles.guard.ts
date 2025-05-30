import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get the required roles from metadata
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    Logger.log("Here is the admin")
    if (!user || !user.level) {
      throw new ForbiddenException('User role is missing');
    }

    if (!requiredRoles.includes(user.level)) {
      throw new ForbiddenException('Not an admin or staff');
    }
    if(user.level == 'admin' || user.level == 'staff' || user.level == 'super_admin'){
      Logger.log("Yap ini admin/staff")
      Logger.log(user.level)
    }


    return true;
  }
}
