import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  providers: [ChatGateway, ChatService, PrismaService],
  controllers: [ChatController]
})
export class ChatModule {}
