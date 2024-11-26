importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCMDxcbz_1Ihae4UX8-f8hROk3w-mfFSN4",
  authDomain: "laso-7c446.firebaseapp.com",
  projectId: "laso-7c446",
  storageBucket: "laso-7c446.firebasestorage.app",
  messagingSenderId: "588390690955",
  appId: "1:588390690955:web:e7d5a5566ead05c898e48e",
  measurementId: "G-HZE8TTN10G"
});

const messaging = firebase.messaging();

// messaging.onBackgroundMessage(function(payload) {
//   console.log('[firebase-messaging-sw.js] Received background message ', payload);
//   // Customize notification here
//   const notificationTitle = 'Background Message Title';
//   const notificationOptions = {
//     body: 'Background Message body.',
//     icon: '/firebase-logo.png'
//   };

//   self.registration.showNotification(notificationTitle, notificationOptions);
// });

