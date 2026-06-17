import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminApiKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const key = request.headers['x-admin-api-key'];

    if (key !== this.config.getOrThrow<string>('ADMIN_API_KEY')) {
      throw new UnauthorizedException('Invalid admin API key');
    }
    return true;
  }
}
