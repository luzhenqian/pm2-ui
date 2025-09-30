import { Injectable, ExecutionContext, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    this.logger.log(`[Guard] Checking auth for: ${request.method} ${request.url}`);

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      this.logger.log(`[Guard] Route is public, allowing access`);
      return true;
    }

    const authHeader = request.headers.authorization;
    this.logger.log(`[Guard] Authorization header present: ${!!authHeader}`);
    if (authHeader) {
      this.logger.log(`[Guard] Token prefix: ${authHeader.substring(0, 20)}...`);
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    if (err || !user) {
      this.logger.error(`[Guard] Auth failed for ${request.url}`);
      this.logger.error(`[Guard] Error: ${err?.message || 'No error'}`);
      this.logger.error(`[Guard] Info: ${info?.message || info || 'No info'}`);
      this.logger.error(`[Guard] User: ${user || 'No user'}`);
      throw err || new UnauthorizedException(info?.message || 'Unauthorized');
    }

    this.logger.log(`[Guard] Auth successful for user: ${user.username}`);
    return user;
  }
}