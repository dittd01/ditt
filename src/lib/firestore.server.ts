
import admin from 'firebase-admin';
import { App, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let isMock = false;

const getFirebaseAdminApp = (): App => {
    // Why: In serverless environments, multiple initializations can occur.
    // We check if any apps exist. If so, we try to get the default app.
    // If that fails (which is what's causing the user's error), we know
    // an app exists but isn't the default, so we create a new, uniquely named one.
    if (getApps().length > 0) {
        try {
            return getApp();
        } catch (e) {
            // A non-default app likely exists. Create a new one.
            const appName = `firebase-admin-app-${Date.now()}`;
            console.log(`Default app not found, creating new app: ${appName}`);
            return initializeApp(getCredentials(), appName);
        }
    }

    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountKey) {
        console.warn(`
        ================================================================
        WARNING: FIREBASE_SERVICE_ACCOUNT_KEY is not set.
        The application is running in MOCK MODE.
        Firestore data will not be available.
        To connect to Firebase, set the key in your .env.local file.
        ================================================================
        `);
        isMock = true;
        // Return a mock app to prevent crashes.
        return initializeApp({ projectId: 'mock-project' });
    }

    return initializeApp(getCredentials());
};

function getCredentials() {
    try {
        const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY!;
        const credentials = JSON.parse(serviceAccountKey);
        return {
            credential: admin.credential.cert(credentials),
        };
    } catch (e) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Make sure it's a valid JSON string.", e);
        console.warn('Falling back to MOCK MODE due to invalid credentials.');
        isMock = true;
        // Return mock credentials to prevent a hard crash.
        return { projectId: 'mock-project-error' };
    }
}

export const adminApp = getFirebaseAdminApp();
export const db = getFirestore(adminApp);

export function isFirestoreMock(): boolean {
    return isMock;
}
