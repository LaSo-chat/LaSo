// src/pages/ProfileStep1.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfileStep1: React.FC = () => {
    const [name, setName] = useState('');
    const [country, setCountry] = useState('');
    const [phone, setPhone] = useState('');
    const [dob, setDob] = useState('');
    const navigate = useNavigate();

    const handleNext = () => {
        // Handle form validation and then navigate to the second step
        if (name && country && phone && dob) {
            navigate('/profile-step-2', {
                state: { name, country, phone, dob },
            });
        } else {
            alert('Please fill all the fields.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4">Let's create your profile</h1>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-600"
                        placeholder="John Doe"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Country</label>
                    <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-600"
                        placeholder="USA"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-600"
                        placeholder="+1 123 456 7890"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-600"
                    />
                </div>

                <div className="mt-6">
                    <button
                        onClick={handleNext}
                        className="w-full bg-sky-600 text-white p-4 rounded-full hover:bg-sky-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileStep1;
