import React, { useState, useEffect, useCallback, useRef } from 'react';
import { IoArrowBackOutline, IoSendOutline } from 'react-icons/io5';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getUserFromSession } from '../services/authService';
import { socketService } from '../services/socketService';
import Loader from '@/components/Loader';
import { markMessagesAsRead } from '@/services/chatService';

interface Message {
    id: number;
    content: string;
    sender?: { supabaseId: string };
    receiverId: number;
    createdAt: string;
    isRead?: boolean;
    translatedContent?: string;
}

interface LocationState {
    receiver: any;
  }

const ChatPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [senderId, setSenderId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { receiver } = location.state as LocationState;

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const lastMessageRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        if (lastMessageRef.current) {
            lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    const handleNewMessage = useCallback((newMessage: Message) => {
        console.log('New message received:', newMessage);
        setMessages(prevMessages => [...prevMessages, newMessage]);
    }, []);

    useEffect(() => {
        async function setupChatAndSocket() {
            try {
                setIsLoading(true);
                const userId = await getUserFromSession();
                setSenderId(userId);

                const backendUrl = import.meta.env.VITE_API_URL || 'https://laso.onrender.com';
                const response = await fetch(`${backendUrl}/api/chat/messages/${id}?userId=${userId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch messages');
                }
                const data = await response.json();
                setMessages(data);

                await socketService.connect();
                socketService.onMessage(handleNewMessage);

                // Mark messages as read when the chat opens
                await updateMessagesAsRead();

            } catch (error) {
                console.error('Error setting up chat:', error);
                setError('Failed to load chat. Please try again.');
            } finally {
                setIsLoading(false);
            }
        }

        setupChatAndSocket();

        return () => {
            socketService.offMessage(handleNewMessage);
            socketService.disconnect();
        };
    }, [id, handleNewMessage]);

    const handleSendMessage = () => {
        if (message.trim() && senderId && id) {
            const newMessage: Message = {
                id: Date.now(),
                content: message,
                sender: { supabaseId: senderId },
                receiverId: parseInt(id, 10),
                createdAt: new Date().toISOString()
            };

            console.log("newMessage----------------", newMessage);

            setMessages(prevMessages => [...prevMessages, newMessage]);
            socketService.sendMessage(message, parseInt(id, 10));
            setMessage('');
        }
    };

    const updateMessagesAsRead = useCallback(async () => {
        if (!id) {
            console.warn('Chat ID is undefined, skipping markMessagesAsRead');
            return;
        }
        const chatId = Number(id); // Convert id to a number
        if (isNaN(chatId)) {
            console.error('Invalid chat ID:', id);
            return;
        }
        try {
            await markMessagesAsRead(chatId); // Call API to mark messages as read
            // Update state locally without expecting new messages
            setMessages(prevMessages => 
                prevMessages.map(msg => ({
                    ...msg,
                    isRead: true,
                }))
            );
        } catch (error) {
            console.error('Failed to mark messages as read:', error);
        }
    }, [id]);
    

    useEffect(() => {
        if (!isLoading) {
            const timeoutId = setTimeout(() => {
                scrollToBottom();
                console.log('Attempted to scroll to bottom');
            }, 100);

            return () => clearTimeout(timeoutId);
        }
    }, [messages, isLoading, scrollToBottom]);

    // Debug logging
    useEffect(() => {
        if (scrollContainerRef.current) {
            console.log('Scroll container height:', scrollContainerRef.current.scrollHeight);
            console.log('Scroll container client height:', scrollContainerRef.current.clientHeight);
            console.log('Scroll position:', scrollContainerRef.current.scrollTop);
        }
    }, [messages]);

    if (error) return <div>{error}</div>;

    return (
        <div className="flex flex-col h-screen">
            {/* Top Bar */}
            <div className="bg-white shadow-md z-10 flex justify-between items-center p-4 sticky top-0">
                <div className="flex items-center space-x-2">
                    <IoArrowBackOutline size={24} onClick={() => navigate(-1)} className="cursor-pointer" />
                    <h3 className="font-bold">Chat with {receiver.fullName}</h3>
                </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <Loader />
                ) : (
                    <div ref={scrollContainerRef} className="px-4 py-2 pb-16">
                        {messages.map((msg, index) => (
                            <div 
                                key={index} 
                                className={`flex ${msg.sender?.supabaseId === senderId ? 'justify-end' : 'justify-start'} mb-2`}
                                ref={index === messages.length - 1 ? lastMessageRef : null}
                            >
                                <div className={`max-w-xs p-3 rounded-lg ${msg.sender?.supabaseId === senderId ? 'bg-sky-400 text-white' : 'bg-gray-200 text-black'}`}>
                                    <p>{msg.content}</p>
                                    {msg.translatedContent && msg.sender?.supabaseId !== senderId && (
                                        <>
                                            <hr className="border-t border-gray-300 my-2" />
                                            <p className="text-sm text-gray-500 mt-1">{msg.translatedContent}</p>
                                        </>
                                    )}
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
                />
                <button onClick={handleSendMessage} className="bg-sky-400 text-white rounded-full p-3">
                    <IoSendOutline size={24} />
                </button>
            </div>
        </div>
    );
};

export default ChatPage;