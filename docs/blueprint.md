# **App Name**: Valg匿名

## Core Features:

- BankID Authentication: Secure user authentication using Norwegian BankID, ensuring only eligible voters can access the system. Integrates with BankID APIs for a seamless login experience.
- Anonymization: After BankID login, generate a unique, anonymous voter ID, which will be used for the rest of the session. Ensures that votes are unlinkable to real identities. One BankID = One anonymous ID.
- Anonymous Ballot: Presents the voter with the ballot (list of candidates or referendum options). The UI will prevent display of personal information. This feature relies on prior completion of the 'BankID Authentication' and 'Anonymization' steps.
- Client-Side Encryption: Encrypt vote selection on the client side (in the browser) before transmission. The backend will not be able to discern any actual data regarding the selection.
- User Suggestions with AI Moderation: Allow voters to add their own voting suggestions or options. Use a LLM-powered moderation tool to maintain suggestion quality and avoid abuse.
- Vote Modification (Revoting): Allow voters to change their vote within the voting period to counteract coercion. A new encrypted vote will replace the old one. Revoting requires re-authentication with BankID. Session handling prevents a user from being simultaneously logged in from multiple devices.
- Anonymous System Auditing: System should generate a summary dashboard containing only election totals and metrics that do not in any way risk leaking authentication.
- Homepage (Polymarket-style Layout): Grid of voting topics displayed as interactive tiles. Each tile shows: Topic question, Live Yes/No percentages or multi-option results, Vote count/volume, Click-through to detail view. Topic Detail Page — Displays historical vote trend chart (1H, 1D, 1W, 1M filters), current tally, and “Revote” option if user already voted. Allows contextual info and comments.

## Style Guidelines:

- Primary color: HSL(220, 50%, 60%) -> RGB(#4A7DB3), a calming, trustworthy blue.
- Background color: HSL(220, 20%, 95%) -> RGB(#F0F2F5), a light, desaturated blue providing a clean backdrop.
- Accent color: HSL(190, 60%, 50%) -> RGB(#2BBFBC), a contrasting cyan to highlight key actions.
- Body and headline font: 'Inter', a grotesque-style sans-serif for a modern and neutral look.
- Use simple, clear icons to represent voting options and actions.
- A clean and intuitive layout, prioritizing ease of navigation and readability.
- Subtle animations for a smooth and engaging user experience.