import { Module } from '@nestjs/common';
import { GroupChatController } from './group-chat.controller';
import { GroupChatService } from './group-chat.service';
import { PrismaService } from '@/prisma/prisma.service';
import { GroupChatGateway } from './group-chat.gateway';
import { SocketService } from '@/shared/services/socket/socket.service';
import { NotificationService } from '@/notification/notification.service';
import { FirebaseModule } from '@/firebase/firebase.module';

@Module({
  providers: [GroupChatService, PrismaService, GroupChatGateway, SocketService, NotificationService],
  controllers: [GroupChatController],
  imports: [FirebaseModule]
})
export class GroupChatModule {}
