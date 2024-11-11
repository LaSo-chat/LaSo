import { Module } from '@nestjs/common';
import { GroupChatController } from './group-chat.controller';
import { GroupChatService } from './group-chat.service';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  providers: [GroupChatService, PrismaService],
  controllers: [GroupChatController]
})
export class GroupChatModule {}
