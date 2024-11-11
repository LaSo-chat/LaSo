import {
    Controller,
    Post,
    Get,
    Body,
    Query,
    Param,
    UnauthorizedException,
    BadRequestException,
  } from '@nestjs/common';
  import { GroupChatService } from './group-chat.service';
  
  @Controller('groups')
  export class GroupChatController {
    constructor(private readonly groupChatService: GroupChatService) {}
  
    @Post('create')
    async createGroup(
      @Body()
      body: {
        userId: string;
        name: string;
        description: string;
        members: string[];
      },
    ) {
      const { userId, name, description, members } = body;
  
      if (!userId || !name || !members.length) {
        throw new BadRequestException('Missing required fields');
      }
  
      return this.groupChatService.createGroup(userId, name, description, members);
    }
  
    @Get('getGroups')
    async getGroups(@Query('userId') userId: string) {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }
  
      return this.groupChatService.getGroupsForUser(userId);
    }
  
    @Get(':groupId/messages')
    async getGroupMessages(
      @Query('userId') userId: string,
      @Param('groupId') groupId: string,
      @Query('offset') offset: string = '0',
    ) {

        console.log(userId,'----------------userId');
        console.log(groupId,'----------------groupId');
        console.log(offset,'----------------offset');
        
      if (!userId || !groupId) {
        throw new BadRequestException('Missing required parameters');
      }
  
      const parsedGroupId = parseInt(groupId, 10);
      const parsedOffset = parseInt(offset, 10);
  
      if (isNaN(parsedGroupId) || isNaN(parsedOffset) || parsedOffset < 0) {
        throw new BadRequestException('Invalid group ID or offset');
      }
  
      return this.groupChatService.getGroupMessages(userId, parsedGroupId, parsedOffset);
    }
  
    @Post(':groupId/messages')
    async sendGroupMessage(
      @Param('groupId') groupId: string,
      @Body() body: { userId: string; content: string },
    ) {
      const { userId, content } = body;
  
      if (!userId || !content || !groupId) {
        throw new BadRequestException('Missing required fields');
      }
  
      const parsedGroupId = parseInt(groupId, 10);
      if (isNaN(parsedGroupId)) {
        throw new BadRequestException('Invalid group ID');
      }
  
      return this.groupChatService.createGroupMessage(userId, parsedGroupId, content);
    }
  
    @Post(':groupId/messages/read')
    async markGroupMessagesAsRead(
      @Param('groupId') groupId: string,
      @Query('userId') userId: string,
    ) {

      console.log(groupId,'==================groupId');
      console.log(userId,'==================userId');
  
      if (!userId || !groupId) {
        throw new BadRequestException('Missing required fields');
      }
  
      const parsedGroupId = parseInt(groupId, 10);
      if (isNaN(parsedGroupId)) {
        throw new BadRequestException('Invalid group ID');
      }
  
      return this.groupChatService.markGroupMessagesAsRead(userId, parsedGroupId);
    }
  }