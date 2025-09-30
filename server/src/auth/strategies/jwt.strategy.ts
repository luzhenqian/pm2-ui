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
    this.logger.debug(`Validating JWT payload for user: ${payload.sub}`);

    const user = await this.userService.findById(payload.sub);
    if (!user) {
      this.logger.warn(`User not found: ${payload.sub}`);
      throw new UnauthorizedException('User not found');
    }

    if (user.status !== 'approved') {
      this.logger.warn(`User not approved: ${payload.sub}, status: ${user.status}`);
      throw new UnauthorizedException('User not approved');
    }

    const { password, ...result } = user;
    this.logger.debug(`JWT validation successful for user: ${user.username}`);
    return result;
  }
}