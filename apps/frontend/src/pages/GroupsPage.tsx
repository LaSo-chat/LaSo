import React, { useState, useEffect } from "react";
import {
  IoSearch,
  IoHomeOutline,
  IoClose,
  IoEllipse,
  IoChatboxEllipsesOutline,
  IoPeopleOutline,
  IoEllipsisHorizontalOutline,
  IoPeopleSharp,
  IoCheckmarkCircle,
} from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import SettingsDrawer from "../components/right-drawer";
import Avatar from "boring-avatars";
import moment from "moment";
import Loader from "@/components/Loader";
import { getUserFromSession } from '../services/authService';


interface GroupMember {
  id: number;
  fullName: string;
  email: string;
  image?: string;
}

interface Group {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  members: GroupMember[];
  lastMessage?: {
    content?: string;
    createdAt?: string;
    isRead?: boolean;
    sender: {
      email?: string;
      fullName?: string;
      id?: number;
      preferredLang?: string;
      country?: string;
    }
  };
}

const GroupsPage: React.FC = () => {
  const [isNewGroupDrawerOpen, setIsNewGroupDrawerOpen] = useState(false);
  const [isControlledDrawerOpen, setIsControlledDrawerOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [availableMembers, setAvailableMembers] = useState<GroupMember[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();


  // Fetch groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const userId = await getUserFromSession();
        const backendUrl = import.meta.env.VITE_API_URL || 'https://laso.onrender.com';
        const response = await fetch(`${backendUrl}/api/groups/getGroups?userId=${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch groups');
        }

        const data = await response.json();
        setGroups(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch groups');
        console.error('Error fetching groups:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  // Fetch available members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const userId = await getUserFromSession();
        const backendUrl = import.meta.env.VITE_API_URL || 'https://laso.onrender.com';
        const response = await fetch(`${backendUrl}/api/user/contacts?userId=${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch members');
        }

        const data = await response.json();
        setAvailableMembers(data);
      } catch (err) {
        console.error('Error fetching members:', err);
      }
    };

    if (isNewGroupDrawerOpen) {
      fetchMembers();
    }
  }, [isNewGroupDrawerOpen]);

  const handleNewGroupClick = () => {
    setIsNewGroupDrawerOpen(true);
  };

  const closeNewGroupDrawer = () => {
    setIsNewGroupDrawerOpen(false);
    setNewGroupName("");
    setNewGroupDescription("");
    setSelectedMembers([]);
    setSearchTerm("");
  };

  const openControlledDrawer = () => setIsControlledDrawerOpen(true);

  const closeControlledDrawer = () => setIsControlledDrawerOpen(false);

  const toggleMemberSelection = (email: string) => {
    setSelectedMembers(prev => 
      prev.includes(email)
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
  };

  const filteredMembers = availableMembers.filter(member =>
    member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateGroup = async () => {
    if (newGroupName.trim() && selectedMembers.length > 0) {
      try {
        const userId = await getUserFromSession();
        const backendUrl = import.meta.env.VITE_API_URL || 'https://laso.onrender.com';
        const response = await fetch(`${backendUrl}/api/groups/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            userId: userId,
            name: newGroupName,
            description: newGroupDescription,
            members: selectedMembers
          })
        });

        if (!response.ok) {
          throw new Error('Failed to create group');
        }

        const newGroup = await response.json();
        setGroups(prevGroups => [...prevGroups, newGroup]);
        closeNewGroupDrawer();
      } catch (error) {
        console.error("Failed to create group:", error);
        alert(error instanceof Error ? error.message : 'Failed to create group');
      }
    } else {
      alert("Please enter a group name and select at least one member");
    }
  };

  const handleGroupClick = async (group: any) => {
    try {
      // Mark messages as read when entering the group
      const userId = await getUserFromSession();
      console.log(group,'-----------group');
      
      const backendUrl = import.meta.env.VITE_API_URL || 'https://laso.onrender.com';
      await fetch(`${backendUrl}/api/groups/${group.id}/messages/read?userId=${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          userId: userId,
        })
      });

      navigate(`/group/${group.id}`, {
        state: {
          group: group,
        },
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      // Still navigate even if marking as read fails
      navigate(`/group/${group.id}`);
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-sky-500 text-white px-4 py-2 rounded-full"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Top bar */}
      <div className="fixed top-0 w-full bg-white shadow-md z-10">
        <div className="p-3 flex justify-between items-center">
          <h1 className="font-poppins italic text-4xl font-bold">LaSo</h1>
        </div>
        <div className="px-3 pb-2 flex justify-between items-center">
          <h2 className="text-xl font-bold">Groups</h2>
          <IoSearch size={24} />
        </div>
      </div>

      {/* Scrollable Groups Section */}
      <div className="flex-1 mt-28 overflow-y-auto p-3">
        {loading ? (
          <Loader />
        ) : groups.length === 0 ? (
          <p>No groups available.</p>
        ) : (
          groups.map((group) => (
            <div
              key={group.id}
              className="flex justify-between items-center mb-4 relative cursor-pointer"
              onClick={() => handleGroupClick(group)}
            >
              {!group.lastMessage?.isRead && (
                <IoEllipse
                  size={15}
                  className="absolute top-0 left-0 text-sky-600 bg-white rounded-full"
                />
              )}
              <div className="flex items-center space-x-4">
                <Avatar
                  size={48}
                  name={group.name}
                  colors={["#e81e4a", "#0b1d21", "#078a85", "#68baab", "#edd5c5"]}
                  variant="beam"
                />
                <div>
                  <h3 className="font-semibold">{group.name}</h3>
                  <p className="text-xs text-gray-500">{group.memberCount} members</p>
                  <p className="text-sm text-gray-500 truncate w-48">
                    {group.lastMessage ? 
                      `${group.lastMessage.sender.fullName}: ${group.lastMessage.content}` :
                      "No messages yet"}
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-end items-end">
                <p className="text-sm text-gray-400">
                  {formatDate(group.lastMessage?.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 w-full bg-white shadow-lg z-10">
        <div className="relative p-4 flex justify-around items-center">
          <IoHomeOutline 
            size={24} 
            className="text-sky-700 cursor-pointer"
            onClick={() => navigate("/home")}
          />
          
          <IoChatboxEllipsesOutline
            size={24}
            className="text-sky-700 cursor-pointer mr-6"
            onClick={() => navigate("/directs")}
          />

          <button
            className="absolute bottom-1/2 transform translate-y-1/2 flex items-center justify-center bg-sky-950 text-white p-3 rounded-full border-8"
            onClick={handleNewGroupClick}
            style={{
              left: "50%",
              transform: "translate(-50%, 10%)",
              borderColor: "#f3f4f6",
            }}
          >
            <IoPeopleSharp size={30} />
          </button>

          <IoPeopleOutline
            size={24}
            className="text-sky-700 cursor-pointer ml-6"
          />

          <IoEllipsisHorizontalOutline
            size={24}
            className="text-sky-700 cursor-pointer"
            onClick={openControlledDrawer}
          />
        </div>
      </div>

      {/* Drawer for New Group */}
      <Drawer open={isNewGroupDrawerOpen} onClose={closeNewGroupDrawer}>
        <DrawerContent>
          <div className="flex justify-between items-center p-4">
            <h2 className="text-lg font-semibold">Create New Group</h2>
            <IoClose
              size={24}
              className="cursor-pointer"
              onClick={closeNewGroupDrawer}
            />
          </div>
          <div className="p-6 space-y-4">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Group Name"
              className="w-full p-3 border rounded-full"
            />
            <textarea
              value={newGroupDescription}
              onChange={(e) => setNewGroupDescription(e.target.value)}
              placeholder="Group Description (optional)"
              className="w-full p-3 border rounded-lg resize-none h-24"
            />
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Add Members</p>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search members..."
                className="w-full p-3 border rounded-full mb-4"
              />
              <div className="max-h-48 overflow-y-auto space-y-2">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => toggleMemberSelection(member.email)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar
                        size={32}
                        name={member.fullName}
                        variant="beam"
                        colors={["#e81e4a", "#0b1d21", "#078a85", "#68baab", "#edd5c5"]}
                      />
                      <div>
                        <p className="font-medium">{member.fullName}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                    </div>
                    {selectedMembers.includes(member.email) && (
                      <IoCheckmarkCircle className="text-sky-500" size={24} />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Selected: {selectedMembers.length} members
              </p>
            </div>
            <button
              onClick={handleCreateGroup}
              className="bg-sky-500 text-white p-3 rounded-full w-full"
            >
              Create Group
            </button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Settings Drawer */}
      <SettingsDrawer
        isOpen={isControlledDrawerOpen}
        onClose={closeControlledDrawer}
      />
    </div>
  );
};

export default GroupsPage;