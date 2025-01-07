import React, { useState, useEffect } from "react";
import { IoSearch, IoEllipse } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { getContactsForUser } from "../services/chatService";
import { socketService } from "../services/socketService";
import Avatar from "boring-avatars";
import moment from "moment";
import Loader from "@/components/Loader";
import NavBar from "@/components/ui/NavBar";

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

const DirectsPage: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchContacts() {
      try {
        const contacts = await getContactsForUser();
        setChats(contacts);
      } catch (error) {
        console.error("Failed to fetch contacts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchContacts();



    // Add socket message listener
    socketService.onMessage(handleNewMessage);

    // Cleanup listener on component unmount
    return () => {
      socketService.offMessage(handleNewMessage);
    };
  }, []);

  // Listen for new messages
  const handleNewMessage = (message: Message) => {
    setChats(prevChats => {
      // Find the index of the chat corresponding to the sender
      const chatIndex = prevChats.findIndex(chat =>
        chat.receiver.id === message.contact?.id
      );

      // If chat found
      if (chatIndex !== -1) {
        // Remove the chat from its current position
        const updatedChat = { ...prevChats[chatIndex] };

        // Update the last message
        updatedChat.lastMessage = {
          content: message.content,
          createdAt: message.createdAt,
          isRead: false,
          receiverId: message.receiverId
        };

        // Create a new array without the original chat
        const filteredChats = prevChats.filter((_, index) => index !== chatIndex);

        // Add the updated chat to the beginning of the array
        return [updatedChat, ...filteredChats];
      }

      // If no matching chat found, return original chats
      return prevChats;
    });
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "";
    const date = moment(dateString);
    if (date.isSame(moment(), "day")) {
      return "Today";
    }
    return date.format("MM/DD/YYYY");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Top bar */}
      <div className="fixed top-0 w-full bg-white shadow-md z-10">
        <div className="p-3 flex justify-between items-center">
          <h1 className="font-poppins italic text-4xl font-bold">LaSo</h1>
        </div>
        <div className="px-3 pb-2 flex justify-between items-center">
          <h2 className="text-xl font-bold">Direct Messages</h2>
          <IoSearch size={24} />
        </div>
      </div>
      {/* Scrollable Chats Section */}
      <div className="flex-1 mt-28 overflow-y-auto p-3">
        {loading ? (
          <Loader />
        ) : chats.length === 0 ? (
          <p>No chats available.</p>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              className={`flex justify-between items-center mb-4 relative`}
              onClick={() =>
                navigate(`/chat/${chat.id}`, {
                  state: {
                    receiver: chat.receiver,
                    chat: chat,
                  },
                })
              }
            >
              {!chat.lastMessage?.isRead &&
                chat.lastMessage?.receiverId === chat.userId && (
                  <IoEllipse
                    size={15}
                    className="absolute top-0 left-0 text-sky-600 bg-white rounded-full"
                  />
                )}
              <div className="flex items-center space-x-4">
                {chat.receiver?.image ? (
                  <img
                    src={chat.receiver.image}
                    alt={chat.receiver.fullName}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <Avatar
                    size={48}
                    name={chat.receiver?.fullName || "Unknown"}
                    colors={[
                      "#e81e4a",
                      "#0b1d21",
                      "#078a85",
                      "#68baab",
                      "#edd5c5",
                    ]}
                    variant="beam"
                  />
                )}
                <div>
                  <h3 className="font-semibold">
                    {chat.receiver?.fullName || "Unknown User"}
                  </h3>
                  <p
                    className={`text-sm truncate w-48 whitespace-nowrap ${!chat.lastMessage?.isRead && chat.lastMessage?.receiverId === chat.userId ? "font-extrabold text-black" : "text-gray-500"}`}
                  >
                    {chat?.lastMessage?.content || "No messages yet"}
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-end items-end">
                <p className="text-sm text-gray-400">
                  {formatDate(chat.lastMessage?.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      <NavBar />
    </div>
  );
};

export default DirectsPage;