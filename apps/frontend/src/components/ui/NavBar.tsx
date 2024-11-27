import React, { useState } from "react";
import {
  IoHomeOutline,
  IoChatboxEllipsesOutline,
  IoPeopleOutline,
  IoEllipsisHorizontalOutline,
  IoClose,
  IoPeopleSharp,
} from "react-icons/io5";
import { RiChatNewFill } from "react-icons/ri";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import SettingsDrawer from "@/components/right-drawer";
import { useNavigate, useLocation } from "react-router-dom";
import { startNewChat } from "@/services/chatService";
import { IconType } from "react-icons";

interface NavItemProps {
  path: string;
  icon: IconType;
  label: string;
}

interface NavBarProps {
  onNewGroupClick?: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ onNewGroupClick }) => {
  const [isNewChatDrawerOpen, setIsNewChatDrawerOpen] = useState(false);
  const [isControlledDrawerOpen, setIsControlledDrawerOpen] = useState(false);
  const [newChatId, setNewChatId] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleNewChatClick = () => setIsNewChatDrawerOpen(true);
  const closeNewChatDrawer = () => setIsNewChatDrawerOpen(false);
  const openControlledDrawer = () => setIsControlledDrawerOpen(true);
  const closeControlledDrawer = () => setIsControlledDrawerOpen(false);

  const handleCreateChat = async () => {
    if (newChatId.toLowerCase().trim()) {
      let chatid = newChatId.toLowerCase().trim();
      try {
        const newChat = await startNewChat(chatid);
        if (newChat) {
          alert("Successfully Connected");
          closeNewChatDrawer();
          if (location.pathname === "/directs") {
            window.location.reload();
          } else {
            navigate("/directs");
          }
        }
      } catch (error) {
        console.error("Failed to start new chat:", error);
        alert(error);
      }
    }
  };

  const NavItem: React.FC<NavItemProps> = ({ path, icon: Icon }) => {
    const isActive = location.pathname === path;

    return (
      <div
        className="relative flex items-center justify-center"
        onClick={() => navigate(path)}
      >
        <div
          className={`
            w-12 h-12 flex items-center justify-center rounded-full cursor-pointer
            transition-all duration-300 ease-in-out
            ${isActive ? "bg-sky-100" : "hover:bg-sky-50"}
          `}
        >
          <Icon
            size={24}
            className={`
              text-sky-700 transition-all duration-300 ease-in-out
              scale-100
            `}
          />
        </div>
      </div>
    );
  };

  const renderActionButton = () => {
    if (location.pathname === "/groups") {
      return (
        <button
          className="absolute bottom-1/2 transform translate-y-1/2 flex items-center justify-center bg-sky-950 text-white p-3 rounded-full border-8"
          onClick={onNewGroupClick}
          style={{
            left: "50%",
            transform: "translate(-50%, 15%)",
            borderColor: "#f3f4f6",
          }}
        >
          <IoPeopleSharp size={30} />
        </button>
      );
    }

    return (
      <button
        className="absolute bottom-1/2 transform translate-y-1/2 flex items-center justify-center bg-sky-950 text-white p-3 rounded-full border-8"
        style={{
          left: "50%",
          transform: "translate(-50%, 15%)",
          borderColor: "#f3f4f6",
        }}
        onClick={handleNewChatClick}
      >
        <RiChatNewFill size={30} />
      </button>
    );
  };

  return (
    <>
      <div className="fixed bottom-0 w-full bg-white shadow-lg z-10">
        <div className="relative p-2 flex justify-around items-center">
          <NavItem path="/home" icon={IoHomeOutline} label="Home" />
          <NavItem
            path="/directs"
            icon={IoChatboxEllipsesOutline}
            label="Messages"
          />

          <div className="relative w-16">
            {renderActionButton()}
          </div>

          <NavItem path="/groups" icon={IoPeopleOutline} label="Groups" />

          <div className="relative flex items-center justify-center">
            <div
              className="w-12 h-12 flex items-center justify-center rounded-full cursor-pointer
                         hover:bg-sky-50 transition-all duration-300 ease-in-out"
              onClick={openControlledDrawer}
            >
              <IoEllipsisHorizontalOutline size={24} className="text-sky-700" />
            </div>
          </div>
        </div>
      </div>

      <Drawer open={isNewChatDrawerOpen} onClose={closeNewChatDrawer}>
        <DrawerContent>
          <div className="flex justify-between items-center p-4">
            <h2 className="text-lg font-semibold">New Chat</h2>
            <IoClose
              size={24}
              className="cursor-pointer hover:text-sky-700 transition-colors duration-300"
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
              className="w-full p-3 border rounded-full focus:ring-2 focus:ring-sky-500 
                       focus:border-transparent transition-all duration-300"
            />
            <button
              onClick={handleCreateChat}
              className="bg-sky-500 text-white p-3 rounded-full w-full
                       hover:bg-sky-600 transition-colors duration-300"
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
    </>
  );
};

export default NavBar;