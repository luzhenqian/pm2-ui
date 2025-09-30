import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
import { User, LoginDto, JwtPayload, AuthResponse, UserStatus } from '../common/interfaces/user.interface';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    return this.userService.validateUser(username, password);
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.username, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === UserStatus.PENDING) {
      throw new UnauthorizedException('Your account is pending approval. Please wait for an administrator to approve your account.');
    }

    if (user.status === UserStatus.REJECTED) {
      throw new UnauthorizedException('Your account has been rejected. Please contact an administrator.');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('Your account has been suspended. Please contact an administrator.');
    }

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async register(createUserDto: any): Promise<AuthResponse> {
    const user = await this.userService.create(createUserDto);

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async validateToken(token: string): Promise<User | null> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      const user = await this.userService.findById(payload.sub);
      if (user) {
        const { password, ...result } = user;
        return result as User;
      }
      return null;
    } catch {
      return null;
    }
  }
}