
import { z } from 'zod';
export const FlagsSchema = z.object({
  webVitals: z.boolean().default(false),
  newHeader: z.boolean().default(false),
});
export type Flags = z.infer<typeof FlagsSchema>;
