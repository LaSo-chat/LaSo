import * as path from 'path';
import * as admin from 'firebase-admin';
import { Module } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

// Load environment variables
dotenv.config();

@Module({
  providers: [
    {
      provide: 'FIREBASE_ADMIN',
      useFactory: async () => {
        const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
        console.log('Service Account Path:', serviceAccountPath); // Log the path
        try {
          const fileContents = fs.readFileSync(serviceAccountPath, 'utf8');
          console.log('Raw File Contents:', fileContents);
          
          const serviceAccount = JSON.parse(fileContents);
          console.log('Parsed Service Account:', serviceAccount);
          
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });

          return admin;
        } catch (error) {
          console.error('Error reading/parsing service account:', error);
          throw error;
        }
      },
    },
  ],
  exports: ['FIREBASE_ADMIN'],
})
export class FirebaseModule {}
