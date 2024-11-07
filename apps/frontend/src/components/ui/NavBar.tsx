// src/components/NavBar.tsx
import React, { useState } from "react";
import {
  IoChatbubbleEllipsesOutline,
  IoHomeOutline,
  IoChatboxEllipsesOutline,
  IoPeopleOutline,
  IoEllipsisHorizontalOutline,
  IoClose,
} from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import ControlledRightDrawer from "@/components/right-drawer";

interface NavBarProps {
  onNewChat: (email: string) => Promise<void>;
}

const NavBar: React.FC<NavBarProps> = ({ onNewChat }) => {
  const [isNewChatDrawerOpen, setIsNewChatDrawerOpen] = useState(false);
  const [isControlledDrawerOpen, setIsControlledDrawerOpen] = useState(false);
  const [newChatId, setNewChatId] = useState("");
  const navigate = useNavigate();

  const handleNewChatClick = () => setIsNewChatDrawerOpen(true);
  const closeNewChatDrawer = () => setIsNewChatDrawerOpen(false);
  const openControlledDrawer = () => setIsControlledDrawerOpen(true);
  const closeControlledDrawer = () => setIsControlledDrawerOpen(false);

  const handleCreateChat = async () => {
    if (newChatId.toLowerCase().trim()) {
      await onNewChat(newChatId.toLowerCase().trim());
      closeNewChatDrawer();
      setNewChatId("");
    }
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 w-full bg-white shadow-lg z-10">
        <div className="p-4 flex justify-around items-center">
          <IoHomeOutline
            size={24}
            className="text-sky-700 cursor-pointer"
            onClick={() => navigate("/")}
          />
          <IoChatboxEllipsesOutline
            size={24}
            className="text-sky-700 cursor-pointer"
            onClick={() => navigate("/direct-messages")}
          />
          <button
            className="flex items-center justify-center bg-sky-950 text-white p-3 rounded-full"
            onClick={handleNewChatClick}
          >
            <IoChatbubbleEllipsesOutline size={20} />
          </button>
          <IoPeopleOutline
            size={24}
            className="text-sky-700 cursor-pointer"
            onClick={() => navigate("/group-messages")}
          />
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

      <ControlledRightDrawer
        isOpen={isControlledDrawerOpen}
        onClose={closeControlledDrawer}
      />
    </>
  );
};

export default NavBar;
