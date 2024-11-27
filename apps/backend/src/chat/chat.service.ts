// src/chat/chat.service.ts
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TranslationServiceClient } from '@google-cloud/translate'; // Import v3 client
import { NotificationService } from '@/notification/notification.service';
import { SocketService } from '@/shared/services/socket/socket.service';

@Injectable()
export class ChatService {
  private translationClient: TranslationServiceClient;

  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService, // FCM service
    private socketService: SocketService // WebSocket service
  ) {
    // Initialize the translation client
    this.translationClient = new TranslationServiceClient({
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
  }

  async createMessage(senderId: number, receiverId: number, content: string) {
    console.log(senderId, 'senderId');
    console.log(receiverId, 'receiverId');
    console.log(content, 'content');
  
    // Step 1: Create the message
    const message = await this.prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
      },
    });
  
    // Step 2: Fetch the receiver's preferred language
    const receiver = await this.prisma.user.findUnique({
      where: { id: receiverId },
    });
  
    if (!receiver) {
      throw new NotFoundException('Receiver not found');
    }

    // Check if the contact exists
    const contact = await this.prisma.contact.findFirst({
      where: {
        userId: senderId,
        receiverId: receiverId,
      },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }
  
    // Step 3: Translate the message if needed
    let translatedContent = content;
    if (senderId !== receiverId && receiver.preferredLang) {
      const [translation] = await this.translationClient.translateText({
        contents: [content],
        targetLanguageCode: receiver.preferredLang,
        parent: `projects/${process.env.GOOGLE_CLOUD_PROJECT}/locations/global`,
      });
      translatedContent = translation.translations[0].translatedText;
    }
  
    const messageWithTranslation = { ...message, translatedContent, contact };
  
    // Step 4: Check if receiver is online
    // const receiverIdString = receiverId.toString(); // Convert number to string
    // console.log(receiverIdString,'-------receiverIdString');/
    
    const isOnline = await this.socketService.isUserOnline(receiver.supabaseId);
    // const isOnline = false;
  
    if (isOnline) {
      // Send in-app notification
      this.socketService.sendInAppNotification(receiver.supabaseId, 'notification', {
        type: 'notification',
        data: {
          messageWithTranslation:  messageWithTranslation,
          contact: contact
        },
      });
    } else {
      // Send FCM notification
      await this.notificationService.sendFCM({
        token: receiver.fcmToken, // Assuming FCM token is stored in the database
        title: receiver.fullName,
        body: messageWithTranslation.content,
        data: {
          content: content,
          contactId: contact.id.toString(),
          translatedContent: translatedContent

        },
      });
      console.log(`FCM notification sent to user ${receiverId}`);
    }
  
    return messageWithTranslation;
  }
  

  // Get messages between two users (Supabase ID for sender, internal ID for receiver)
async getMessages(supabaseId: string, contactId: number, offset: number = 0) {
  // Step 1: Fetch the internal user ID using the Supabase UUID
  const user = await this.prisma.user.findUnique({
    where: { supabaseId },
  });


  if (!user) {
    throw new NotFoundException('User not found');
  }

  const senderId = user.id; // Internal user ID

  // Step 2: Retrieve the contact relationship
  const contactRelation = await this.prisma.contact.findFirst({
    where: { userId: senderId, id: +contactId },
    include: { receiver: true }, // Include receiver information
  });

  if (!contactRelation) {
    throw new NotFoundException('No contact relationship found between users.');
  }

  const receiverId = contactRelation.receiverId;

  // Step 3: Fetch the latest 50 messages with pagination
  const messages = await this.prisma.message.findMany({
    where: {
      OR: [
        { senderId, receiverId }, // Sender is the user
        { senderId: receiverId, receiverId: senderId }, // Receiver is the user
      ],
    },
    orderBy: { createdAt: 'desc' }, // Get the latest messages first
    skip: offset, // Pagination offset
    take: 50, // Limit to 50 messages per request
    include: {
      sender: { select: { supabaseId: true } }, // Include sender’s Supabase UUID
      receiver: { select: { supabaseId: true } }, // Include receiver’s Supabase UUID
    },
  });

  // Step 4: Reverse the order to display messages from oldest to newest
  const sortedMessages = messages.reverse();

  

  // Step 5: Translate messages if necessary
  const translatedMessages = await Promise.all(
    sortedMessages.map(async (msg) => {
      // Only translate if the sender isn't the current user
      if (msg.senderId !== senderId) {
        const [translation] = await this.translationClient.translateText({
          contents: [msg.content],
          targetLanguageCode: user.preferredLang,
          parent: `projects/${process.env.GOOGLE_CLOUD_PROJECT}/locations/global`, // Google Cloud project ID
        });

        return { ...msg, translatedContent: translation.translations[0].translatedText };
      }
      return msg;
    })
  );

  return translatedMessages;
}



  // Create a relationship between users
  async createContact(userId: number, receiverId: number) {
    // Check if the relationship already exists in either direction
    const existingContact = await this.prisma.contact.findFirst({
      where: {
        OR: [
          { userId, receiverId },   // User 1 -> User 2
          { userId: receiverId, receiverId: userId }, // User 2 -> User 1
        ],
      },
    });

    // If no existing contact, create bidirectional contacts
    if (!existingContact) {
      // Create the first contact (User 1 -> User 2)
      await this.prisma.contact.create({
        data: {
          userId,
          receiverId,
        },
      });

      // Create the reverse contact (User 2 -> User 1)
      await this.prisma.contact.create({
        data: {
          userId: receiverId,
          receiverId: userId,
        },
      });
    }

    // Return a success message or the existing contact
    return existingContact || { message: 'Contacts created successfully' };
  }

  // Get the contacts for the logged-in user
  async getContactsForUser(supabaseId: string, limit?: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { supabaseId: supabaseId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const contacts = await this.prisma.contact.findMany({
        where: {
          OR: [
            { userId: user.id },
            { receiverId: user.id },
          ],
        },
        include: {
          user: true,
          receiver: true
        },
        take: limit,
      });

      const filteredContacts = contacts.filter(
        (contact) => contact.receiverId !== user.id
      );

      const contactsWithLastMessage = await Promise.all(
        filteredContacts.map(async (contact) => {
          try {
            const lastMessage = await this.prisma.message.findFirst({
              where: {
                OR: [
                  { senderId: contact.userId, receiverId: contact.receiverId },
                  { senderId: contact.receiverId, receiverId: contact.userId },
                ],
              },
              orderBy: {
                createdAt: 'desc',
              },
            });

            return {
              ...contact,
              lastMessage,
            };
          } catch (error) {
            console.log(`Error fetching last message for contact ${contact.id}:`, error);
            return {
              ...contact,
              lastMessage: null,
            };
          }
        })
      );

      return contactsWithLastMessage;
    } catch (error) {
      console.log('Error in getContactsForUser:', error);
      throw error;
    }
  }



  async markMessagesAsRead(userId: number, receiverId: number) {
    // Ensure that messages between these two users exist and are unread
    const existingMessages = await this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId },
          { senderId: receiverId, receiverId: userId },
        ],
        isRead: false, // Only check unread messages
      },
    });

    // If there are no unread messages, log a message instead of throwing an error
    if (existingMessages.length === 0) {
      console.log('No unread messages found to mark as read');
      return {
        message: 'No unread messages found',
        updatedCount: 0, // Indicate that no messages were updated
      };
    }

    // Update the unread messages as read
    const updateResult = await this.prisma.message.updateMany({
      where: {
        OR: [
          { senderId: userId, receiverId },
          { senderId: receiverId, receiverId: userId },
        ],
        isRead: false,
      },
      data: { isRead: true },
    });

    return {
      message: 'Messages marked as read',
      updatedCount: updateResult.count, // Number of messages updated
    };
}












async deleteContact(currentUserId: number, contactId: number) {
  console.log(typeof(currentUserId),'------------currentUserId');
  console.log(typeof(contactId),'------------contactId');
  
  try {
    //Find the contact
    const contact = await this.prisma.contact.findMany({
      where: {
        OR: [
          { 
            userId: +currentUserId, 
            receiverId: +contactId 
          },
          { 
            userId: +contactId, 
            receiverId: +currentUserId 
          }
        ]
      }
    });

    // console.log(contact,'==============================contact');

    // If no contact found, throw a NotFoundException
    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    // Use a transaction to ensure atomic operations
    await this.prisma.$transaction(async (prisma) => {
      // Delete all messages between users
      await prisma.message.deleteMany({
        where: {
          OR: [
            { 
              senderId: currentUserId, 
              receiverId: contactId 
            },
            { 
              senderId: contactId, 
              receiverId: currentUserId 
            }
          ]
        }
      });

      // Delete the contact
      await prisma.contact.deleteMany({
        where: {
          OR: [
            { 
              userId: currentUserId, 
              receiverId: contactId 
            },
            { 
              userId: contactId, 
              receiverId: currentUserId 
            }
          ]
        }
      });
    });

    return { 
      message: 'Contact deleted successfully',
      contactId 
    };
  } catch (error) {
    // Log the error for internal tracking
    console.error('Contact deletion error:', error);

    // Rethrow known errors, wrap unknown errors
    if (error instanceof NotFoundException) {
      throw error;
    }

    throw new InternalServerErrorException('Failed to delete contact');
  }
}

}
