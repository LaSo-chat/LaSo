// src/pages/LandingPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'

const LandingPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Simulate loading effect for at least 5 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
            navigate('/signup'); // Redirect to the home page after loading
        }, 5000); // 5 seconds delay

        return () => clearTimeout(timer); // Clean up the timer
    }, [navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white">
            {/* Logo and text */}
            <div className="text-center">
                <h1 className="text-5xl font-bold mb-2 font-poppins italic">LaSo</h1>
                <p className="text-lg text-gray-600">Real-time Translation for your text messages</p>
            </div>

            {/* Loader */}
            {isLoading && (
                <div className="mt-20">
                    <div className="loader-circle">
                        <div className="circle"></div>
                        <div className="circle"></div>
                        <div className="circle"></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandingPage;
