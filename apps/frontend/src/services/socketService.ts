import { io, Socket } from 'socket.io-client';
import { supabase } from './authService';

const SOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || 'https://laso.onrender.com';

interface Translation {
  userId: number;
  translatedContent: string;
}
interface User {
  id: number;
  supabaseId: string;
  email: string;
  fullName: string;
  profilePicture?: string;
  preferredLang: string;
}

interface Message {
  id: number;
  content: string;
  senderId: number;
  receiverId: number;
  createdAt: string;
  isRead: boolean;
  contact?: {
    id: number;
    userId: number;
    receiverId: number;
  };
}

interface GroupMessage {
  id: number;
  content: string;
  translatedContent?: string;  // Added translated content
  groupId: number;
  senderId: number;
  createdAt: string;
  isRead: boolean;
  sender: User;
  translations: Translation[];
}

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private userId: string | null = null;
  private messageListeners: Set<(message: Message) => void> = new Set();
  private groupMessageListeners: Set<(message: GroupMessage) => void> = new Set(); // Added for group messages
  private connectionPromise: Promise<Socket | null> | null = null;
  private isConnecting: boolean = false;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public async connect(): Promise<Socket | null> {
    if (this.socket?.connected) {
      return this.socket;
    }

    if (this.isConnecting && this.connectionPromise) {
      return this.connectionPromise;
    }

    this.isConnecting = true;
    this.connectionPromise = this.initializeConnection();
    
    try {
      const socket = await this.connectionPromise;
      this.isConnecting = false;
      return socket;
    } catch (error) {
      this.isConnecting = false;
      throw error;
    }
  }

  private async initializeConnection(): Promise<Socket | null> {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData?.session) {
        console.error('User is not authenticated');
        return null;
      }

      this.userId = sessionData.session.user?.id;

      if (!this.userId) {
        console.error('User ID not found in session');
        return null;
      }

      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        query: { userId: this.userId },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      this.setupSocketListeners();
      
      return new Promise((resolve, reject) => {
        this.socket!.on('connect', () => {
          console.log('Socket connected:', this.socket?.id);
          resolve(this.socket);
        });

        this.socket!.on('connect_error', (error) => {
          console.error('Connection error:', error);
          reject(error);
        });
      });

    } catch (error) {
      console.error('Error connecting to socket:', error);
      return null;
    }
  }

  private setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('message', (data: Message) => {
      console.log('Message received:', data);
      this.messageListeners.forEach(listener => listener(data));
    });

    this.socket.on('groupMessage', (data: GroupMessage) => { // Added listener for group messages
      console.log('Group message received:', data);
      this.groupMessageListeners.forEach(listener => listener(data));
    });
  }

  // Method to send direct messages
  public sendMessage(message: string, contactId: number) {
    if (this.userId && this.socket?.connected) {
      this.socket.emit('sendMessage', {
        content: message,
        senderId: this.userId,
        contactId,
      });
    } else {
      console.error('Cannot send message. Socket not connected or user not authenticated.');
    }
  }

  // Method to send group messages
  public sendGroupMessage(message: string, groupId: number) {
    if (this.userId && this.socket?.connected) {
      this.socket.emit('sendGroupMessage', {
        content: message,
        senderId: this.userId,
        groupId,
      });
    } else {
      console.error('Cannot send group message. Socket not connected or user not authenticated.');
    }
  }

  // Listen for regular messages
  public onMessage(callback: (message: Message) => void) {
    this.messageListeners.add(callback);
  }

  // Remove listener for regular messages
  public offMessage(callback: (message: Message) => void) {
    this.messageListeners.delete(callback);
  }

  // Listen for group messages
  public onGroupMessage(callback: (message: GroupMessage) => void) {
    this.groupMessageListeners.add(callback);
  }

  // Remove listener for group messages
  public offGroupMessage(callback: (message: GroupMessage) => void) {
    this.groupMessageListeners.delete(callback);
  }

  // Disconnect the socket connection
  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
      this.messageListeners.clear();
      this.groupMessageListeners.clear(); // Clear group message listeners as well
      this.connectionPromise = null;
      this.isConnecting = false;
    }
  }

  // Check if the socket is connected
  public isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = SocketService.getInstance();
