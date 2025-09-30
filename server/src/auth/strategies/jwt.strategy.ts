import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../../common/interfaces/user.interface';
import { UserService } from '../user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'pm2-ui-secret-key-change-in-production',
    });

    // Log the JWT_SECRET being used (only first 10 chars for security)
    const secret = process.env.JWT_SECRET || 'pm2-ui-secret-key-change-in-production';
    this.logger.log(`JWT Strategy initialized with secret: ${secret.substring(0, 10)}...`);
  }

  async validate(payload: JwtPayload) {
    this.logger.log(`[JWT] Validating JWT payload for user: ${payload.sub}`);
    this.logger.log(`[JWT] Payload: ${JSON.stringify(payload)}`);

    const user = await this.userService.findById(payload.sub);
    if (!user) {
      this.logger.error(`[JWT] User not found: ${payload.sub}`);
      throw new UnauthorizedException('User not found');
    }

    this.logger.log(`[JWT] User found: ${user.username}, status: ${user.status}, role: ${user.role}`);

    if (user.status !== 'approved') {
      this.logger.error(`[JWT] User not approved: ${payload.sub}, status: ${user.status}`);
      throw new UnauthorizedException('User not approved');
    }

    const { password, ...result } = user;
    this.logger.log(`[JWT] Validation successful for user: ${user.username}`);
    return result;
  }
}