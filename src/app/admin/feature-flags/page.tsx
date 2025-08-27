
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getUser, hasRole } from '@/lib/auth';
import { listFlags, setFlag } from '@/lib/flagStore';
import { FLAG_DEFAULTS, type FlagDoc, type FlagKey } from '@/lib/flags';
import { revalidatePath } from 'next/cache';

import { PageHeader } from '@/components/admin/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, AlertTriangle } from 'lucide-react';

async function toggleFlag(formData: FormData) {
    'use server';
    const user = getUser();
    // This check is critical for security.
    if (!hasRole(user, ['admin'])) {
        console.error("Unauthorized attempt to toggle flag by", user?.email);
        return;
    }
    
    const key = formData.get('key') as FlagKey;
    const currentValue = formData.get('currentValue') === 'true';

    await setFlag(key, !currentValue, user!);
    
    // Invalidate the cache for this page to show the updated state.
    revalidatePath('/admin/feature-flags');
}

export default async function FeatureFlagsPage() {
  const user = getUser();
  const isReadOnly = !hasRole(user, ['admin']);

  const flags = await listFlags();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Feature Flags"
        subtitle="Enable, disable, and configure features in real-time."
      />

       <Table>
        <TableHeader>
            <TableRow>
                <TableHead>Feature Key</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rollout %</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {flags.map((flag) => {
              const isKillSwitch = flag.type === 'ops';
              return (
                 <TableRow key={flag.key}>
                    <TableCell className="font-mono flex items-center gap-2">
                      {isKillSwitch && <AlertTriangle className="h-4 w-4 text-destructive" />}
                      {flag.key}
                    </TableCell>
                    <TableCell>{flag.description}</TableCell>
                    <TableCell>
                        <form action={toggleFlag} className="flex items-center gap-2">
                            <input type="hidden" name="key" value={flag.key} />
                            <input type="hidden"name="currentValue" value={flag.value.toString()} />
                            <Switch 
                              type="submit" 
                              checked={flag.value} 
                              disabled={isReadOnly}
                              className={isKillSwitch && flag.value ? 'data-[state=checked]:bg-destructive' : ''}
                            />
                            <Badge variant={flag.value ? 'default' : 'secondary'}>{flag.value ? 'Enabled' : 'Disabled'}</Badge>
                        </form>
                    </TableCell>
                    <TableCell>100%</TableCell>
                    <TableCell>
                        <Button variant="ghost" size="icon">
                            <Edit />
                        </Button>
                    </TableCell>
                </TableRow>
              )
            })}
        </TableBody>
      </Table>
    </div>
  );
}
