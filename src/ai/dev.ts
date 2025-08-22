
import { config } from 'dotenv';
config();

import '@/ai/flows/moderate-voting-suggestions.ts';
import '@/ai/flows/curate-topic-suggestion.ts';
import '@/ai/flows/generate-avatar.ts';
import '@/ai/flows/generate-mock-user.ts';
import '@/ai/flows/populate-poll-flow.ts';
