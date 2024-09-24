// src/App.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import LandingPage from './pages/LandingPage';
import ProfileStep1 from './pages/ProfileStep1';
import ProfileStep2 from './pages/ProfileStep2';
import ChatPage from './pages/ChatPage';
import AccountPage from './pages/AccountPage';
import { useSelector } from 'react-redux';
import { RootState } from './app/store';
import { useAuth } from './hooks/useAuth';

const App: React.FC = () => {
    useAuth(); // Check session and restore authentication state
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    return (
        <Routes>
            {/* Display LandingPage as the starting page */}
            
            {/* Protected routes based on authentication */}
            <Route path="/home" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
            <Route path="/" element={isAuthenticated ? <LandingPage /> : <Navigate to="/login" />} />
            <Route path="/profile-step-1" element={isAuthenticated ? <ProfileStep1 /> : <Navigate to="/login" />} />
            <Route path="/profile-step-2" element={isAuthenticated ? <ProfileStep2 /> : <Navigate to="/login" />} />
            <Route path="/chat/:id" element={isAuthenticated ? <ChatPage /> : <Navigate to="/login" />} />
            <Route path="/account" element={isAuthenticated ? <AccountPage /> : <Navigate to="/login" />} />

           {/* Redirect to home if authenticated, otherwise show login/signup */}
           <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/home" />} />
            <Route path="/signup" element={!isAuthenticated ? <SignUp /> : <Navigate to="/home" />} />
        </Routes>
    );
};

export default App;
