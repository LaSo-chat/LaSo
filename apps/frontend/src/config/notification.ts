import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from './firebase'; // Ensure this path is correct
import { toast } from 'react-hot-toast';
import { socketService } from '@/services/socketService';

interface FCMResult {
  fcmToken: string | null;
  notificationError: string | null;
}

export const initializeFCM = async (): Promise<FCMResult> => {
  let fcmToken: string | null = null;
  let notificationError: string | null = null;

  try {
    let permission = Notification.permission;

    // If permission is not granted, request it
    if (permission === 'default' || permission === 'denied') {
      permission = await Notification.requestPermission();
    }

    // Handle permission results
    if (permission === 'granted') {
      console.log('Notification permission granted.');

      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });

      if (token) {
        console.log('FCM Token:', token);
        fcmToken = token;
        // await sendFcmTokenToBackend(token);
      } else {
        throw new Error('No FCM token received');
      }
    } else if (permission === 'denied') {
      // Inform the user and provide retry instructions
      notificationError = 'Notification permission denied. Please enable it in your browser settings.';
      alert('Notifications are disabled. Please enable them in your browser settings and refresh.');
    } else {
      throw new Error('Notification permission request was dismissed or unknown.');
    }
  } catch (error) {
    console.error('Error getting permission or FCM token:', error);
    notificationError = error instanceof Error ? error.message : 'Unknown error occurred';
  }

  // Set up foreground message handler
  onMessage(messaging, (payload) => {
    console.log('Foreground message received. ', payload);
    if (payload.notification?.title && payload.notification?.body) {
      new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: payload.notification.icon || '/favicon.ico',
      });
    }
  });

  return { fcmToken, notificationError };
};


// const sendFcmTokenToBackend = async (token: string): Promise<void> => {
//   try {
//     const { data: sessionData, error } = await supabase.auth.getSession();

//     if (error || !sessionData.session) {
//       throw new Error('Failed to retrieve session');
//     }

//     const backendUrl = import.meta.env.VITE_API_URL || 'https://laso.onrender.com';

//     const payload = {
//       deviceToken: token,
//       title: 'Welcome!',
//       body: 'You have successfully registered for notifications.',
//     };

//     const response = await fetch(`${backendUrl}/api/notification/send`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${sessionData.session.access_token}`,
//       },
//       body: JSON.stringify(payload),
//     });

//     if (!response.ok) {
//       throw new Error('Failed to send token to backend');
//     }

//     console.log('Notification sent successfully to the backend.');
//   } catch (error) {
//     console.error('Error sending notification to backend:', error);
//     throw error; // Re-throw the error to be handled by the caller
//   }
// };

export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

export const initializeNotifications = async (): Promise<void> => {
  try {
    // Initialize FCM
    await initializeFCM();

     // Initialize socket connection
     const socket = await socketService.connect();

     if (!socket) {
       console.error('Failed to connect to socket');
       return;
     }
 
     // Set up socket notification handling
     socket.on('notification', (message) => {
       console.log('Direct notification received:', message);
       toast(`New direct message: ${message.data.messageWithTranslation.content}`, {
         duration: 5000,
         position: 'top-center',
         icon: '🔔',
       });
     });
 
     socket.on('group_notification', (groupMessage) => {
       console.log('Group notification received:', groupMessage);
       toast(`New group message from ${groupMessage.data.group.name}: ${groupMessage.data.messageWithTranslations.content}`, {
         duration: 5000,
         position: 'top-center',
         icon: '👥',
       });
     });

  } catch (error) {
    console.error('Error initializing notifications:', error);
  }
};
