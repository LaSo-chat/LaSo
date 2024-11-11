import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TranslationServiceClient } from '@google-cloud/translate';

@Injectable()
export class GroupChatService {
  private translationClient: TranslationServiceClient;

  constructor(private prisma: PrismaService) {
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
  async getGroupsForUser(supabaseId: string) {
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

    return {
      ...message,
      translations: translations.filter(Boolean),
    };
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