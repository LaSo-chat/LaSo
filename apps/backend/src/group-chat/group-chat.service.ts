import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TranslationServiceClient } from '@google-cloud/translate';
import { NotificationService } from '@/notification/notification.service';
import { SocketService } from '@/shared/services/socket/socket.service';

@Injectable()
export class GroupChatService {
  private translationClient: TranslationServiceClient;

  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService, // FCM service
    private socketService: SocketService
  ) {
    this.translationClient = new TranslationServiceClient({
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
  }

  // Create a new group
  async createGroup(creatorSupabaseId: string, name: string, description: string, memberEmails: string[]) {
    const creator = await this.prisma.user.findUnique({
      where: { supabaseId: creatorSupabaseId },
    });

    if (!creator) {
      throw new NotFoundException('Creator not found');
    }

    // Find all users by their emails
    const members = await this.prisma.user.findMany({
      where: {
        email: {
          in: memberEmails,
        },
      },
    });

    // Create the group and add members in a transaction
    return this.prisma.$transaction(async (prisma) => {
      // Create the group
      const group = await prisma.group.create({
        data: {
          name,
          description,
          creatorId: creator.id,
        },
      });

      // Add creator as admin
      await prisma.groupMember.create({
        data: {
          groupId: group.id,
          userId: creator.id,
          role: 'ADMIN',
        },
      });

      // Add other members
      const memberPromises = members.map((member) =>
        prisma.groupMember.create({
          data: {
            groupId: group.id,
            userId: member.id,
            role: 'MEMBER',
          },
        })
      );

      await Promise.all(memberPromises);

      return group;
    });
  }

  // Get all groups for a user
  async getGroupsForUser(supabaseId: string, limit?: number) {
    const user = await this.prisma.user.findUnique({
      where: { supabaseId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const groupMemberships = await this.prisma.groupMember.findMany({
      where: {
        userId: user.id,
      },
      include: {
        group: {
          include: {
            members: {
              include: {
                user: true,
              },
            },
            messages: {
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
              include: {
                sender: true,
              },
            },
          },
        },
      },
      take: limit
    });

    return groupMemberships.map((membership) => ({
      ...membership.group,
      memberCount: membership.group.members.length,
      lastMessage: membership.group.messages[0] || null,
      role: membership.role,
    }));
  }

  // Send a message to a group
  async createGroupMessage(senderSupabaseId: string, groupId: number, content: string) {
    const sender = await this.prisma.user.findUnique({
      where: { supabaseId: senderSupabaseId },
    });

    if (!sender) {
      throw new NotFoundException('Sender not found');
    }

    // Verify sender is a member of the group
    const membership = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: sender.id,
        },
      },
      include: {
        group: true, // Include group details
      },
    });

    if (!membership) {
      throw new BadRequestException('User is not a member of this group');
    }

    // Create the message
    const message = await this.prisma.groupMessage.create({
      data: {
        content,
        groupId,
        senderId: sender.id,
      },
      include: {
        sender: true,
      },
    });

    // Get all group members and their preferred languages
    const groupMembers = await this.prisma.groupMember.findMany({
      where: { groupId },
      include: {
        user: true,
      },
    });

    // Translate the message for each member with a different preferred language
    const translations = await Promise.all(
      groupMembers.map(async ({ user }) => {
        if (user.id !== sender.id && user.preferredLang) {
          const [translation] = await this.translationClient.translateText({
            contents: [content],
            targetLanguageCode: user.preferredLang,
            parent: `projects/${process.env.GOOGLE_CLOUD_PROJECT}/locations/global`,
          });
          console.log(translation.translations,'++++++++++++++++++++++++++translation');
          return {
            userId: user.id,
            translatedContent: translation.translations[0].translatedText,
          };
        }
        return null;
      })
    );

// Prepare group message data
const messageWithTranslations = {
  ...message,
  translations: translations.filter(Boolean),
};

// Send notifications to group members
await Promise.all(
  groupMembers
  .filter(({ user }) => user.id !== sender.id)
  .map(async ({ user }) => {
    // Find the translated content for this user
    const translatedContent = translations.find(t => t?.userId === user.id)?.translatedContent || content;

    // Check if user is online
    const isOnline = await this.socketService.isUserOnline(user.supabaseId);

    if (isOnline) {
      // Send in-app notification
      this.socketService.sendInAppNotification(user.supabaseId, 'group_notification', {
        type: 'group_notification',
        data: {
          messageWithTranslations: messageWithTranslations,
          group: membership.group
        },
      });
    } else {
      // Send FCM notification if user is offline
      if (user.fcmToken) {
        await this.notificationService.sendFCM({
          token: user.fcmToken,
          title: `New message in ${membership.group.name}`, // Assuming group has a name property
          body: translatedContent,
          data: {
            groupId: groupId.toString(),
            messageId: message.id.toString(),
            translatedContent: translatedContent,
          },
        });
        console.log(`FCM notification sent to user ${user.id} for group ${groupId}`);
      }
    }
  })
);

return messageWithTranslations;
  }

  // Get messages for a group
  async getGroupMessages(userSupabaseId: string, groupId: number, offset: number = 0) {
    console.log(userSupabaseId,'--------------------userSupabaseId');

    const user = await this.prisma.user.findUnique({
      where: { supabaseId: userSupabaseId },
    });

    console.log(user,'----------------user');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify user is a member of the group
    const membership = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: user.id,
        },
      },
    });

    if (!membership) {
      throw new BadRequestException('User is not a member of this group');
    }

    const messages = await this.prisma.groupMessage.findMany({
      where: { groupId },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: 50,
      include: {
        sender: true,
      },
    });

    // Translate messages if necessary
    const translatedMessages = await Promise.all(
      messages.map(async (msg) => {
        if (msg.senderId !== user.id && user.preferredLang) {
          const [translation] = await this.translationClient.translateText({
            contents: [msg.content],
            targetLanguageCode: user.preferredLang,
            parent: `projects/${process.env.GOOGLE_CLOUD_PROJECT}/locations/global`,
          });
          return { ...msg, translatedContent: translation.translations[0].translatedText };
        }
        return msg;
      })
    );

    return translatedMessages.reverse();
  }

  // Mark group messages as read
  async markGroupMessagesAsRead(userSupabaseId: string, groupId: number) {
    const user = await this.prisma.user.findUnique({
      where: { supabaseId: userSupabaseId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updateResult = await this.prisma.groupMessage.updateMany({
      where: {
        groupId,
        isRead: false,
        NOT: {
          senderId: user.id,
        },
      },
      data: { isRead: true },
    });

    return {
      message: 'Messages marked as read',
      updatedCount: updateResult.count,
    };
  }
}