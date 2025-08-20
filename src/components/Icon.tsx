
'use client';

import * as icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface IconProps extends LucideProps {
  name: string;
}

export function Icon({ name, ...props }: IconProps) {
  const LucideIcon = (icons as any)[name];

  if (!LucideIcon) {
    // You can render a fallback icon or null
    return null;
  }

  return <LucideIcon {...props} />;
}
