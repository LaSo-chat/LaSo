import { Module } from '@nestjs/common';
import { GroupChatController } from './group-chat.controller';
import { GroupChatService } from './group-chat.service';
import { PrismaService } from '@/prisma/prisma.service';
import { GroupChatGateway } from './group-chat.gateway';
import { SocketService } from '@/shared/services/socket/socket.service';

@Module({
  providers: [GroupChatService, PrismaService, GroupChatGateway, SocketService],
  controllers: [GroupChatController]
})
export class GroupChatModule {}
