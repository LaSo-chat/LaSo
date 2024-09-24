// src/chat/chat.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Translate } from '@google-cloud/translate/build/src/v2';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  private translate = new Translate({
    key: process.env.GOOGLE_TRANSLATE_API_KEY // replace with your actual API key
  });

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
    throw new Error('Receiver not found');
  }

  // Step 3: Check if the message needs to be translated (if the receiver has a different preferred language)
  let translatedContent = content;  // Default to original content

  if (senderId !== receiverId && receiver.preferredLang) {
    // Translate the content if the sender and receiver are different and the receiver has a preferred language
    const [translatedText] = await this.translate.translate(
      content,
      receiver.preferredLang
    );
    translatedContent = translatedText;
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
    throw new Error('User not found');
  }

  const senderId = user.id; // Get the internal user ID

  // Step 2: Retrieve the contact relationship
  const contactRelation = await this.prisma.contact.findFirst({
    where: { userId: +senderId, id: +contactId },
    include: { receiver: true }  // Include receiver information
  });

  if (!contactRelation) {
    throw new Error('No contact relationship found between users.');
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

  console.log(receiver,"messages----------------------");
  console.log(messages,"messages----------------------");
  

  const translatedMessages = await Promise.all(
    messages.map(async (msg) => {
      if (msg.senderId != senderId) {
        const [translatedText] = await this.translate.translate(
          msg.content,
          user.preferredLang
        );
        return { ...msg, translatedContent: translatedText };
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
      throw new Error('User not found');
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
          // console.log(contact,'-------------------contact');
          
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



}
