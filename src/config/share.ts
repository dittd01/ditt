
import type { TargetId } from '@/lib/share/schema';

export const PRIMARY_TARGETS_NB_NO: TargetId[] = [
  'whatsapp',
  'sms',
  'facebook',
  'linkedin',
];

export const PRIMARY_TARGETS_EN: TargetId[] = [
  'whatsapp',
  'x',
  'linkedin',
  'reddit',
];

export const DEFAULT_UTM = {
  medium: 'share',
};

// --- Feature Flags ---
// Set these to true to enable the corresponding share targets.
// They are kept separate to allow for easy configuration via environment variables in a real app.

export const SHARE_ENABLE_POCKET = true;
export const SHARE_ENABLE_SLACK = false;
export const SHARE_ENABLE_TEAMS = false;
export const SHARE_ENABLE_DISCORD = false;
export const SHARE_ADD_UTM_DEFAULTS = true;
export const SHARE_ALLOW_EMBED = true;
