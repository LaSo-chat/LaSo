import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { GroupChatService } from './group-chat.service';
import { SocketService } from '@/shared/services/socket/socket.service';

@WebSocketGateway({
  cors: {
    origin: ['https://laso-frontend.vercel.app', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket'],
})
export class GroupChatGateway {
  @WebSocketServer() server: Server;

  constructor(
    private readonly prisma: PrismaService,
    private readonly groupChatService: GroupChatService,
    private readonly socketService: SocketService,
  ) {}

  afterInit(server: Server) {
    this.socketService.setServer(server);
  }

  @SubscribeMessage('sendGroupMessage')
  async handleGroupMessage(
    @MessageBody() { senderId, groupId, content }: { senderId: string; groupId: number; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const sender = await this.prisma.user.findUnique({ where: { supabaseId: senderId } });
      if (!sender) {
        console.error(`Sender with Supabase ID ${senderId} not found`);
        return;
      }

      const group = await this.prisma.group.findUnique({ where: { id: groupId } });
      if (!group) {
        console.error(`Group with ID ${groupId} not found`);
        return;
      }

      const message = await this.groupChatService.createGroupMessage(senderId, groupId, content);

      const groupMembers = await this.prisma.groupMember.findMany({
        where: { groupId },
        include: { user: true },
      });

      groupMembers.forEach((member) => {
        this.socketService.emitToUser(member.user.supabaseId, 'groupMessage', message);
      });

      client.emit('groupMessageSent', message);
    } catch (error) {
      client.emit('groupMessageError', { error: 'Failed to send group message' });
      console.error('Error sending group message:', error);
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
