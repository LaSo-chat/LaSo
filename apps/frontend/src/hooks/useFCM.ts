import { useEffect, useState } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../config/firebase'; // Ensure this path is correct
import { supabase } from '@/services/authService';

// Function to request notification permission and get FCM token
export const useFCM = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notificationError, setNotificationError] = useState<string | null>(null);

  useEffect(() => {
    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Notification permission granted.');

          const token = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
          });

          if (token) {
            console.log('FCM Token:', token);
            setFcmToken(token);
            localStorage.setItem("fcmToken", token);
            await sendFcmTokenToBackend(token);
          } else {
            throw new Error('No FCM token received');
          }
        } else {
          throw new Error('Notification permission denied');
        }
      } catch (error) {
        console.error('Error getting permission or FCM token:', error);
        setNotificationError(error instanceof Error ? error.message : 'Unknown error occurred');
      }
    };

    requestPermission();
  }, []);

  const sendFcmTokenToBackend = async (token: string) => {
    try {
      const { data: sessionData, error } = await supabase.auth.getSession();
  
      if (error || !sessionData.session) {
        throw new Error('Failed to retrieve session');
      }
  
      const backendUrl = import.meta.env.VITE_API_URL || 'https://laso.onrender.com';
  
      const payload = {
        fcmToken: token,
        title: 'Welcome!',
        body: 'You have successfully registered for notifications.',
      };
  
      const response = await fetch(`${backendUrl}/api/user/fcmToken`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        throw new Error('Failed to send token to backend');
      }
  
      console.log('Notification sent successfully to the backend.');
    } catch (error) {
      console.error('Error sending notification to backend:', error);
      setNotificationError(error instanceof Error ? error.message : 'Failed to send FCM token to backend');
    }
  };

  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground message received. ', payload);
      // Handle the notification (you can customize this part)
      if (payload.notification?.title && payload.notification?.body) {
        new Notification(payload.notification.title, {
          body: payload.notification.body,
          icon: payload.notification.icon || '/favicon.ico',
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { fcmToken, notificationError };
};

