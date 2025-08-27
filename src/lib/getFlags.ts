
/**
 * @fileoverview This file provides a high-level, app-friendly way to access feature flags.
 * It abstracts away the raw data structure from Firestore and includes logic for handling
 * permission-based flags that depend on the current user's roles.
 */
import 'server-only';
import { listFlags } from './flagStore';
import { hasRole, type User } from './auth';

// Why: Defines a simple, clean key-value map for flags, which is easier for
// UI components and other application logic to consume than the full FlagDoc array.
export type AppFlags = Record<string, boolean>;

/**
 * Fetches all feature flags and evaluates them for the given user.
 * This is the primary function the application should use to check flag states.
 *
 * @param {User | null} user - The current user object, used to evaluate permission-based flags.
 * @returns {Promise<AppFlags>} A promise that resolves to a key-value map of evaluated flag states.
 */
export async function getFlags(user: User | null): Promise<AppFlags> {
    const rawFlags = await listFlags();
    const appFlags: AppFlags = {};

    for (const flag of rawFlags) {
        // Default evaluation is just the flag's boolean value.
        let evaluatedValue = flag.value;

        // Why: Special handling for 'permission' flags. This is where we implement the logic
        // that a permission flag is only true if its stored value is true AND the user
        // has the required role.
        if (flag.type === 'permission') {
            if (flag.key === 'perm.betaArea') {
                // The flag is only truly enabled if its value is true AND the user has the 'beta' role.
                evaluatedValue = flag.value && hasRole(user, ['beta']);
            }
            // Add other permission flags here...
        }
        
        // Why: Replace dots with underscores in the key for easier access in some contexts
        // (e.g., as CSS data attributes or in systems that don't handle dots well).
        const appKey = flag.key.replace(/\./g, '_');
        appFlags[appKey] = evaluatedValue;
    }

    return appFlags;
}
