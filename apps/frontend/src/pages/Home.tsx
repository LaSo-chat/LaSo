// src/pages/Home.tsx
import React, { useState, useEffect } from 'react';
import { IoSearch, IoChatbubbleEllipsesOutline, IoPersonOutline, IoHomeOutline, IoClose } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import {
    Drawer,
    DrawerContent,
} from '@/components/ui/drawer';
import { startNewChat, getContactsForUser } from '../services/chatService';
import Avatar from 'boring-avatars';
import moment from 'moment';
import Loader from '@/components/Loader';
import { useLocation } from 'react-router-dom';

interface Chat {
    id: string;
    receiver: {
        image?: string;
        fullName?: string;
        unread?: number;
    };
    lastMessage?: {
        content?: string;
        createdAt?: string;
    };
}

const Home: React.FC = () => {
    const location = useLocation();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [newChatId, setNewChatId] = useState('');
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    

    useEffect(() => {
        async function fetchContacts() {
            try {
                const contacts = await getContactsForUser();
                setChats(contacts);
            } catch (error) {
                console.error('Failed to fetch contacts:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchContacts();
    }, []);

    useEffect(() => {
        if (location.state && location.state.openDrawer) {
            setIsDrawerOpen(true); // Open the drawer when state is passed
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const handleNewChatClick = () => {
        setIsDrawerOpen(true);
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
    };

    const handleCreateChat = async () => {
        if (newChatId.trim()) {
            try {
                const newChat = await startNewChat(newChatId);
                if (newChat) {
                    // setChats((prevChats) => [...prevChats, newChat]);
                    alert('Successfully Connected')    
                    closeDrawer();
                
                    window.location.reload();
                }
            } catch (error) {
                console.error("Failed to start new chat:", error);
                alert(error)
            }
        }
    };

    const formatDate = (dateString?: string): string => {
        if (!dateString) return '';
        const date = moment(dateString);
        if (date.isSame(moment(), 'day')) {
            return 'Today';
        }
        return date.format('MM/DD/YYYY');
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            {/* Top bar */}
            <div className="fixed top-0 w-full bg-white shadow-md z-10">
                <div className="p-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Mengobrol</h1>
                    <IoSearch size={24} />
                </div>
                <div className="px-4 pb-2">
                    <h2 className="text-xl font-bold">Chats</h2>
                </div>
            </div>

            {/* Scrollable Chats Section */}
            <div className="flex-1 mt-28 overflow-y-auto p-4">
                {loading ? (
                    <Loader />
                ) : chats.length === 0 ? (
                    <p>No chats available.</p>
                ) : (
                    chats.map((chat) => (
                        <div
                            key={chat.id}
                            className="flex justify-between items-center mb-4"
                            onClick={() => navigate(`/chat/${chat.id}`, {
                                state: {
                                    receiverName: chat.receiver?.fullName || "Unknown User",
                                    receiverImage: chat.receiver?.image,
                                    lastMessage: chat.lastMessage?.content || "No messages yet"
                                }
                            })}
                        >
                            <div className="flex items-center space-x-4">
                                {chat.receiver?.image ? (
                                    <img src={chat.receiver.image} alt={chat.receiver.fullName} className="w-12 h-12 rounded-full" />
                                ) : (
                                    <Avatar
                                        size={48}
                                        name={chat.id || chat.receiver?.fullName || 'Unknown'}
                                        colors={["#e81e4a", "#0b1d21", "#078a85", "#68baab", "#edd5c5"]}
                                        variant="beam"
                                    />
                                )}
                                <div>
                                    <h3 className="font-semibold">{chat.receiver?.fullName || "Unknown User"}</h3>
                                    <p className="text-gray-500 text-sm truncate w-48 whitespace-nowrap">{chat?.lastMessage?.content || "No messages yet"}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-400">{formatDate(chat.lastMessage?.createdAt)}</p>
                                {chat.receiver?.unread && chat.receiver.unread > 0 && (
                                    <span className="text-xs text-white bg-sky-500 rounded-full px-2 py-1">
                                        {chat.receiver.unread}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Bottom Navigation Bar */}
            <div className="fixed bottom-0 w-full bg-white shadow-lg z-10">
                <div className="p-4 flex justify-around items-center">
                    <IoHomeOutline size={24} className="text-sky-700" />
                    <button className="flex items-center space-x-2 bg-sky-950 text-white px-4 py-2 rounded-full" onClick={handleNewChatClick}>
                        <IoChatbubbleEllipsesOutline size={20} />
                        <span>New Chat</span>
                    </button>
                    <IoPersonOutline size={24} className="cursor-pointer" onClick={() => navigate('/account')} />
                </div>
            </div>

            {/* Drawer for New Chat */}
            <Drawer open={isDrawerOpen} onClose={closeDrawer}>
                <DrawerContent>
                    <div className="flex justify-between items-center p-4">
                        <h2 className="text-lg font-semibold">New Chat</h2>
                        <IoClose size={24} className="cursor-pointer" onClick={closeDrawer} />
                    </div>
                    <div className="p-6 space-y-4">
                        <input
                            type="email"
                            required
                            value={newChatId}
                            onChange={(e) => setNewChatId(e.target.value)}
                            placeholder="Enter User Email"
                            className="w-full p-3 border rounded-full"
                        />
                        <button onClick={handleCreateChat} className="bg-sky-500 text-white p-3 rounded-full w-full">
                            Create Chat
                        </button>
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    );
};

export default Home;
