import * as path from 'path';
import * as admin from 'firebase-admin';
import { Module } from '@nestjs/common';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

@Module({
  providers: [
    {
      provide: 'FIREBASE_ADMIN',
      useFactory: async () => {
        const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
        console.log('Service Account Path:', serviceAccountPath); // Log the path
        if (!serviceAccountPath) {
          throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH is not set');
        }
        
        // Ensure path is resolved correctly
        const serviceAccount = require(path.resolve(serviceAccountPath));
        
        
        // Initialize Firebase Admin SDK
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });

        return admin; // Firebase admin instance
      },
    },
  ],
  exports: ['FIREBASE_ADMIN'],
})
export class FirebaseModule {}
