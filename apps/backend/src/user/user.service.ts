import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async updateFcmToken(userId: string, fcmToken: string): Promise<User> {
    try {
      // Attempt to update the FCM token for the existing user
      const user = await this.prisma.user.update({
        where: { supabaseId: userId },
        data: { fcmToken },
      });

      return user;
    } catch (error) {
      // If the user is not found, throw an exception
      throw new NotFoundException(`User with id ${userId} not found`);
    }
  }
}
