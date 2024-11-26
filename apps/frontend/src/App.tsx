import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "./app/store";
import { useAuth } from "./hooks/useAuth";
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
import GroupsPage from "./pages/GroupsPage";
import DirectsPage from "./pages/DirectsPage";
import { SocketProvider } from "./contexts/SocketContext";
import GroupChatPage from "./pages/GroupChatPage";
import { PwaInstallPopup } from "./components/PwaInstallPopup";
import { useFCM } from "./hooks/useFCM"; // Assuming we've moved this to a hooks folder
import { Toaster } from "react-hot-toast";
import { initializeNotifications } from "./config/notification";
import { socketService } from "./services/socketService";

const App: React.FC = () => {
  useAuth(); // Check session and restore authentication state
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const { fcmToken, notificationError } = useFCM(); // Use FCM hook

  React.useEffect(() => {
    if (fcmToken) {
      console.log("FCM Token:", fcmToken);
      // Token sending is now handled in the useFCM hook
    }

    if (notificationError) {
      console.error("Notification Error:", notificationError);
    }
    initializeNotifications();

    // Clean up on unmount
    return () => {
      // Disconnect socket when component unmounts
      socketService.disconnect();
    };
  }, [fcmToken, notificationError]);

  // Helper component for protected routes
  const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" />;
  };

  return (
    <SocketProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<ProtectedRoute element={<Home />} />} />
        <Route path="/profile-step-1" element={<ProtectedRoute element={<ProfileStep1 />} />} />
        <Route path="/profile-step-2" element={<ProtectedRoute element={<ProfileStep2 />} />} />
        <Route path="/chat/:id" element={<ProtectedRoute element={<ChatPage />} />} />
        <Route path="/group/:id" element={<ProtectedRoute element={<GroupChatPage />} />} />
        <Route path="/account" element={<ProtectedRoute element={<AccountPage />} />} />
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/home" />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/termsofservice" element={<TermsOfServicePage />} />
        <Route path="/contactus" element={<ContactUsPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/groups" element={<ProtectedRoute element={<GroupsPage />} />} />
        <Route path="/directs" element={<ProtectedRoute element={<DirectsPage />} />} />
      </Routes>
      <PwaInstallPopup />
      <Toaster/>
    </SocketProvider>
  );
};

export default App;

