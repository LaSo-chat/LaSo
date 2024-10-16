// src/chat/chat.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TranslationServiceClient } from '@google-cloud/translate'; // Import v3 client

@Injectable()
export class ChatService {
  private translationClient: TranslationServiceClient;

  constructor(private prisma: PrismaService) {
    // Initialize the translation client
    this.translationClient = new TranslationServiceClient();
  }

  // Create a message between two users with translation support
  async createMessage(senderId: number, receiverId: number, content: string) {
    console.log(senderId, "senderId");
    console.log(receiverId, "receiverId");
    console.log(content, "content");

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

    // Step 3: Check if the message needs to be translated (if the receiver has a different preferred language)
    let translatedContent = content;  // Default to original content

    if (senderId !== receiverId && receiver.preferredLang) {
      // Translate the content if the sender and receiver are different and the receiver has a preferred language
      const [translation] = await this.translationClient.translateText({
        contents: [content],
        targetLanguageCode: receiver.preferredLang,
        parent: `projects/${process.env.GOOGLE_CLOUD_PROJECT}/locations/global`, // Add your Google Cloud project ID
      });
      translatedContent = translation.translations[0].translatedText;
    }

    // Step 4: Add the translated content to the message object
    const messageWithTranslation = { ...message, translatedContent };

    console.log(messageWithTranslation, "messageWithTranslation");

    return messageWithTranslation;
  }

  // Get messages between two users (supabaseId for sender, internal ID for receiver)
  async getMessages(supabaseId: string, contactId: number) {
    // Step 1: Fetch the internal user ID using Supabase UUID
    const user = await this.prisma.user.findUnique({
      where: { supabaseId: supabaseId }, 
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const senderId = user.id; // Get the internal user ID

    // Step 2: Retrieve the contact relationship
    const contactRelation = await this.prisma.contact.findFirst({
      where: { userId: +senderId, id: +contactId },
      include: { receiver: true }  // Include receiver information
    });

    if (!contactRelation) {
      throw new NotFoundException('No contact relationship found between users.');
    }

    // Step 3: Use the relationship to fetch messages between sender and receiver
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          { senderId, receiverId: +contactRelation.receiverId },  // User is sender
          { senderId: contactRelation.receiverId, receiverId: +senderId },  // User is receiver
        ],
      },
      orderBy: {
        createdAt: 'asc',  // Order messages by the time of creation
      },
      include: {
        sender: { select: { supabaseId: true } }, // Include sender's Supabase UUID
        receiver: { select: { supabaseId: true } } // Include receiver's Supabase UUID
      },
    });

    const receiver = await this.prisma.user.findUnique({
      where: { id: contactRelation.receiverId },
    });

    console.log(receiver, "messages----------------------");
    console.log(messages, "messages----------------------");

    const translatedMessages = await Promise.all(
      messages.map(async (msg) => {
        if (msg.senderId != senderId) {
          const [translation] = await this.translationClient.translateText({
            contents: [msg.content],
            targetLanguageCode: user.preferredLang,
            parent: `projects/${process.env.GOOGLE_CLOUD_PROJECT}/locations/global`, // Add your Google Cloud project ID
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
  async getContactsForUser(supabaseId: string) {
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

}
