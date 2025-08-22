# Ditt Demokrati - Secure Voting Platform

This is a Next.js project for a secure, anonymous voting platform named "Ditt Demokrati" (Your Democracy). It's designed with a strong emphasis on user privacy, security, and a great user experience, using a modern tech stack.

## Core Features & Security Model

This platform implements a high-assurance, privacy-preserving authentication system to enforce a "one person, one vote" policy without storing any personally identifiable information (PII) at rest.

- **High-Assurance Onboarding**: The first time a user logs in, their identity is verified using a high-assurance method like BankID. During this process, their age is checked, but their national ID number (Fnr) is never stored. Instead, we compute a non-reversible `person_hash` using a secret pepper. This hash becomes the user's anonymous identifier.

- **Passwordless Logins with Passkeys**: After the initial verification, users are prompted to set up a passkey (using WebAuthn). This allows them to log in on the same device using biometrics (Face ID, fingerprint, etc.), providing a seamless and secure experience without per-login costs.

- **Secure Multi-Device Linking**: Users can link additional devices (e.g., a laptop) by scanning a QR code from an already-verified device. This flow requires a quick re-verification (using Vipps or BankID) to ensure the user is authorized to add a new device, maintaining the security of their account.

- **Privacy by Design**: The system is architected so that no PII (like name, date of birth, or Fnr) is ever stored in the database. All user data is keyed to the anonymous `person_hash`.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **UI**: React 18, Tailwind CSS, shadcn/ui
- **State Management**: React Hooks & Context
- **Validation**: Zod
- **Forms**: React Hook Form
- **AI**: Genkit for content moderation and generation

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### 1. Set Up Environment Variables

The application requires a secret "pepper" for securely hashing user identifiers. Create a file named `.env.local` in the root of your project and add the following line:

```env
# A long, random, secret string used for hashing.
# Keep this secret and do not commit it to version control.
PERSON_HASH_PEPPER='a-very-secret-and-long-random-string-for-development'
```

**Important**: For production, this value should be managed securely using a secret manager like Google Secret Manager or AWS Secrets Manager.

### 2. Install Dependencies

Open your terminal in the project root and run:

```bash
npm install
```

### 3. Run the Development Server

Once the dependencies are installed, you can start the Next.js development server:

```bash
npm run dev
```

The application will now be running at [http://localhost:3000](http://localhost:3000).

## Firestore Security

The project includes a `firestore.rules` file that should be deployed to your Firebase project. These rules are configured to **deny all client-side access** to sensitive collections like `eligibility`, `devices`, and `links`. All interactions with these collections must go through trusted server-side code (e.g., Cloud Functions) using the Firebase Admin SDK.
