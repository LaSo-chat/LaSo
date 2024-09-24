import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: ['https://laso-frontend.vercel.app', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket'],
})

export class ChatGateway {
  @WebSocketServer() server: Server;
  private userSocketMap: Map<string, string> = new Map();

  constructor(
    private readonly chatService: ChatService,
    private readonly prisma: PrismaService, 
  ) {
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() { senderId, contactId, content }: { senderId: string; contactId: number; content: string }, 
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // Fetch sender's internal ID using their Supabase UUID
      const sender = await this.prisma.user.findUnique({
        where: { supabaseId: senderId },
      });

      if (!sender) {
        console.error(`Sender with Supabase ID ${senderId} not found`);
        return;
      }

      // Fetch the contact relationship to get the correct receiver ID
      const contact = await this.prisma.contact.findUnique({
        where: { id: +contactId }, // Use the contactId to fetch the relationship
      });

      if (!contact) {
        console.error(`Contact with ID ${contactId} not found`);
        return;
      }

      // Determine the receiverId based on the relationship
      const receiverId = contact.userId === sender.id ? contact.receiverId : contact.userId;

      // Fetch receiver's Supabase ID from the User table
      const receiver = await this.prisma.user.findUnique({
        where: { id: receiverId },
      });

      if (!receiver) {
        console.error(`Receiver with internal ID ${receiverId} not found`);
        return;
      }

      const message = await this.chatService.createMessage(sender.id, receiverId, content);
    

     // Emit message to specific clients
     const senderSocketId = this.userSocketMap.get(senderId);
     const receiverSocketId = this.userSocketMap.get(receiver.supabaseId);

    //  if (senderSocketId) {
    //    this.server.to(senderSocketId).emit('message', message);
    //  }

    
     if (receiverSocketId) {
       this.server.to(receiverSocketId).emit('message', message);
     }

       // Emit back to sender for confirmation
  client.emit('messageSent', message);

    } catch (error) {
      client.emit('messageError', { error: 'Failed to send message' });
      console.error('Error sending message:', error);
    }
  }

  handleConnection(client: Socket) {
    console.log(`User connected: ${client.id}`);
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.userSocketMap.set(userId, client.id);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`User disconnected: ${client.id}`);
    const userId = Array.from(this.userSocketMap.entries()).find(([_, socketId]) => socketId === client.id)?.[0];
    if (userId) {
      this.userSocketMap.delete(userId);
    }
  }
}
