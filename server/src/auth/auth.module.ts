import { Module, Logger } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { PrismaService } from '../common/prisma.service';
import { JwtStrategy } from './strategies/jwt.strategy';

const logger = new Logger('AuthModule');
const jwtSecret = process.env.JWT_SECRET || 'pm2-ui-secret-key-change-in-production';
logger.log(`JWT Module configured with secret: ${jwtSecret.substring(0, 10)}...`);

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, PrismaService, JwtStrategy],
  exports: [AuthService, UserService],
})
export class AuthModule {}