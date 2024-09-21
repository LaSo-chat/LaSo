import { Controller, Post,Get, Query,Param, Body, UnauthorizedException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService, private prisma: PrismaService) {}

  @Get('contacts')
  async getContacts(@Query('userId') userId: string) {
    return this.chatService.getContactsForUser(userId);
  }

  @Get('messages/:contactId')
  async getMessages(
    @Query('userId') userId: string, // Supabase UUID
    @Param('contactId') contactId: number, // Integer contact ID
  ) {
    if (!userId || !contactId) {
      throw new Error('Invalid user or contact ID');
    }
  
    return this.chatService.getMessages(userId, contactId);
  }
    

  @Post('start')
  async startNewChat(@Body() body: { userId: string, contactId: string }) {
    const { userId, contactId } = body;

    // Ensure that both users exist
    const user = await this.prisma.user.findUnique({ where: { supabaseId: userId } });
    const contact = await this.prisma.user.findUnique({ where: { email: contactId } });

    if (!user || !contact) {
      throw new UnauthorizedException('User or contact not found');
    }

    // Create a relationship between the users in the contacts table
    return this.chatService.createContact(user.id, contact.id); // Using database IDs for relationship
  }
}
