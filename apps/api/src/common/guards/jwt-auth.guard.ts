import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { Request } from 'express';
  import { Reflector } from '@nestjs/core';
  import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
  
  interface JwtPayload {
    sub: number;
    email: string;
    role: string;
  }
  
  // Request sau khi JWT được xác thực sẽ có thêm user
  interface AuthenticatedRequest extends Request {
    user: JwtPayload;
  }
  
  @Injectable()
  export class JwtAuthGuard implements CanActivate {
    constructor(
      private readonly jwtService: JwtService,
      private readonly reflector: Reflector,
    ) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {

      // Kiểm tra API có được đánh dấu @Public() hay không
      const isPublic = this.reflector.getAllAndOverride<boolean>(
        IS_PUBLIC_KEY,
        [context.getHandler(), context.getClass()],
      );

      // API public thì bỏ qua bước kiểm tra Access Token
      if (isPublic) {
        return true;
      }

      const request = context
        .switchToHttp()
        .getRequest<AuthenticatedRequest>();
  
      const token = this.extractTokenFromHeader(request);
  
      if (!token) {
        throw new UnauthorizedException('Không tìm thấy Access Token');
      }
  
      try {
        // Xác thực chữ ký và thời hạn của JWT
        const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
  
        request.user = payload;
  
        return true;
      } catch {
        throw new UnauthorizedException(
          'Access Token không hợp lệ hoặc đã hết hạn',
        );
      }
    }
  
    private extractTokenFromHeader(request: Request): string | undefined {
      const [type, token] = request.headers.authorization?.split(' ') ?? [];
  
      // Authorization phải có dạng: Bearer <token>
      return type === 'Bearer' ? token : undefined;
    }
  }