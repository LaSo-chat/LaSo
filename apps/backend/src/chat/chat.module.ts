import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { PrismaService } from '@/prisma/prisma.service';
import { SocketService } from '@/shared/services/socket/socket.service';
import { NotificationService } from '@/notification/notification.service';
import { FirebaseModule } from '@/firebase/firebase.module';

@Module({
  providers: [ChatGateway, ChatService, PrismaService, SocketService, NotificationService],
  controllers: [ChatController],
  imports: [FirebaseModule]
})
export class ChatModule {}
