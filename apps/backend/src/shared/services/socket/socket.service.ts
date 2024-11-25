import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@Injectable()
export class SocketService {
  private userSocketMap: Map<string, string> = new Map();
  private server: Server;

  setServer(server: Server) {
    this.server = server;
  }

  addUser(userId: string, socketId: string) {
    this.userSocketMap.set(userId, socketId);
  }

  removeUser(socketId: string) {
    const userId = Array.from(this.userSocketMap.entries()).find(
      ([_, id]) => id === socketId,
    )?.[0];
    if (userId) {
      this.userSocketMap.delete(userId);
    }
  }

  getSocketId(userId: string): string | undefined {
    return this.userSocketMap.get(userId);
  }

  emitToUser(userId: string, event: string, data: any) {
    const socketId = this.getSocketId(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }

  emitToSocket(socketId: string, event: string, data: any) {
    this.server.to(socketId).emit(event, data);
  }

  broadcast(event: string, data: any) {
    this.server.emit(event, data);
  }
}
