import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class SocketService {
  private readonly logger = new Logger(SocketService.name);
  private userSocketMap: Map<string, string> = new Map(); // Maps userId -> socketId
  private server: Server;

  // Set the WebSocket server instance
  setServer(server: Server) {
    this.server = server;
    this.logger.log('Socket server initialized');
  }

  // Add a user with their socketId
  addUser(userId: string, socketId: string) {
    this.userSocketMap.set(userId, socketId);
    this.logger.log(`User ${userId} connected with socket ${socketId}`);
  }

  // Remove a user by socketId
  removeUser(socketId: string) {
    const userId = Array.from(this.userSocketMap.entries()).find(
      ([_, id]) => id === socketId,
    )?.[0];
    if (userId) {
      this.userSocketMap.delete(userId);
      this.logger.log(`User ${userId} disconnected`);
    }
  }

  // Get socketId for a specific userId
  getSocketId(userId: string): string | undefined {
    return this.userSocketMap.get(userId);
  }

  // Emit a message to a specific user
  emitToUser(userId: string, event: string, data: any) {
    const socketId = this.getSocketId(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
      this.logger.log(`Event "${event}" sent to user ${userId}`);
    } else {
      this.logger.warn(`Cannot send event "${event}" - User ${userId} is offline`);
    }
  }

  // Emit a message to a specific socket
  emitToSocket(socketId: string, event: string, data: any) {
    this.server.to(socketId).emit(event, data);
    this.logger.log(`Event "${event}" sent to socket ${socketId}`);
  }

  // Broadcast a message to all connected users
  broadcast(event: string, data: any) {
    this.server.emit(event, data);
    this.logger.log(`Broadcasted event "${event}" to all connected users`);
  }

  // Check if a user is online
  isUserOnline(userId: string): boolean {
    console.log(this.userSocketMap,'-------------------------------------------------------------------');
    
    return this.userSocketMap.has(userId);
  }

  // Send in-app notification to a user
  sendInAppNotification(userId: string, event: string, data: any) {

    console.log(userId,'++++++++++++++++++++++userId');
    
    const socketId = this.getSocketId(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
      this.logger.log(`In-app notification "${event}" sent to user ${userId}`);
      console.log(`In-app notification "${event}" sent to user ${userId}`);
      
    } else {
      this.logger.warn(`User ${userId} is offline - In-app notification not delivered`);
    }
  }

  // Emit to all users except a specific user
  emitToAllExcept(userId: string, event: string, data: any) {
    const excludedSocketId = this.getSocketId(userId);
    Array.from(this.userSocketMap.entries()).forEach(([key, socketId]) => {
      if (socketId !== excludedSocketId) {
        this.server.to(socketId).emit(event, data);
      }
    });
    this.logger.log(`Event "${event}" sent to all users except ${userId}`);
  }

  // Get a list of all online users
  getOnlineUsers(): string[] {
    return Array.from(this.userSocketMap.keys());
  }

  // Emit to multiple users
  emitToUsers(userIds: string[], event: string, data: any) {
    userIds.forEach((userId) => {
      const socketId = this.getSocketId(userId);
      if (socketId) {
        this.server.to(socketId).emit(event, data);
      } else {
        this.logger.warn(`User ${userId} is offline - Cannot emit event "${event}"`);
      }
    });
    this.logger.log(`Event "${event}" sent to multiple users: ${userIds.join(', ')}`);
  }
}
