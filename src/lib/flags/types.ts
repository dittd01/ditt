
import { z } from 'zod';
export const FlagsSchema = z.object({
  webVitals: z.boolean().default(false),
  newHeader: z.boolean().default(false),
  debateVisualization: z.boolean().default(true),
});
export type Flags = z.infer<typeof FlagsSchema>;
