import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { PrismaService } from '../prisma/prisma.service';
import { SocketService } from '@/shared/services/socket/socket.service';

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

  constructor(
    private readonly chatService: ChatService,
    private readonly prisma: PrismaService,
    private readonly socketService: SocketService,
  ) {}

  afterInit(server: Server) {
    this.socketService.setServer(server);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() { senderId, contactId, content }: { senderId: string; contactId: number; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const sender = await this.prisma.user.findUnique({ where: { supabaseId: senderId } });
      if (!sender) {
        console.error(`Sender with Supabase ID ${senderId} not found`);
        return;
      }

      const contact = await this.prisma.contact.findUnique({ where: { id: contactId } });
      if (!contact) {
        console.error(`Contact with ID ${contactId} not found`);
        return;
      }

      const receiverId = contact.userId === sender.id ? contact.receiverId : contact.userId;
      const receiver = await this.prisma.user.findUnique({ where: { id: receiverId } });
      if (!receiver) {
        console.error(`Receiver with ID ${receiverId} not found`);
        return;
      }

      const message = await this.chatService.createMessage(sender.id, receiverId, content);

      this.socketService.emitToUser(senderId, 'messageSent', message);
      this.socketService.emitToUser(receiver.supabaseId, 'message', message);
    } catch (error) {
      client.emit('messageError', { error: 'Failed to send message' });
      console.error('Error sending message:', error);
    }
  }

  handleConnection(client: Socket) {
    console.log(`User connected: ${client.id}`);
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.socketService.addUser(userId, client.id);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`User disconnected: ${client.id}`);
    this.socketService.removeUser(client.id);
  }
}
