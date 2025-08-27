
/**
 * @fileoverview A placeholder authentication adapter. In a real application, this
 * would be replaced with your actual authentication provider (e.g., NextAuth.js, Clerk, etc.).
 * It defines a standard User shape and provides helper functions for role-based access control.
 */

import { currentUser } from '@/lib/user-data';

// Why: Defines a consistent User object shape that the application can rely on.
// The roles array is critical for implementing role-based access control (RBAC).
export type User = {
    id: string;
    email: string;
    roles: ('admin' | 'staff' | 'beta' | 'user')[];
}

/**
 * A placeholder function to get the current user.
 * In a real app, this would get the user from the session or an API call.
 * NOTE: For this prototype, it returns a hardcoded admin user for demonstration purposes.
 * @returns {User | null} The current user object or null if not logged in.
 */
export function getUser(): User | null {
  // In a real implementation, you would replace this with your auth provider's method
  // for getting the current session user, e.g., `await auth()` from NextAuth.js.
  return {
    id: currentUser.uid,
    email: `${currentUser.username}@example.com`,
    roles: ['admin'] // Hardcoded as admin for this prototype
  };
}

/**
 * A helper function to check if a user has at least one of the specified roles.
 * @param {User | null} user - The user object.
 * @param {User['roles']} requiredRoles - An array of roles to check for.
 * @returns {boolean} True if the user has at least one of the required roles.
 */
export function hasRole(user: User | null, requiredRoles: User['roles']): boolean {
    if (!user) {
        return false;
    }
    // Why: Using a Set provides a minor performance improvement for the lookup, but more importantly,
    // it makes the logic cleaner and easier to read than a nested loop or `Array.prototype.some`.
    const userRoles = new Set(user.roles);
    return requiredRoles.some(role => userRoles.has(role));
}
