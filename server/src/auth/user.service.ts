import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, User, UserRole, UserStatus } from '../common/interfaces/user.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {
    this.ensureDefaultAdmin();
  }

  private async ensureDefaultAdmin() {
    try {
      const superAdminCount = await this.prisma.user.count({
        where: { role: 'super_admin' },
      });

      if (superAdminCount === 0) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await this.prisma.user.create({
          data: {
            username: 'admin',
            email: 'admin@pm2ui.local',
            password: hashedPassword,
            role: 'super_admin',
            status: 'approved',
          },
        });
        console.log('Default super admin user created - username: admin, password: admin123');
        console.log('IMPORTANT: Please change the default password after first login!');
      }
    } catch (error) {
      console.error('Failed to ensure default admin:', error);
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          username: createUserDto.username,
          email: createUserDto.email,
          password: hashedPassword,
          role: createUserDto.role || 'user',
          status: 'pending',
        },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          approvedBy: true,
          approvedAt: true,
        },
      });

      return user as User;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('User with this username or email already exists');
        }
      }
      throw error;
    }
  }

  async findByUsername(username: string): Promise<User | undefined> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });
    return user as User | undefined;
  }

  async findById(id: string): Promise<User | undefined> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return user as User | undefined;
  }

  async validateUser(username: string, pass: string): Promise<User | null> {
    const user = await this.findByUsername(username);
    if (user && user.password) {
      const isPasswordValid = await bcrypt.compare(pass, user.password);
      if (isPasswordValid) {
        const { password, ...result } = user;
        return result as User;
      }
    }
    return null;
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        approvedBy: true,
        approvedAt: true,
      },
    });
    return users as Omit<User, 'password'>[];
  }

  async update(id: string, updates: Partial<User>): Promise<User> {
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: updates,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          approvedBy: true,
          approvedAt: true,
        },
      });
      return user as User;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new UnauthorizedException('User not found');
        }
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const userToDelete = await this.findById(id);

    if (userToDelete?.role === UserRole.SUPER_ADMIN) {
      const superAdminCount = await this.prisma.user.count({
        where: { role: 'super_admin' },
      });

      if (superAdminCount <= 1) {
        throw new ConflictException('Cannot delete the last super admin user');
      }
    }

    await this.prisma.user.delete({
      where: { id },
    });
  }

  async getPendingUsers(): Promise<Omit<User, 'password'>[]> {
    const users = await this.prisma.user.findMany({
      where: { status: 'pending' },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        approvedBy: true,
        approvedAt: true,
      },
    });
    return users as Omit<User, 'password'>[];
  }

  async approveUser(userId: string, approvedBy: string): Promise<User> {
    return this.update(userId, {
      status: UserStatus.APPROVED,
      approvedBy,
      approvedAt: new Date(),
    });
  }

  async rejectUser(userId: string): Promise<User> {
    return this.update(userId, {
      status: UserStatus.REJECTED,
    });
  }

  async suspendUser(userId: string): Promise<User> {
    return this.update(userId, {
      status: UserStatus.SUSPENDED,
    });
  }

  async updateStatus(userId: string, status: UserStatus): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Allow changing from REJECTED to APPROVED or SUSPENDED
    return this.update(userId, { status });
  }

  async resetPassword(userId: string, newPassword: string): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Hash the new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        approvedBy: true,
        approvedAt: true,
      },
    });

    return updatedUser as User;
  }
}