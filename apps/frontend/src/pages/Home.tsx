import React, { useState, useEffect } from "react";
import { IoSearch, IoEllipse } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { getUnreadContactsAndGroupsForUser } from "../services/chatService";
import { getUserProfile } from "../services/userService";
import { logout } from '../app/slices/authSlice';
import { supabase } from '../services/authService';
import Avatar from "boring-avatars";
import moment from "moment";
import Loader from "@/components/Loader";
import NavBar from "@/components/ui/NavBar";

interface Chat {
  id: string;
  userId?: number;
  name?: string;
  receiver: {
    image?: string;
    fullName?: string;
  };
  lastMessage?: {
    content?: string;
    createdAt?: string;
    isRead?: boolean;
    receiverId?: number;
  };
  isGroupChat?: boolean;
}

const Home: React.FC = () => {
  const [directChats, setDirectChats] = useState<Chat[]>([]);
  const [groupChats, setGroupChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSessionError = async () => {
    // Clear local storage
    localStorage.clear();
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Update Redux state
    dispatch(logout());
    
    // Navigate to login
    navigate('/login');
  };

  useEffect(() => {
    // Check session on component mount
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        handleSessionError();
        return false;
      }
      return true;
    };

    checkSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        handleSessionError();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const userData = await getUserProfile();
        localStorage.setItem("userProfile", JSON.stringify(userData));
      } catch (error: any) {
        console.error("Error fetching user profile:", error);
        // Check if error is related to session
        if (error.message?.includes('session') || error.message?.includes('authentication')) {
          handleSessionError();
        }
      }
    }

    fetchUserProfile();
  }, []);

  useEffect(() => {
    async function fetchUnreadChats() {
      try {
        const unreadData = await getUnreadContactsAndGroupsForUser();
        const directChats = unreadData.contacts;
        const groupChats = unreadData.groups;
        setDirectChats(directChats);
        setGroupChats(groupChats);
      } catch (error: any) {
        console.error("Failed to fetch unread chats:", error);
        // Check if error is related to session
        if (error.message?.includes('session') || error.message?.includes('authentication')) {
          handleSessionError();
        }
      } finally {
        setLoading(false);
      }
    }
    fetchUnreadChats();
  }, []);

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
          <h2 className="text-xl font-bold">Conversations</h2>
          <IoSearch size={24} />
        </div>
      </div>

      {/* Scrollable Chats Section */}
      <div className="flex-1 mt-28 overflow-y-auto p-3">
        {loading ? (
          <Loader />
        ) : (
          <>
            {/* Direct Chats Section */}
            {directChats.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Direct Chats</h3>
                {directChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`flex justify-between items-center mb-4 relative`}
                    onClick={() =>
                      navigate(`/chat/${chat.id}`, {
                        state: {
                          receiver: chat.receiver,
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
                          className={`text-sm truncate w-48 whitespace-nowrap ${
                            !chat.lastMessage?.isRead &&
                            chat.lastMessage?.receiverId === chat.userId
                              ? "font-extrabold text-black"
                              : "text-gray-500"
                          }`}
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
                ))}
              </div>
            )}

            {/* Group Chats Section */}
            {groupChats.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Group Chats</h3>
                {groupChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`flex justify-between items-center mb-4 relative`}
                    onClick={() =>
                      navigate(`/group/${chat.id}`, {
                        state: {
                          group: chat,
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
                          {chat.name || "Unknown Group"}
                        </h3>
                        <p
                          className={`text-sm truncate w-48 whitespace-nowrap ${
                            !chat.lastMessage?.isRead &&
                            chat.lastMessage?.receiverId === chat.userId
                              ? "font-extrabold text-black"
                              : "text-gray-500"
                          }`}
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
                ))}
              </div>
            )}

            {/* No chats available message */}
            {directChats.length === 0 && groupChats.length === 0 && (
              <p>No chats available.</p>
            )}
          </>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <NavBar />
    </div>
  );
};

export default Home;