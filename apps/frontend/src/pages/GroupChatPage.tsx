import React, { useState, useEffect, useCallback, useRef } from 'react';
import { IoArrowBackOutline, IoSendOutline, IoArrowForward, IoEllipsisHorizontalOutline } from 'react-icons/io5';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getUserFromSession } from '../services/authService';
import { socketService } from '../services/socketService';
import Loader from '@/components/Loader';
import Avatar from 'boring-avatars';
import { Drawer, DrawerContent } from "@/components/ui/drawer";

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

interface GroupMessage {
  id: number;
  content: string;
  translatedContent?: string;
  groupId: number;
  senderId: number;
  createdAt: string;
  isRead: boolean;
  sender: User;
  translations: Translation[];
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
  const pendingMessageRef = useRef<string | null>(null);
  const isInitialLoadRef = useRef(true);
  
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
    if (newMessage.sender.supabaseId !== senderId || 
        (pendingMessageRef.current && newMessage.content === pendingMessageRef.current)) {
      setMessages(prevMessages => {
        const isDuplicate = prevMessages.some(msg => (
          msg.id === newMessage.id ||
          (msg.content === newMessage.content &&
           msg.sender.supabaseId === newMessage.sender.supabaseId &&
           Math.abs(new Date(msg.createdAt).getTime() - new Date(newMessage.createdAt).getTime()) < 1000)
        ));
        if (isDuplicate) {
          return prevMessages;
        }
        return [...prevMessages, newMessage];
      });
      if (pendingMessageRef.current && newMessage.content === pendingMessageRef.current) {
        pendingMessageRef.current = null;
      }
    }
  }, [senderId]);

  const getTranslatedContent = (message: GroupMessage): string | undefined => {
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId || message.sender.supabaseId === senderId) return undefined;
    const userIdNumber = parseInt(storedUserId, 10);
    const translation = message.translations?.find(t => t.userId === userIdNumber);
    return translation?.translatedContent;
  };

  // Separate effect for initial setup
  useEffect(() => {
    let isMounted = true;

    async function initializeChat() {
      if (!isMounted) return;

      try {
        const userId = await getUserFromSession(navigate);
        setSenderId(userId);

        const socket = await socketService.connect();
        if (socket) {
          socketService.onGroupMessage(handleNewMessage);
        }
      } catch (error) {
        setError('Failed to initialize chat. Please try again.');
      }
    }

    initializeChat();

    return () => {
      isMounted = false;
      socketService.offGroupMessage(handleNewMessage);
    };
  }, [handleNewMessage]);

  // Separate effect for fetching messages
  useEffect(() => {
    let isMounted = true;

    async function fetchMessages() {
      if (!isInitialLoadRef.current && offset === 0) return;

      try {
        setIsLoading(true);
        const backendUrl = import.meta.env.VITE_API_URL || 'https://laso.onrender.com';
        const response = await fetch(
          `${backendUrl}/api/groups/${group.id}/messages?userId=${senderId}&offset=${offset}&limit=50`,
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
        if (isMounted) {
          if (data.length === 0) {
            setHasMoreMessages(false);
          } else {
            setMessages(prevMessages => [...data, ...prevMessages]);
          }
        }
      } catch (error) {
        if (isMounted) {
          setError('Failed to load group messages. Please try again.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          isInitialLoadRef.current = false;
        }
      }
    }

    if (senderId) {
      fetchMessages();
    }

    return () => {
      isMounted = false;
    };
  }, [group.id, senderId, offset]);

  const handleSendMessage = async () => {
    if (message.trim()) {
      try {
        const socket = await socketService.connect();
        if (socket && senderId) {
          pendingMessageRef.current = message;
          socketService.sendGroupMessage(message, parseInt(id || '0'));
          setMessage('');
        }
      } catch {
        pendingMessageRef.current = null;
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
          <IoArrowBackOutline size={24} onClick={() => navigate(-1)} className="cursor-pointer" />
          <Avatar size={32} name={group.name} variant="beam" colors={["#e81e4a", "#0b1d21", "#078a85", "#68baab", "#edd5c5"]} />
          <div>
            <h3 className="font-bold">{group.name}</h3>
            <p className="text-sm text-gray-500">{group.members?.length} members</p>
          </div>
        </div>
        <IoEllipsisHorizontalOutline size={24} className="cursor-pointer" onClick={toggleGroupInfoDrawer} />
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <Loader />
        ) : (
          <div ref={scrollContainerRef} className="px-4 py-2 pb-16">
            {hasMoreMessages && (
              <button onClick={loadMoreMessages} className="flex items-center justify-center bg-sky-500 text-white font-semibold rounded-md px-4 py-2 mt-4 w-full">
                <IoArrowForward className="mr-2" /> Load More
              </button>
            )}
            {messages.map((msg, index) => (
              <div
                key={`${msg.id}-${msg.createdAt}-${index}`}
                className={`flex ${msg.sender.supabaseId === senderId ? 'justify-end' : 'justify-start'} mb-2`}
                ref={index === messages.length - 1 ? lastMessageRef : null}
              >
                <div className="flex flex-col">
                  {msg.sender.supabaseId !== senderId && (
                    <span className="text-xs text-gray-500 ml-2 mb-1">{msg.sender.fullName}</span>
                  )}
                  <div className={`max-w-xs p-3 rounded-lg ${msg.sender.supabaseId === senderId ? 'bg-sky-400 text-white' : 'bg-gray-200 text-black'}`}>
                    <p>{msg.content}</p>
                    {msg.translatedContent && msg.sender.supabaseId !== senderId && (
                      <>
                        <hr className="border-t border-gray-300 my-2" />
                        <p className="text-sm text-gray-500 mt-1">{msg.translatedContent}</p>
                      </>
                    )}
                    {msg.translations && msg.sender.supabaseId !== senderId && (
                      <>
                        <hr className="border-t border-gray-300 my-2" />
                        <p className="text-sm text-gray-500 mt-1">{getTranslatedContent(msg)}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="bg-white p-4 shadow-md z-10 sticky bottom-0 flex items-center space-x-3">
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 border rounded-lg px-4 py-2"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
        />
        <IoSendOutline size={24} onClick={handleSendMessage} className="cursor-pointer text-sky-500" />
      </div>

      {/* Group Info Drawer */}
      <Drawer open={isGroupInfoDrawerOpen} onClose={toggleGroupInfoDrawer}>
        <DrawerContent>
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Group Info</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Group Name</h3>
                <p>{group.name}</p>
              </div>
              {group.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p>{group.description}</p>
                </div>
              )}
              <div>
                <h3 className="font-semibold mb-2">Members ({group.members.length})</h3>
                <div className="space-y-2">
                  {group.members.map((member) => (
                    <div key={member.id} className="flex items-center space-x-2">
                      <Avatar 
                        size={24} 
                        name={member.user.fullName} 
                        variant="beam" 
                        colors={["#e81e4a", "#0b1d21", "#078a85", "#68baab", "#edd5c5"]} 
                      />
                      <span>{member.user.fullName}</span>
                      <span className="text-sm text-gray-500">({member.role})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default GroupChatPage;