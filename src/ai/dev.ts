
import { config } from 'dotenv';
config();

import '@/ai/flows/moderate-voting-suggestions.ts';
import '@/ai/flows/curate-topic-suggestion.ts';
import '@/ai/flows/generate-avatar.ts';
import '@/ai/flows/generate-mock-user.ts';
import '@/ai/flows/populate-poll-flow.ts';
import '@/ai/flows/curate-argument.ts';
import '@/ai/flows/generate-rebuttal.ts';
import '@/ai/flows/simulate-debate-flow.ts';
import '@/ai/flows/generate-speech.ts';
