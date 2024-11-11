import React, { useState, useEffect, useCallback, useRef } from 'react';
import { IoArrowBackOutline, IoSendOutline, IoArrowForward, IoEllipsisHorizontalOutline } from 'react-icons/io5';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getUserFromSession } from '../services/authService';
import Loader from '@/components/Loader';
import Avatar from 'boring-avatars';
import { Drawer, DrawerContent } from "@/components/ui/drawer";

interface User {
  id: number;
  supabaseId: string;
  email: string;
  fullName: string;
  profilePicture?: string;
  preferredLang: string;
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
}

interface GroupMember {
  id: number;
  groupId: number;
  userId: number;
  role: string;
  joinedAt: string;
  user: User;
}

interface Group {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  creatorId: number;
  members: GroupMember[];
  messages: GroupMessage[];
}

interface LocationState {
  group: Group;
}

const GroupChatPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [senderId, setSenderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isGroupInfoDrawerOpen, setIsGroupInfoDrawerOpen] = useState(false);
  // const [groupInfo, setGroupInfo] = useState<Group | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { group } = location.state as LocationState;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleNewMessage = useCallback((newMessage: GroupMessage) => {
    console.log('New group message received:', newMessage);
    setMessages(prevMessages => [...prevMessages, newMessage]);
  }, []);

  useEffect(() => {
    async function setupGroupChatAndSocket() {
      try {
        setIsLoading(true);
        const userId = await getUserFromSession();
        setSenderId(userId);

        const backendUrl = import.meta.env.VITE_API_URL || 'https://laso.onrender.com';
        const response = await fetch(
          `${backendUrl}/api/groups/${group.id}/messages?userId=${userId}&offset=${offset}&limit=50`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch group messages');
        }

        const data: GroupMessage[] = await response.json();
        if (data.length === 0) {
          setHasMoreMessages(false);
        } else {
          setMessages(prevMessages => [...data, ...prevMessages]);
        }

      } catch (error) {
        console.error('Error setting up group chat:', error);
        setError('Failed to load group chat. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    setupGroupChatAndSocket();

    return () => {
    };
  }, [id, offset, handleNewMessage]);

  const handleSendMessage = async () => {
    if (message.trim() && senderId && id) {
      try {
        const userId = await getUserFromSession();
        const backendUrl = import.meta.env.VITE_API_URL || 'https://laso.onrender.com';
        const response = await fetch(`${backendUrl}/api/groups/${id}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            userId: userId,
            content: message,
            groupId: parseInt(id),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        const newMessage: GroupMessage = await response.json();
        setMessages(prevMessages => [...prevMessages, newMessage]);
        setMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  useEffect(() => {
    if (!isLoading) {
      const timeoutId = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [messages, isLoading, scrollToBottom]);

  const loadMoreMessages = () => {
    setOffset(prevOffset => prevOffset + 50);
  };

  const toggleGroupInfoDrawer = () => {
    setIsGroupInfoDrawerOpen(!isGroupInfoDrawerOpen);
  };

  if (error) return <div>{error}</div>;

  return (
    <div className="flex flex-col h-screen">
      {/* Top Bar */}
      <div className="bg-white shadow-md z-10 flex justify-between items-center p-4 sticky top-0">
        <div className="flex items-center space-x-3">
          <IoArrowBackOutline
            size={24}
            onClick={() => navigate(-1)}
            className="cursor-pointer"
          />
          <Avatar
            size={32}
            name={group.name}
            variant="beam"
            colors={["#e81e4a", "#0b1d21", "#078a85", "#68baab", "#edd5c5"]}
          />
          <div>
            <h3 className="font-bold">{group.name}</h3>
            <p className="text-sm text-gray-500">{group.members.length} members</p>
          </div>
        </div>
        <IoEllipsisHorizontalOutline
          size={24}
          className="cursor-pointer"
          onClick={toggleGroupInfoDrawer}
        />
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <Loader />
        ) : (
          <div ref={scrollContainerRef} className="px-4 py-2 pb-16">
            {hasMoreMessages && (
              <button 
                onClick={loadMoreMessages} 
                className="flex items-center justify-center bg-sky-500 text-white font-semibold rounded-md px-4 py-2 mt-4 w-full transition-transform duration-200 hover:scale-105 active:scale-95"
              >
                <IoArrowForward className="mr-2" />
                Load More
              </button>
            )}
            {messages.map((msg, index) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender.supabaseId === senderId
                    ? 'justify-end'
                    : 'justify-start'
                } mb-2`}
                ref={index === messages.length - 1 ? lastMessageRef : null}
              >
                <div className="flex flex-col">
                  {msg.sender.supabaseId !== senderId && (
                    <span className="text-xs text-gray-500 ml-2 mb-1">
                      {msg.sender.fullName}
                    </span>
                  )}
                  <div
                    className={`max-w-xs p-3 rounded-lg ${
                      msg.sender.supabaseId === senderId
                        ? 'bg-sky-400 text-white'
                        : 'bg-gray-200 text-black'
                    }`}
                  >
                    <p>{msg.content}</p>
                    {msg.translatedContent && msg.sender.supabaseId !== senderId && (
                      <>
                        <hr className="border-t border-gray-300 my-2" />
                        <p className="text-sm text-gray-500 mt-1">
                          {msg.translatedContent}
                        </p>
                      </>
                    )}
                  </div>
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
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          autoFocus
        />
        <button
          onClick={handleSendMessage}
          className="bg-sky-400 text-white rounded-full p-3"
        >
          <IoSendOutline size={24} />
        </button>
      </div>

      {/* Group Info Drawer */}
      <Drawer open={isGroupInfoDrawerOpen} onClose={() => setIsGroupInfoDrawerOpen(false)}>
        <DrawerContent>
          <div className="p-4">
            <div className="flex items-center space-x-3 mb-4">
              <Avatar
                size={48}
                name={group.name}
                variant="beam"
                colors={["#e81e4a", "#0b1d21", "#078a85", "#68baab", "#edd5c5"]}
              />
              <div>
                <h2 className="text-xl font-bold">{group.name}</h2>
                <p className="text-gray-500">{group.description}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Members ({group.members.length})</h3>
              <div className="space-y-3">
                {group.members.map((member) => (
                  <div key={member.id} className="flex items-center space-x-3">
                    <Avatar
                      size={32}
                      name={member.user.fullName}
                      variant="beam"
                      colors={["#e81e4a", "#0b1d21", "#078a85", "#68baab", "#edd5c5"]}
                    />
                    <div>
                      <p className="font-medium">{member.user.fullName}</p>
                      <p className="text-sm text-gray-500">{member.user.email}</p>
                      <p className="text-xs text-gray-400 capitalize">{member.role.toLowerCase()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default GroupChatPage;