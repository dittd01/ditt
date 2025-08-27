
'use server';
/**
 * @fileoverview This file is the data layer for the feature flag system. It handles all
 * interactions with Firestore, including reading flags, seeding default values, and writing
 * updates with an atomic audit trail. It is designed to be resilient and fail-closed.
 */
import 'server-only'; // Ensures this module is never imported into a client component.

import { db, isFirestoreMock } from './firestore.server';
import { FieldValue } from 'firebase-admin/firestore';
import { FLAG_DEFAULTS, FlagKeySchema, type FlagDoc, type FlagKey } from './flags';
import type { User } from './auth';

const FLAGS_COLLECTION = 'flags';
const AUDIT_COLLECTION = 'flag_audits';

/**
 * Idempotently seeds the default flags into Firestore if they don't already exist.
 * This ensures that on first run or after a data wipe, the system has a known good state.
 * @param {FirebaseFirestore.Firestore} dbInstance - The Firestore instance.
 */
async function seedDefaultFlags(dbInstance: FirebaseFirestore.Firestore) {
    console.log('[FlagStore] Seeding default flags...');
    const batch = dbInstance.batch();
    const flagsRef = dbInstance.collection(FLAGS_COLLECTION);
    
    for (const key in FLAG_DEFAULTS) {
        const flagKey = key as FlagKey;
        const flagRef = flagsRef.doc(flagKey);
        const defaultValue = FLAG_DEFAULTS[flagKey];
        
        // Why: We create the document with a default value only. The 'set' with 'merge: true'
        // is an idempotent operation. If the document exists, it does nothing. If it doesn't,
        // it creates it with these values.
        batch.set(flagRef, {
            key: flagKey,
            value: defaultValue.value,
            type: defaultValue.type,
            description: defaultValue.description,
            updatedAt: FieldValue.serverTimestamp(),
            updatedBy: 'system@initial-seed'
        }, { merge: true });
    }
    await batch.commit();
    console.log('[FlagStore] Default flags seeded.');
}

/**
 * Creates a default, offline version of the flags.
 * @returns {FlagDoc[]} An array of flag documents with default values.
 */
function getOfflineFlags(reason: string): FlagDoc[] {
     return Object.entries(FLAG_DEFAULTS).map(([key, def]) => ({
        key,
        value: def.value,
        type: def.type,
        description: `(${reason}) ${def.description}`,
        updatedAt: new Date(),
        updatedBy: 'system@offline',
    } as FlagDoc));
}


/**
 * Fetches all feature flags from Firestore. If the collection is empty, it seeds the defaults.
 * Implements a fail-closed mechanism: if Firestore is unreachable, it returns all default flags as OFF.
 * @returns {Promise<FlagDoc[]>} A promise that resolves to an array of flag documents.
 */
export async function listFlags(): Promise<FlagDoc[]> {
    // Why: If Firestore is in mock mode, we don't even attempt a network call.
    // We immediately return the default values, ensuring the app remains responsive
    // during local development without a database connection.
    if (await isFirestoreMock()) {
        return getOfflineFlags('MOCK');
    }

    try {
        const flagsRef = db.collection(FLAGS_COLLECTION);
        const snapshot = await flagsRef.get();

        if (snapshot.empty) {
            await seedDefaultFlags(db);
            // Re-fetch after seeding
            const newSnapshot = await flagsRef.get();
            return newSnapshot.docs.map(doc => doc.data() as FlagDoc);
        }

        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                // Why: Firestore timestamps need to be converted to JS Date objects for serialization.
                updatedAt: data.updatedAt.toDate(),
            } as FlagDoc;
        });

    } catch (error) {
        console.error('[FlagStore] CRITICAL: Failed to read flags from Firestore. Failing closed.', error);
        // Why: Fail-closed is a critical safety feature. If we can't reach the flag database,
        // we assume all features are OFF to prevent accidentally enabling a feature that
        // should be disabled.
        return getOfflineFlags('FAIL-CLOSED');
    }
}

/**
 * Sets the value of a specific feature flag and writes an audit log entry in a single atomic transaction.
 * @param {FlagKey} key - The key of the flag to update.
 * @param {boolean} newValue - The new boolean value for the flag.
 * @param {User} actor - The user performing the action.
 * @returns {Promise<{success: boolean, error?: string}>} An object indicating the outcome.
 */
export async function setFlag(key: FlagKey, newValue: boolean, actor: User): Promise<{success: boolean, error?: string}> {
    if (await isFirestoreMock()) {
        console.warn(`[FlagStore] MOCK MODE: Not setting flag '${key}'.`);
        return { success: false, error: 'Cannot set flag in mock mode.' };
    }
    
    const flagRef = db.collection(FLAGS_COLLECTION).doc(key);
    const auditRef = db.collection(AUDIT_COLLECTION).doc();

    try {
        await db.runTransaction(async (transaction) => {
            const flagDoc = await transaction.get(flagRef);
            if (!flagDoc.exists) {
                throw new Error(`Flag "${key}" does not exist in the database.`);
            }
            const oldData = flagDoc.data() as FlagDoc;
            const oldValue = oldData.value;
            
            // Why: An atomic batch write ensures that the flag is never updated WITHOUT
            // a corresponding audit log entry. This is non-negotiable for a secure system.
            transaction.update(flagRef, {
                value: newValue,
                updatedAt: FieldValue.serverTimestamp(),
                updatedBy: actor.email
            });
            
            transaction.set(auditRef, {
                flagKey: key,
                oldValue,
                newValue,
                at: FieldValue.serverTimestamp(),
                by: actor.email,
            });
        });
        
        console.log(`[FlagStore] Flag '${key}' set to '${newValue}' by '${actor.email}'.`);
        return { success: true };

    } catch (error: any) {
        console.error(`[FlagStore] FAILED to set flag '${key}':`, error);
        return { success: false, error: error.message };
    }
}

/**
 * Lists the most recent audit log entries.
 * @param {number} limit - The maximum number of audit entries to return.
 * @returns {Promise<AuditDoc[]>} A promise that resolves to an array of audit documents.
 */
export async function listAudits(limit = 50): Promise<AuditDoc[]> {
     if (await isFirestoreMock()) {
        return [];
    }
    try {
        const auditRef = db.collection(AUDIT_COLLECTION);
        const snapshot = await auditRef.orderBy('at', 'desc').limit(limit).get();
        
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                at: data.at.toDate(), // Convert Firestore Timestamp to JS Date
            } as AuditDoc;
        });

    } catch (error) {
        console.error('[FlagStore] Failed to read audit logs:', error);
        return []; // Return empty on error, as audit logs are non-critical for UI rendering.
    }
}
