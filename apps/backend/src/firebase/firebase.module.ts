import * as admin from 'firebase-admin';
import { Module } from '@nestjs/common';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface FirebaseServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain: string;
}

@Module({
  providers: [
    {
      provide: 'FIREBASE_ADMIN',
      useFactory: async () => {
        
        
        const serviceAccount: FirebaseServiceAccount = {
          type: process.env.FIREBASE_TYPE,
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
          private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: process.env.CLIENT_ID,
          auth_uri: process.env.auth_uri,
          token_uri: process.env.token_uri,
          auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
          client_x509_cert_url: process.env.client_x509_cert_url,
          universe_domain:process.env.universe_domain
        };
        // Initialize Firebase Admin SDK
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        });

        return admin; // Firebase admin instance
      },
    },
  ],
  exports: ['FIREBASE_ADMIN'],
})
export class FirebaseModule {}
