
/**
 * @fileoverview Server-side authentication utilities.
 * This file contains functions for hashing, key management, and other security operations
 * that should only run on the server. It should never be imported into client-side code.
 */
import { createHmac } from 'crypto';

// In a real application, this would be loaded securely from a secret manager (e.g., Google Secret Manager)
// and not hardcoded. This is a placeholder for the KMS-managed pepper.
const KMS_PEPPER = process.env.PERSON_HASH_PEPPER || 'a-very-secret-pepper-for-development';

if (process.env.NODE_ENV === 'production' && KMS_PEPPER === 'a-very-secret-pepper-for-development') {
    console.warn('WARNING: Using default development pepper in production. This is insecure. Please set PERSON_HASH_PEPPER.');
}

/**
 * Normalizes a Norwegian Fødselsnummer (Fnr) by removing non-digit characters.
 * @param fnr The Fødselsnummer to normalize.
 * @returns The normalized Fnr consisting only of digits.
 */
function normalizeFnr(fnr: string): string {
    return fnr.replace(/\D/g, '');
}

/**
 * Computes a secure, peppered hash of a user's Fødselsnummer (Fnr).
 * This hash is used as the primary, privacy-preserving identifier for a person.
 * 
 * @param fnr The user's Fødselsnummer.
 * @returns A hex-encoded HMAC-SHA256 hash.
 */
export function computePersonHash(fnr: string): string {
    const normalized = normalizeFnr(fnr);
    const hmac = createHmac('sha256', KMS_PEPPER);
    hmac.update(normalized);
    return hmac.digest('hex');
}

/**
 * Derives the user's age from their Fødselsnummer.
 * This function handles both standard Fnr and D-numbers.
 * Note: This is a simplified implementation for demonstration. A production
 * system should use a robust, well-tested library for Fnr parsing.
 * 
 * @param fnr The user's Fødselsnummer.
 * @returns The user's age in years.
 */
export function deriveAgeFromFnr(fnr: string): number {
    const normalized = normalizeFnr(fnr);
    if (normalized.length !== 11) {
        throw new Error('Invalid Fnr length.');
    }

    let day = parseInt(normalized.substring(0, 2), 10);
    // Adjust for D-number
    if (day > 40) {
        day -= 40;
    }

    const month = parseInt(normalized.substring(2, 4), 10);
    let year = parseInt(normalized.substring(4, 6), 10);
    const individnummer = parseInt(normalized.substring(6, 9), 10);

    // Determine century
    if (individnummer >= 500 && individnummer <= 749 && year >= 55 && year <= 99) {
        year += 1800;
    } else if (individnummer >= 0 && individnummer <= 499) {
        year += 1900;
    } else if (individnummer >= 900 && individnummer <= 999 && year >= 40 && year <= 99) {
        year += 1900;
    } else {
        year += 2000;
    }

    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}
