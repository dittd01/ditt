
import admin from 'firebase-admin';
import { App, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Why: A global variable to track if we are in mock mode.
// This prevents repeated error messages and allows other parts of the app
// to gracefully handle the absence of a live database connection.
let isMock = false;

const getFirebaseAdminApp = (): App => {
    if (getApps().length > 0) {
        return getApp();
    }
    
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    // Why: Check if the service account key is missing. If so, we enter mock mode.
    // This makes local development much smoother, as developers don't need to
    // set up Firebase credentials just to run the UI.
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
        // Why: We still need to initialize a mock app to prevent other parts
        // of the code that import 'db' from crashing.
        return initializeApp({ projectId: 'mock-project' }, 'mock-app');
    }

    try {
        const credentials = JSON.parse(serviceAccountKey);
        return initializeApp({
            credential: admin.credential.cert(credentials),
        });
    } catch(e) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Make sure it's a valid JSON string.", e);
        // Why: If parsing fails, we also fall back to mock mode. This prevents
        // a crash loop if the environment variable is set but malformed.
        console.warn('Falling back to MOCK MODE due to invalid credentials.');
        isMock = true;
        return initializeApp({ projectId: 'mock-project-error' }, 'mock-app-error');
    }
}

export const adminApp = getFirebaseAdminApp();
// Why: Export the 'db' instance, which will be either the real Firestore instance
// or the mock one, allowing components to use it without knowing the mode.
export const db = getFirestore(adminApp);

// Why: Exporting a function to check the mode allows other server modules
// (like the flagStore) to adapt their behavior accordingly.
export function isFirestoreMock(): boolean {
    return isMock;
}
