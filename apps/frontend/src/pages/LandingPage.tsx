// src/pages/LandingPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, getUserFromSession } from '../services/authService';
import '../App.css'

const LandingPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const navigate = useNavigate();

    // Check user authorization
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const user = await getCurrentUser();
                if (!user) {
                    navigate('/signup'); // If no user, redirect to signup
                } else {
                    // If user is logged in, check authorization
                    const userId = await getUserFromSession();
                    if (userId) {
                        setIsAuthorized(true); // If authorized
                        navigate('/home'); // Redirect to home page after authorization check
                    } else {
                        setIsAuthorized(false); // If not authorized
                        navigate('/signup'); // Redirect to signup
                    }
                }
            } catch (error) {
                console.error('Authorization check failed:', error);
                navigate('/signup'); // In case of error, navigate to signup
            } finally {
                setIsLoading(false); // End loading state
            }
        };

        checkAuthStatus(); // Run the check on component mount
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

            {/* Message if unauthorized */}
            {!isLoading && !isAuthorized && (
                <div className="mt-5 text-center text-red-600">
                    <p>You are not authorized. Please sign up or log in.</p>
                </div>
            )}
        </div>
    );
};

export default LandingPage;
