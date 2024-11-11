// src/App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import LandingPage from "./pages/LandingPage";
import ProfileStep1 from "./pages/ProfileStep1";
import ProfileStep2 from "./pages/ProfileStep2";
import ChatPage from "./pages/ChatPage";
import AccountPage from "./pages/AccountPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import ContactUsPage from "./pages/ContactUsPage";
import FeedbackPage from "./pages/FeedbackPage";
import { useSelector } from "react-redux";
import { RootState } from "./app/store";
import { useAuth } from "./hooks/useAuth";
import GroupsPage from "./pages/GroupsPage";
import DirectsPage from "./pages/DirectsPage";

const App: React.FC = () => {
  useAuth(); // Check session and restore authentication state
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  return (
    <Routes>
      {/* Display LandingPage as the starting page */}
      <Route path="/" element={<LandingPage />} />

      {/* Protected routes based on authentication */}
      <Route
        path="/home"
        element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
      />
      <Route path="/profile-step-1" element={<ProfileStep1 />} />
      <Route path="/profile-step-2" element={<ProfileStep2 />} />
      <Route path="/chat/:id" element={<ChatPage />} />
      <Route path="/account" element={<AccountPage />} />
      <Route
        path="/login"
        element={!isAuthenticated ? <Login /> : <Navigate to="/home" />}
      />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/termsofservice" element={<TermsOfServicePage />} />
      <Route path="/contactus" element={<ContactUsPage />} />
      <Route path="/feedback" element={<FeedbackPage />} />
      <Route path="/groups" element={<GroupsPage />} />
      <Route path="/directs" element={<DirectsPage />} />
    </Routes>
  );
};

export default App;
