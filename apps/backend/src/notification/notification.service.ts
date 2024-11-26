import { Injectable, Inject } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationService {
  constructor(@Inject('FIREBASE_ADMIN') private firebaseApp: admin.app.App) {}

  // Existing sendNotification method
  async sendNotification(deviceToken: string, title: string, body: string): Promise<void> {
    const message = {
      notification: { title, body },
      token: deviceToken,
    };

    try {
      const response = await this.firebaseApp.messaging().send(message);
      console.log('Notification sent successfully:', response);
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  // New sendFCM method for sending notifications via FCM
  async sendFCM(fcmPayload: { token: string; title: string; body: string; data?: any }): Promise<void> {
    const { token, title, body, data } = fcmPayload;
    const message = {
      notification: { title, body },
      token,
      data, // Optional custom data
    };

    try {
      const response = await this.firebaseApp.messaging().send(message);
      console.log('FCM notification sent successfully:', response);
    } catch (error) {
      console.error('Error sending FCM notification:', error);
      throw error;
    }
  }
}
