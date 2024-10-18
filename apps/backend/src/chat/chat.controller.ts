import { Controller, Post,Get, Query,Param, Body, UnauthorizedException, BadRequestException } from '@nestjs/common';
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
  @Query('offset') offset: string = '0', // Optional offset for pagination (default to '0')
) {
  // Validate query parameters
  if (!userId || !contactId) {
    throw new BadRequestException('Invalid user or contact ID');
  }

  // Convert offset to a number and ensure it's valid
  const parsedOffset = parseInt(offset, 10);
  if (isNaN(parsedOffset) || parsedOffset < 0) {
    throw new BadRequestException('Invalid offset value');
  }

  // Call the chat service to fetch messages
  return this.chatService.getMessages(userId, contactId, parsedOffset);
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


  @Post('markMessagesAsRead')
  async markMessagesAsRead(@Body() body: { userId: string; chatId: number }) {
    const { userId, chatId } = body;

    // Verify if the user exists
    const user = await this.prisma.user.findUnique({ where: { supabaseId: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Retrieve the receiverId from the Contact table
    const contact = await this.prisma.contact.findUnique({
      where: { id: chatId },
    });

    if (!contact || contact.userId !== user.id) {
      throw new UnauthorizedException('Invalid contact or unauthorized access');
    }

    // Call the service to mark messages as read using the user and receiver IDs
    return this.chatService.markMessagesAsRead(user.id, contact.receiverId);
  }
}
