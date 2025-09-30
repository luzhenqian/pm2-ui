import { Controller, Post, Body, UseGuards, Get, Request, HttpCode, HttpStatus, Param, Delete, Headers, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { CreateUserDto, LoginDto, UserRole, UserStatus } from '../common/interfaces/user.interface';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { JwtService } from '@nestjs/jwt';

@Controller('api/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('users')
  async getUsers() {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Request() req: any, @Body() body: { newPassword: string }) {
    return this.userService.update(req.user.id, { password: body.newPassword });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Post('users/:id/role')
  async updateUserRole(@Param('id') userId: string, @Body() body: { role: UserRole }) {
    return this.userService.update(userId, { role: body.role });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('users/pending')
  async getPendingUsers() {
    return this.userService.getPendingUsers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Post('users/:id/approve')
  async approveUser(@Param('id') userId: string, @Request() req: any) {
    return this.userService.approveUser(userId, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Post('users/:id/reject')
  async rejectUser(@Param('id') userId: string) {
    return this.userService.rejectUser(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Post('users/:id/suspend')
  async suspendUser(@Param('id') userId: string) {
    return this.userService.suspendUser(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Post('users/:id/status')
  async updateUserStatus(@Param('id') userId: string, @Body() body: { status: UserStatus }) {
    return this.userService.updateStatus(userId, body.status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Post('users/:id/reset-password')
  async resetUserPassword(@Param('id') userId: string, @Body() body: { newPassword: string }) {
    return this.userService.resetPassword(userId, body.newPassword);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Delete('users/:id')
  async deleteUser(@Param('id') userId: string) {
    await this.userService.delete(userId);
    return { message: 'User deleted successfully' };
  }

  @Public()
  @Post('debug-token')
  async debugToken(@Headers('authorization') authorization: string) {
    try {
      if (!authorization) {
        return { error: 'No authorization header' };
      }

      const token = authorization.replace('Bearer ', '');

      // Try to decode without verification first
      const decoded = this.jwtService.decode(token);
      this.logger.log(`Token decoded: ${JSON.stringify(decoded)}`);

      // Try to verify with current secret
      try {
        const verified = this.jwtService.verify(token);
        this.logger.log(`Token verified successfully`);
        return {
          success: true,
          decoded,
          verified,
          message: 'Token is valid'
        };
      } catch (verifyError) {
        this.logger.error(`Token verification failed: ${verifyError.message}`);
        return {
          success: false,
          decoded,
          error: verifyError.message,
          message: 'Token signature is invalid - JWT_SECRET mismatch'
        };
      }
    } catch (error) {
      this.logger.error(`Debug token error: ${error.message}`);
      return { error: error.message };
    }
  }
}