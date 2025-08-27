
/**
 * @fileoverview This file defines the core data structures and default values for the feature flag system.
 * It serves as the single source of truth for what flags exist and their default characteristics.
 * This centralized approach makes it easy to add, remove, or modify flags across the entire application.
 */

import { z } from 'zod';

// Why: Defines the valid types for a feature flag. This ensures type safety and prevents
// invalid flag types from being created. Using a Zod enum makes it easy to parse and validate.
export const FlagTypeSchema = z.enum(['feature', 'ops', 'experiment', 'permission']);
export type FlagType = z.infer<typeof FlagTypeSchema>;

// Why: A Zod schema for the Firestore document. This ensures that any data read from or written to
// Firestore matches the expected shape, preventing data corruption and runtime errors.
export const FlagDocSchema = z.object({
  key: z.string(),
  value: z.boolean(),
  type: FlagTypeSchema,
  description: z.string(),
  updatedAt: z.date(),
  updatedBy: z.string().email(),
});
export type FlagDoc = z.infer<typeof FlagDocSchema>;

// Why: Defines the shape of an audit log entry. This is crucial for maintaining a reliable
// and queryable history of all changes made to the flags.
export const AuditDocSchema = z.object({
    flagKey: z.string(),
    oldValue: z.boolean(),
    newValue: z.boolean(),
    at: z.date(),
    by: z.string().email(),
});
export type AuditDoc = z.infer<typeof AuditDocSchema>;


// Why: Defining the flag keys as a Zod enum provides compile-time safety.
// It prevents typos when accessing flags and allows for autocompletion in IDEs.
export const FlagKeySchema = z.enum([
    'feature.newCheckout',
    'ops.disablePayments',
    'exp.navV2',
    'perm.betaArea',
]);
export type FlagKey = z.infer<typeof FlagKeySchema>;

// Why: A type that maps the FlagKey enum to the FlagDoc shape. This provides a clear
// and maintainable way to define the default state and metadata for each flag.
export type FlagDefaults = Record<FlagKey, Omit<FlagDoc, 'key' | 'updatedAt' | 'updatedBy'>>;

// Why: This is the single source of truth for all feature flags in the system.
// Seeding the database from this constant ensures consistency across all environments.
// Descriptions are critical for making the Ops Console understandable for non-developers.
export const FLAG_DEFAULTS: FlagDefaults = {
    'feature.newCheckout': {
        value: false,
        type: 'feature',
        description: 'Enables the new, streamlined checkout experience for all users.',
    },
    'ops.disablePayments': {
        value: false,
        type: 'ops',
        description: 'Kill-switch: Immediately disables all payment processing systems. USE WITH CAUTION.',
    },
    'exp.navV2': {
        value: true,
        type: 'experiment',
        description: 'Routes 50% of traffic to the new V2 navigation bar for A/B testing.',
    },
    'perm.betaArea': {
        value: false,
        type: 'permission',
        description: 'Grants access to the beta features section for users with the "beta" role.',
    },
};
