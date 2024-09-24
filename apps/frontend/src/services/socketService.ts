import { io, Socket } from 'socket.io-client';
import { supabase } from './authService';

const SOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || 'https://laso.onrender.com';

interface Message {
  id: number;
  content: string;
  senderId: number;
  receiverId: number;
  createdAt: string;
}

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private messageListeners: Set<(message: Message) => void> = new Set();

  public async connect(): Promise<Socket | null> {
    if (!this.socket) {
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
  // withCredentials: true,
  // autoConnect: false,
  // secure: true,
          query: { userId: this.userId }
        });

        this.socket.on('connect', () => {
          console.log('Socket connected:', this.socket?.id);
        });

        this.socket.on('disconnect', () => {
          console.log('Socket disconnected');
        });

        this.socket.on('connect_error', (error) => {
          console.error('Connection error:', error);
        });

        // Set up a single listener for all messages
        this.socket.on('message', (data: Message) => {
          console.log('Message received:', data);
          this.messageListeners.forEach(listener => listener(data));
        });

      } catch (error) {
        console.error('Error connecting to socket:', error);
        return null;
      }
    }

    return this.socket;
  }

  public sendMessage(message: string, contactId: number) {
    if (this.userId && this.socket) {
      this.socket.emit('sendMessage', {
        content: message,
        senderId: this.userId, 
        contactId, 
      });
    } else {
      console.error('Cannot send message. User not authenticated or socket not connected.');
    }
  } 

  public onMessage(callback: (message: Message) => void) {
    this.messageListeners.add(callback);
  }

  public offMessage(callback: (message: Message) => void) {
    this.messageListeners.delete(callback);
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
      this.messageListeners.clear();
    }
  }
}

export const socketService = new SocketService();