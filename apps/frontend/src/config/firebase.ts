import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
import { getAuth, signInAnonymously } from "firebase/auth";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCMDxcbz_1Ihae4UX8-f8hROk3w-mfFSN4",
    authDomain: "laso-7c446.firebaseapp.com",
    projectId: "laso-7c446",
    storageBucket: "laso-7c446.firebasestorage.app",
    messagingSenderId: "588390690955",
    appId: "1:588390690955:web:e7d5a5566ead05c898e48e",
    measurementId: "G-HZE8TTN10G"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
const auth = getAuth(app);

// VAPID key from your Firebase project settings
const vapidKey = "BOQsby4a9O0qOOoTWu6guXAMTtAKDgYGdR95gzCAyt-oZbzAi8cBfBoG4HDOqxlb3G6Kc84k4aE0xzKgJ1AgyyA";

// Request notification permission and get FCM Token
export const requestNotificationPermissionAndToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission not granted.');
      return null;
    }

    // Check if service worker is supported
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service Worker registered with scope:', registration.scope);
    } else {
      console.log('Service workers are not supported in this browser.');
      return null;
    }

    // Sign in anonymously to Firebase
    await signInAnonymously(auth);

    const token = await getToken(messaging, { vapidKey });
    
    if (token) {
      console.log("FCM Token:", token);
      return token;
    } else {
      console.log("No registration token available.");
      return null;
    }
  } catch (error) {
    console.error("Error requesting notification permission or getting FCM token:", error);
    if (error instanceof Error && error.message.includes('OAuth 2 access token')) {
      console.error("Firebase authentication failed. Please check your Firebase configuration.");
    }
    return null;
  }
};

// // Handle Foreground Messages
// onMessage(messaging, (payload) => {
//   console.log("Message received: ", payload);
//   // You can add custom notification handling here
// });

export { messaging };

