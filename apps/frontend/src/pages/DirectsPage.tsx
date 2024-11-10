// src/pages/Home.tsx
import React, { useState, useEffect } from "react";
import {
  IoSearch,
  IoHomeOutline,
  IoClose,
  IoEllipse,
  IoChatboxEllipsesOutline,
  IoPeopleOutline,
  IoEllipsisHorizontalOutline,
} from "react-icons/io5";
import { RiChatNewFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import SettingsDrawer from "../components/right-drawer";
import { startNewChat, getContactsForUser } from "../services/chatService";
import { getUserProfile } from "../services/userService";
import Avatar from "boring-avatars";
import moment from "moment";
import Loader from "@/components/Loader";
import { useLocation } from "react-router-dom";

interface Chat {
  id: string;
  userId?: number;
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
}

const DirectsPage: React.FC = () => {
  const location = useLocation();
  const [isNewChatDrawerOpen, setIsNewChatDrawerOpen] = useState(false);
  const [isControlledDrawerOpen, setIsControlledDrawerOpen] = useState(false);
  const [newChatId, setNewChatId] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  // const [userFullName, setUserFullName] = useState('');
  // const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const userData = await getUserProfile(); // Fetch user's profile from Supabase
        localStorage.setItem("userProfile", JSON.stringify(userData));
        // if (userData) {
        //     setUserFullName(userData.fullName); // Set user's full name
        // }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    }

    fetchUserProfile(); // Call the function to fetch user profile
  }, []);

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
  }, []);

  useEffect(() => {
    if (location.state && location.state.openDrawer) {
      setIsNewChatDrawerOpen(true); // Open the drawer when state is passed
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleNewChatClick = () => {
    setIsNewChatDrawerOpen(true);
  };

  const closeNewChatDrawer = () => {
    setIsNewChatDrawerOpen(false);
  };

  const openControlledDrawer = () => setIsControlledDrawerOpen(true);

  const closeControlledDrawer = () => setIsControlledDrawerOpen(false);

  const handleCreateChat = async () => {
    if (newChatId.toLowerCase().trim()) {
      let chatid = newChatId.toLowerCase().trim();
      console.log(chatid, "----------------------------chatid");
      try {
        const newChat = await startNewChat(chatid);
        if (newChat) {
          // setChats((prevChats) => [...prevChats, newChat]);
          alert("Successfully Connected");
          closeNewChatDrawer();
          window.location.reload();
        }
      } catch (error) {
        console.error("Failed to start new chat:", error);
        alert(error);
      }
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "";
    const date = moment(dateString);
    if (date.isSame(moment(), "day")) {
      return "Today";
    }
    return date.format("MM/DD/YYYY");
  };

  // Filter chats based on search query
  // const filteredChats = chats.filter(chat =>
  //     chat.receiver?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  // );

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Top bar */}
      <div className="fixed top-0 w-full bg-white shadow-md z-10">
        <div className="p-3 flex justify-between items-center">
          {/* <h1 className="text-2xl font-bold">Hello, {userFullName}</h1> */}
          <h1 className="font-poppins italic text-4xl font-bold">LaSo</h1>
        </div>
        <div className="px-3 pb-2 flex justify-between items-center">
          <h2 className="text-xl font-bold">Conversations</h2>
          <IoSearch size={24} />
          {/* <div id='search-box' className="flex items-center border border-gray-300 rounded-full p-2">
                        <input
                            type="text"
                            placeholder="Search chats..."
                            className="outline-none border-none ml-2"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)} // Update search query on input change
                        />
                    </div> */}
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
              className={`flex justify-between items-center  mb-4 relative`}
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
                {/* {chat.receiver?.unread && chat.receiver.unread > 0 && ( */}
                {/* <span className="text-xs text-blue-700 rounded-full px-2 py-1"> */}
                {/* </span> */}
                {/* )} */}
              </div>
            </div>
          ))
        )}
      </div>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 w-full bg-white shadow-lg z-10">
        <div className="relative p-4 flex justify-around items-center">
          {/* Home */}
          <IoHomeOutline size={24} 
          className="text-sky-700 cursor-pointer" 
          onClick={() => navigate("/home")}
          />

          {/* Direct Messages with extra margin-right */}
          <IoChatboxEllipsesOutline
            size={24}
            className="text-sky-700 cursor-pointer mr-6" // Add right margin
          />

          {/* New Chat - Centered and positioned 50% outside the container */}
          <button
            className="absolute bottom-1/2 transform translate-y-1/2 flex items-center justify-center bg-sky-950 text-white p-3 rounded-full border-8"
            onClick={handleNewChatClick}
            style={{
              left: "50%",
              transform: "translate(-50%, 10%)",
              borderColor: "#f3f4f6",
            }}
          >
            <RiChatNewFill size={30} />
          </button>

          {/* Group Messages with extra margin-left */}
          <IoPeopleOutline
            size={24}
            className="text-sky-700 cursor-pointer ml-6" // Add left margin
            onClick={() => navigate("/groups")}
          />

          {/* More Options (dots) */}
          <IoEllipsisHorizontalOutline
            size={24}
            className="text-sky-700 cursor-pointer"
            onClick={openControlledDrawer}
          />
        </div>
      </div>

      {/* Drawer for New Chat */}
      <Drawer open={isNewChatDrawerOpen} onClose={closeNewChatDrawer}>
        <DrawerContent>
          <div className="flex justify-between items-center p-4">
            <h2 className="text-lg font-semibold">New Chat</h2>
            <IoClose
              size={24}
              className="cursor-pointer"
              onClick={closeNewChatDrawer}
            />
          </div>
          <div className="p-6 space-y-4">
            <p className="text-gray-600">
              Add new friends to chat! Enter their email address to start a
              conversation.
            </p>
            <input
              type="email"
              required
              value={newChatId}
              onChange={(e) => setNewChatId(e.target.value)}
              placeholder="Enter User Email"
              className="w-full p-3 border rounded-full"
            />
            <button
              onClick={handleCreateChat}
              className="bg-sky-500 text-white p-3 rounded-full w-full"
            >
              Create Chat
            </button>
          </div>
        </DrawerContent>
      </Drawer>

      <SettingsDrawer
        isOpen={isControlledDrawerOpen}
        onClose={closeControlledDrawer}
      />
    </div>
  );
};

export default DirectsPage;
