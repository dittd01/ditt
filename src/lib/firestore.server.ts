
import admin from 'firebase-admin';
import { App, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const getFirebaseAdminApp = (): App => {
    if (getApps().length > 0) {
        return getApp();
    }
    
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
        throw new Error('The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Please add it to your .env.local file.');
    }

    try {
        const credentials = JSON.parse(serviceAccountKey);
        return initializeApp({
            credential: admin.credential.cert(credentials),
        });
    } catch(e) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Make sure it's a valid JSON string.", e);
        throw new Error("Could not initialize Firebase Admin SDK.");
    }
}

export const adminApp = getFirebaseAdminApp();
export const db = getFirestore(adminApp);
