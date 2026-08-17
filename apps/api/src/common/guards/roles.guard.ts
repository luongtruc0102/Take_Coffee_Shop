import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { ROLES_KEY } from '../decorators/roles.decorator';
  
  interface JwtUser {
    sub: number;
    email: string;
    role: string;
  }
  
  @Injectable()
  export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}
  
    canActivate(context: ExecutionContext): boolean {
  
      // Lấy danh sách Role được khai báo bằng @Roles(...)
      const requiredRoles = this.reflector.getAllAndOverride<string[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );
  
      // API không có @Roles() thì không cần kiểm tra Role
      if (!requiredRoles || requiredRoles.length === 0) {
        return true;
      }
  
      // Lấy User mà JwtAuthGuard đã gắn vào request
      const request = context.switchToHttp().getRequest();
      const user = request.user as JwtUser;
  
      // Kiểm tra Role của User có được phép truy cập API hay không
      if (!user || !requiredRoles.includes(user.role)) {
        throw new ForbiddenException(
          'Bạn không có quyền truy cập chức năng này',
        );
      }
  
      return true;
    }
  }