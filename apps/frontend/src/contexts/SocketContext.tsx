// src/contexts/SocketContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { socketService } from "../services/socketService";

// Define the shape of the context data
interface SocketContextProps {
  isConnected: boolean;
}

// Create the context with an initial value of undefined
const SocketContext = createContext<SocketContextProps | undefined>(undefined);

// SocketProvider component that manages the socket connection state
export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);

  // Effect to handle socket connection
  useEffect(() => {
    const connectSocket = async () => {
      try {
        const socket = await socketService.connect(); // Connect using the socket service
        setIsConnected(socket?.connected || false); // Update connection status

        // Listen for socket connection events
        if (socket) {
          socket.on('connect', () => {
            setIsConnected(true); // Set connected to true when the socket connects
          });

          socket.on('disconnect', () => {
            setIsConnected(false); // Set connected to false when the socket disconnects
          });
        }
      } catch (error) {
        console.error("Failed to connect to socket:", error); // Handle connection error
      }
    };

    connectSocket();

    // Cleanup function to disconnect the socket when the component is unmounted
    return () => {
      socketService.disconnect();
    };
  }, []);

  return (
    // Provide the connection status to children components
    <SocketContext.Provider value={{ isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use the Socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context; // Return the context value
};
