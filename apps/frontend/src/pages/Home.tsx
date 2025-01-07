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
import { Card } from "@/components/ui/card";
import { MessageSquareText, QrCode, Users2 } from 'lucide-react';

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
    localStorage.clear();
    await supabase.auth.signOut();
    dispatch(logout());
    navigate('/login');
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        handleSessionError();
        return false;
      }
      return true;
    };

    checkSession();

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
        localStorage.setItem("userId", JSON.stringify(userData.id));
        localStorage.setItem("userSupabaseId", JSON.stringify(userData.id));
      } catch (error: any) {
        console.error("Error fetching user profile:", error);
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
        setDirectChats(unreadData.contacts);
        setGroupChats(unreadData.groups);
      } catch (error: any) {
        console.error("Failed to fetch unread chats:", error);
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
      <div className="fixed top-0 w-full bg-white shadow-md z-10">
        <div className="p-3 flex justify-between items-center">
          <h1 className="font-poppins italic text-4xl font-bold">LaSo</h1>
        </div>
        <div className="px-3 pb-2 flex justify-between items-center">
          <h2 className="text-xl font-bold">Home</h2>
          <IoSearch size={24} />
        </div>
      </div>

      <div className="px-3 mt-28 pb-4">
          <div className="grid gap-3">
            <Card className="relative overflow-hidden bg-sky-100 border-none">
              <div className="p-4 flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-800">
                    Break Language Barriers
                  </h3>
                  <p className="text-sm text-gray-600 max-w-[160px]">
                    Chat in your language, they read in theirs
                  </p>
                </div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-90">
                  <MessageSquareText size={80} className="text-sky-200" />
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-rose-100 border-none">
                <div className="p-4 relative overflow-hidden">
                  <h3 className="font-semibold mb-1">Group Chats</h3>
                  <p className="text-xs text-gray-600">Multi-language groups</p>
                  <Users2 className="absolute right-2 bottom-2 text-rose-200" size={32} />
                </div>
              </Card>

              <Card className="bg-emerald-100 border-none">
                <div className="p-4 relative overflow-hidden">
                  <h3 className="font-semibold mb-1">Quick Connect</h3>
                  <p className="text-xs text-gray-600">Scan QR to chat</p>
                  <QrCode className="absolute right-2 bottom-2 text-emerald-200" size={32} />
                </div>
              </Card>
            </div>
          </div>
        </div>

      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <Loader />
        ) : (
          <>
            {directChats.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Unread Direct Chats</h3>
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

            {groupChats.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Unread Group Chats</h3>
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

            {directChats.length === 0 && groupChats.length === 0 && (
              <p>No chats available.</p>
            )}
          </>
        )}
      </div>

      <NavBar />
    </div>
  );
};

export default Home;

