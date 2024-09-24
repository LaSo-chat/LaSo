// src/pages/AccountPage.tsx
import React, { useState, useEffect } from 'react';
import { IoHomeOutline, IoChatbubbleEllipsesOutline, IoPersonOutline, IoLogOutOutline } from 'react-icons/io5'; // Icons
import { useNavigate } from 'react-router-dom';
import { signOut } from '../services/authService';
import { useDispatch } from 'react-redux';
import { getUserProfile, updateUserProfile } from '../services/userService';
import Loader from '@/components/Loader';

const AccountPage: React.FC = () => {
    const [showModal, setShowModal] = useState(false); // State to control modal visibility
    const [isLoading, setIsLoading] = useState(true);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleNewChatClick = () => {
        navigate('/home', { state: { openDrawer: true } }); // Navigate to home and pass state to open drawer
    };

    const closeModal = () => {
        setShowModal(false); // Hide the modal when clicking outside or on cancel
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setIsLoading(true);
                const storedUserProfile = localStorage.getItem('userProfile');
            if (!storedUserProfile) {
                const userData = await getUserProfile(); // Fetch the user's profile from Supabase
                if (userData) {
                    setFullName(userData.fullName);
                    setEmail(userData.email);
                    setMobileNumber(userData.phone);
                    setPreferredLanguage(userData.preferredLang);
                    
                    // Optionally, save the user profile to local storage for future use
                    localStorage.setItem('userProfile', JSON.stringify(userData));
                }
            } else {
                // If user profile exists, parse and set state from local storage
                const parsedUserProfile = JSON.parse(storedUserProfile);
                setFullName(parsedUserProfile.fullName);
                setEmail(parsedUserProfile.email);
                setMobileNumber(parsedUserProfile.phone);
                setPreferredLanguage(parsedUserProfile.preferredLang);
            }
            } catch (error) {
                console.error('Error fetching user profile:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleSave = async () => {
        const updatedProfile = {
            fullName,
            phone: mobileNumber,
            preferredLang: preferredLanguage,
            dateOfBirth: "2024-09-25T00:00:00.000Z"
        };

        try {
            await updateUserProfile(updatedProfile); // Update the user's profile
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        }
    };

    const handleLogout = async (): Promise<void> => {
        try {
            await signOut(dispatch); // Pass dispatch as an argument
            navigate('/login'); // Redirect after logging out
        } catch (error) {
            console.error('Failed to log out:', (error as Error).message);
            alert('Failed to log out. Please try again.');
        }
    };



    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState(''); // Email is non-editable
    const [mobileNumber, setMobileNumber] = useState('');
    const [preferredLanguage, setPreferredLanguage] = useState('');

    // Define the language options for the dropdown
    const languageOptions = [
        { value: 'en', label: 'English' },
        { value: 'fr', label: 'French' },
        { value: 'es', label: 'Spanish' },
        { value: 'de', label: 'German' },
        { value: 'zh', label: 'Chinese' },
        { value: 'hi', label: 'Hindi' },
        { value: 'ar', label: 'Arabic' },
        { value: 'tl', label: 'Tagalog' },
        { value: 'tr', label: 'Turkish' },
        { value: 'it', label: 'Italian' },
        { value: 'te', label: 'Telugu' },
        // Add more languages as needed
    ];

    return (
        <div className="flex flex-col min-h-screen">
            {/* Top Header with Logout Button */}
            <div className="fixed top-0 w-full bg-white shadow-md z-10 flex items-center justify-between p-4">
                <h3 className="text-lg ml-2 font-semibold">Edit Profile Info</h3>
                <IoLogOutOutline
                    size={24}
                    className="cursor-pointer text-red-600"
                    onClick={handleLogout}
                /> {/* Logout icon */}
            </div>

            {/* Scrollable Form */}
            {isLoading ? <Loader /> : (
                <div className="flex-1 mt-16 overflow-y-auto p-4">
                    {/* Full Name Field */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full p-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-600"
                        />
                    </div>

                    {/* Email Field (Non-editable) */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Email (Cannot be changed)</label>
                        <input
                            type="email"
                            value={email}
                            disabled
                            className="w-full p-4 border border-gray-300 rounded-full bg-gray-100 cursor-not-allowed"
                        />
                    </div>

                    {/* Mobile Number Field */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                        <input
                            type="text"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                            className="w-full p-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                    </div>

                    {/* Preferred Language Field (Dropdown) */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Preferred Language</label>
                        <select
                            value={preferredLanguage}
                            onChange={(e) => setPreferredLanguage(e.target.value)}
                            className="w-full p-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                            <option value="">Select a language</option>
                            {languageOptions.map((lang) => (
                                <option key={lang.value} value={lang.value}>
                                    {lang.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        className="w-full bg-sky-600 text-white p-4 rounded-full hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600"
                    >
                        Save
                    </button>
                </div>
            )}

            {/* Modal Popup */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-20">
                    <div className="bg-white rounded-lg p-6 w-80">
                        <h2 className="text-lg font-semibold mb-4">New Chat</h2>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <IoChatbubbleEllipsesOutline size={24} className="mr-2" />
                                <div>
                                    <h3 className="font-medium">New Chat</h3>
                                    <p className="text-sm text-gray-500">Send a message to your contact</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <IoPersonOutline size={24} className="mr-2" />
                                <div>
                                    <h3 className="font-medium">New Contact</h3>
                                    <p className="text-sm text-gray-500">Add a contact to be able to send messages</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <IoPersonOutline size={24} className="mr-2" />
                                <div>
                                    <h3 className="font-medium">New Community</h3>
                                    <p className="text-sm text-gray-500">Join the community around you</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={closeModal}
                            className="mt-6 w-full text-center bg-gray-300 py-2 rounded-full font-semibold"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Fixed Bottom Navigation Bar */}
            <div className="fixed bottom-0 w-full bg-white shadow-lg z-10">
                <div className="p-4 flex justify-around items-center">
                    <IoHomeOutline size={24} className="cursor-pointer" onClick={() => navigate('/home')} />
                    <button
                        className="flex items-center space-x-2 bg-sky-950 text-white px-4 py-2 rounded-full"
                        onClick={handleNewChatClick}
                    >
                        <IoChatbubbleEllipsesOutline size={20} />
                        <span>New Chat</span>
                    </button>
                    <IoPersonOutline size={24} className="cursor-pointer" onClick={() => navigate('/account')} />
                </div>
            </div>
        </div>
    );
};

export default AccountPage;
