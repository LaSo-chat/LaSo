import React, { useState, useEffect, useCallback, useRef } from 'react';
import { IoArrowBackOutline, IoSendOutline } from 'react-icons/io5';
import { useNavigate, useParams } from 'react-router-dom';
import { getUserFromSession } from '../services/authService';
import { socketService } from '../services/socketService';
import Loader from '@/components/Loader';

interface Message {
    id: number;
    content: string;
    sender: { supabaseId: string };
    receiverId: string;
    createdAt: string;
}

const ChatPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [senderId, setSenderId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Reference for the chat messages container
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

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

                const response = await fetch(`/api/chat/messages/${id}?userId=${userId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch messages');
                }
                const data = await response.json();
                setMessages(data);
                scrollToBottom(); // Scroll to the bottom when the chat opens

                await socketService.connect();
                socketService.onMessage(handleNewMessage);

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
                id: Date.now(), // Temporary ID, will be replaced by server
                content: message,
                sender: { supabaseId: senderId },
                receiverId: id,
                createdAt: new Date().toISOString()
            };

            // Optimistically update UI
            setMessages(prevMessages => [...prevMessages, newMessage]);
            scrollToBottom(); // Scroll to the bottom when the chat opens

            // Send message through socket
            socketService.sendMessage(message, parseInt(id, 10));

            // Clear input
            setMessage('');
        }
    };

    if (error) return <div>{error}</div>;

    return (
        <div className="flex flex-col min-h-screen">
            {/* Top Bar */}
            <div className="fixed top-0 w-full bg-white shadow-md z-10 flex justify-between items-center p-4">
                <div className="flex items-center space-x-2">
                    <IoArrowBackOutline size={24} onClick={() => navigate(-1)} className="cursor-pointer" />
                    <h3 className="font-bold">Chat with {id}</h3>
                </div>
            </div>

            {/* Chat Messages */}
            {isLoading ? <Loader></Loader> : <div className="flex-1 my-40 p-4 overflow-y-auto">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender?.supabaseId === senderId ? 'justify-end' : 'justify-start'} mb-2`}>
                        <div className={`max-w-xs p-3 rounded-lg ${msg.sender?.supabaseId === senderId ? 'bg-sky-400 text-white' : 'bg-gray-200 text-black'}`}>
                            <p>{msg.content}</p>
                            
                            {msg.translatedContent && msg.sender?.supabaseId !== senderId && (<>
                                <hr className="border-t border-gray-300 my-2" /><p className="text-sm text-gray-500 mt-1">{msg.translatedContent}</p>
                            </>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>}


            {/* Bottom Input Area */}
            <div className="fixed bottom-0 w-full bg-white p-4 shadow-lg flex items-center space-x-2">
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