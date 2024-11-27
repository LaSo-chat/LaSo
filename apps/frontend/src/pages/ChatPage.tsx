import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  IoArrowBackOutline,
  IoSendOutline,
  IoArrowForward,
  IoPersonOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getUserFromSession } from "../services/authService";
import { socketService } from "../services/socketService";
import Loader from "@/components/Loader";
import { deleteContact, markMessagesAsRead } from "@/services/chatService";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useSocket } from '../contexts/SocketContext';

interface Message {
  id: number;
  content: string;
  sender?: { supabaseId: string };
  receiverId: number;
  createdAt: string;
  isRead?: boolean;
  translatedContent?: string;
}

interface Chat {
  id: number;
  userId?: number;
  receiver: {
    id?: number;
    image?: string;
    fullName?: string;
  };
  lastMessage?: {
    content?: string;
    createdAt?: string;
    isRead?: boolean;
    receiverId?: number;
  };
}

interface LocationState {
  receiver: { fullName: string };
  chat: Chat
}

// Function to format date and time
const formatMessageTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // Format time
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };
  const formattedTime = date.toLocaleTimeString(undefined, timeOptions);

  // Determine date display
  if (date.toDateString() === today.toDateString()) {
    return `Today, ${formattedTime}`;
  } else if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${formattedTime}`;
  } else {
    const dateOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    };
    return `${date.toLocaleDateString(undefined, dateOptions)}, ${formattedTime}`;
  }
};

const ChatPage: React.FC = () => {
  const { isConnected } = useSocket(); // Get the socket connection status from the SocketContext
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { id } = useParams<{ id: string }>();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [senderId, setSenderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0); // Pagination offset
  const [hasMoreMessages, setHasMoreMessages] = useState(true); // Track if there are more messages to load
  const navigate = useNavigate();
  const location = useLocation();
  const { receiver, chat } = location.state as LocationState;
  // const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const handleNewMessage = useCallback((newMessage: Message) => {
    console.log("New message received:", newMessage);
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  }, []);

  useEffect(() => {
    async function fetchMessages() {
      try {
        setIsLoading(true);
        const userId = await getUserFromSession();
        setSenderId(userId);

        const backendUrl =
          import.meta.env.VITE_API_URL || "https://laso.onrender.com";
        const response = await fetch(
          `${backendUrl}/api/chat/messages/${id}?userId=${userId}&offset=${offset}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }

        const data: Message[] = await response.json();

        
        if (data.length === 0) {
          setHasMoreMessages(false); // No more messages to load
        } else {
          setMessages((prevMessages) => [...data, ...prevMessages]); // Prepend new messages
        }

        await updateMessagesAsRead(); // Mark messages as read
      } catch (error) {
        console.error("Error fetching messages:", error);
        setError("Failed to load chat. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchMessages();

    // Subscribe to new messages only if the socket is connected
      socketService.onMessage(handleNewMessage);

    return () => {
      socketService.offMessage(handleNewMessage);
    };
  }, [id, offset, handleNewMessage, isConnected]);

  const handleSendMessage = () => {
    if (message.trim() && senderId && id) {
      const newMessage: Message = {
        id: Date.now(),
        content: message,
        sender: { supabaseId: senderId },
        receiverId: parseInt(id, 10),
        createdAt: new Date().toISOString(),
      };

      console.log("Sending new message:", newMessage);

      setMessages((prevMessages) => [...prevMessages, newMessage]);
      socketService.sendMessage(message, parseInt(id, 10));
      setMessage("");
    }
  };

  const handleDeleteContact = async (contactId: number) => {
    try {
      // Show confirmation box
      const confirmDelete = window.confirm('Are you sure you want to delete this contact?');
  
      if (confirmDelete) {
        // Proceed with deletion if user confirms
        await deleteContact(contactId);
        navigate('/directs'); // Navigate after successful deletion
      } else {
        // User canceled the action
        console.log('Delete action canceled by the user.');
      }
    } catch (error) {
      // Handle error (show toast, alert, etc.)
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };

  const updateMessagesAsRead = useCallback(async () => {
    const chatId = Number(id);
    if (isNaN(chatId)) {
      console.error("Invalid chat ID:", id);
      return;
    }

    try {
      await markMessagesAsRead(chatId);
      setMessages((prevMessages) =>
        prevMessages.map((msg) => ({ ...msg, isRead: true }))
      );
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  }, [id]);

  useEffect(() => {
    if (!isLoading) {
      const timeoutId = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [messages, isLoading, scrollToBottom]);

  const loadMoreMessages = () => {
    setOffset((prevOffset) => prevOffset + 50); // Load next messages
  };

  if (error) return <div>{error}</div>;

  return (
    <div className="flex flex-col h-screen">
      {/* Top Bar */}
      <div className="bg-white shadow-md z-10 flex justify-between items-center p-4 sticky top-0">
        <div className="flex items-center space-x-2">
          <IoArrowBackOutline
            size={24}
            onClick={() => navigate(-1)}
            className="cursor-pointer"
          />
          <h3 className="font-bold">Chat with {receiver.fullName}</h3>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <IoPersonOutline size={24} className="text-gray-600" />
        </button>
      </div>

      {/* Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h4 className="text-lg font-semibold">Contact Details</h4>
                <p className="text-gray-600">{receiver.fullName}</p>
              </div>
              <button
                onClick={() => handleDeleteContact(chat.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <IoTrashOutline size={24} />
              </button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <Loader />
        ) : (
          <div ref={scrollContainerRef} className="px-4 py-2 pb-16">
            {/* Only show "Load More" if there are more messages */}
            {hasMoreMessages && (
              <button
                onClick={loadMoreMessages}
                className="flex items-center justify-center bg-blue-500 text-white font-semibold rounded-md px-4 py-2 mt-4 transition-transform duration-200 hover:scale-105 active:scale-95"
              >
                <IoArrowForward className="mr-2" /> {/* Import the icon */}
                Load More
              </button>
            )}
            {messages.map((msg, index) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender?.supabaseId === senderId
                    ? "justify-end"
                    : "justify-start"
                } mb-2`}
                ref={index === messages.length - 1 ? lastMessageRef : null}
              >
                <div
                  className={`max-w-xs p-3 rounded-lg ${
                    msg.sender?.supabaseId === senderId
                      ? "bg-sky-400 text-white"
                      : "bg-gray-200 text-black"
                  }`}
                >
                  <p>{msg.content}</p>
                  {msg.translatedContent &&
                    msg.sender?.supabaseId !== senderId && (
                      <>
                        <hr className="border-t border-gray-300 my-2" />
                        <p className="text-sm text-gray-500 mt-1">
                          {msg.translatedContent}
                        </p>
                      </>
                    )}
                    <p className={`text-xs mt-1 ${
                    msg.sender?.supabaseId === senderId
                      ? "text-sky-100"
                      : "text-gray-500"
                  }`}>
                    {formatMessageTimestamp(msg.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Input Area */}
      <div className="bg-white p-4 shadow-lg flex items-center space-x-2 sticky bottom-0">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none"
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <button
          onClick={handleSendMessage}
          className="bg-sky-400 text-white rounded-full p-3"
        >
          <IoSendOutline size={24} />
        </button>
      </div>
    </div>
  );
};

export default ChatPage;