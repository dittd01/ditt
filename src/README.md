# Ditt Demokrati - Secure Voting Platform

This is a Next.js project for a secure, anonymous voting platform named "Ditt Demokrati" (Your Democracy). It's designed with a strong emphasis on user privacy, security, and a great user experience, using a modern tech stack.

## Core Features & Security Model

This platform implements a high-assurance, privacy-preserving authentication system to enforce a "one person, one vote" policy without storing any personally identifiable information (PII) at rest.

### 1. High-Assurance Onboarding (First Login)
- **Method**: Users onboard for the first time using Norwegian **BankID**, a high-assurance electronic identity service.
- **Privacy by Design**: During the BankID OIDC flow, the user's age is verified transiently (must be ≥18). The national ID number (Fødselsnummer) is immediately used to compute a non-reversible `person_hash` and is then discarded.
- **No PII Storage**: The `person_hash`, computed as `HMAC_SHA256(KMS_PEPPER, normalize(Fnr))`, becomes the user's sole, anonymous identifier. No Fnr, date of birth, or name is ever stored in the database. The only stored attributes are booleans (e.g., `is_adult`), timestamps, and the assurance level.

### 2. Passwordless Logins with Passkeys (WebAuthn)
- **Seamless Re-authentication**: After the initial BankID verification, users are prompted to set up a **passkey** for their device using WebAuthn (Face ID, Windows Hello, fingerprint, etc.).
- **Zero Ongoing Cost**: All subsequent logins on that same device are handled using this passkey. This provides a fast, secure, and free user experience, completely avoiding per-login costs associated with BankID.
- **Device-Bound Security**: Passkeys are securely stored on the user's device, providing strong, phishing-resistant authentication.

### 3. Secure Multi-Device Linking via QR Code
- **User-Friendly Flow**: A user can link a new device (e.g., a laptop) by scanning a QR code from their already-verified primary device.
- **Cost-Aware Re-verification**: To securely bind the new device, the user must perform a quick re-verification. This flow defaults to the high-assurance BankID but can be feature-flagged to allow **Vipps Login** (a lower-cost OIDC provider in Norway) as an alternative.
- **Atomic Operation**: The linking process is managed via a short-lived, single-use challenge to prevent replay attacks. The new device's passkey is only linked to the user's `person_hash` after successful re-verification.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **UI**: React 18, Tailwind CSS, shadcn/ui
- **State Management**: React Hooks & Context
- **Validation**: Zod
- **Forms**: React Hook Form
- **AI**: Genkit for content moderation and generation

## Data Model (Firestore)

The data model is explicitly designed to avoid storing PII, using the `person_hash` as the key for all user-related data.

- `eligibility/{person_hash}`: Stores non-identifiable eligibility data.
  - `{ is_adult:boolean, assurance_level:string, createdAt, lastVerifiedAt, bankid_first_verified_at, deviceIds:string[], audit_flags?:string[] }`
- `devices/{deviceId}`: Contains information about a user's registered passkeys.
  - `{ person_hash, webauthn?:{credentialId, publicKey, signCount}, platform, createdAt, lastSeenAt, revoked:boolean }`
- `links/{link_id}`: Manages the state of a pending QR code device link.
  - `{ person_hash, nonce, status:'pending|confirmed|expired', expiresAt, createdAt }`

## Getting Started

### 1. Set Up Environment Variables
The application requires a secret "pepper" for securely hashing user identifiers. Create a file named `.env.local` in the root of your project and add the following line:

```env
# A long, random, secret string used for hashing.
# Keep this secret and do not commit it to version control.
PERSON_HASH_PEPPER='a-very-secret-and-long-random-string-for-development'
```
**Important**: For production, this value must be managed securely using a secret manager like Google Secret Manager or AWS Secrets Manager.

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Development Server
```bash
npm run dev
```
The application will now be running at [http://localhost:3000](http://localhost:3000).

## Firestore Security
The project includes a `firestore.rules` file that should be deployed to your Firebase project. These rules are configured to **deny all client-side access** to sensitive collections like `eligibility`, `devices`, and `links`. All interactions with these collections must go through trusted server-side code (e.g., Cloud Functions) using the Firebase Admin SDK.
