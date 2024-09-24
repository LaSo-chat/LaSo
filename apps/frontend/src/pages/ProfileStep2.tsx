// src/pages/ProfileStep2.tsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { updateUserProfile } from '../services/userService'; // Import the API call

const ProfileStep2: React.FC = () => {
    const [preferredLanguage, setPreferredLanguage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const handleFinish = async () => {
        if (preferredLanguage) {
            const { name, country, phone, dob } = location.state; // Retrieve data from state
            const profileData = {
                fullName: name,
                country,
                phone,
                dateOfBirth: dob,
                preferredLang: preferredLanguage,
            };

            try {
                await updateUserProfile(profileData); // Call the API to update profile
                // localStorage.setItem('profileData', JSON.stringify(res));
                console.log('Profile updated successfully');
                navigate('/home'); // Redirect to home after successful profile completion
                window.location.reload();
            } catch (error) {
                console.error('Failed to update profile:', error);
                alert('Failed to update profile. Please try again.');
            }
        } else {
            alert('Please select a preferred language.');
        }
    };

    const languageOptions = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'zh', name: 'Chinese' },
        { code: 'it', name: 'Italian' },
        { code: 'ar', name: 'Arabic' },
        // Add more languages here as needed
    ];

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4">Select Your Preferred Language</h1>
                <div className="mb-4">
                    {languageOptions.map((language) => (
                        <div
                            key={language.code}
                            className={`p-4 border border-gray-300 rounded-full mb-4 ${
                                preferredLanguage === language.code ? 'bg-sky-200' : ''
                            }`}
                            onClick={() => setPreferredLanguage(language.code)}
                        >
                            {language.name}
                        </div>
                    ))}
                </div>

                <div className="mt-6">
                    <button
                        onClick={handleFinish}
                        className="w-full bg-sky-500 text-white p-4 rounded-full hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                        Finish
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileStep2;
