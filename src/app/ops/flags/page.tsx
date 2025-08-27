
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getUser, hasRole } from '@/lib/auth';
import { listFlags, listAudits, setFlag } from '@/lib/flagStore';
import { FLAG_DEFAULTS, type FlagDoc, type FlagKey, type AuditDoc } from '@/lib/flags';
import { revalidatePath } from 'next/cache';

import { PageHeader } from '@/components/admin/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { AlertTriangle, PlusCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type CategorizedFlags = {
    feature: FlagDoc[];
    ops: FlagDoc[];
    experiment: FlagDoc[];
    permission: FlagDoc[];
}

function FlagRow({ flag, isReadOnly }: { flag: FlagDoc, isReadOnly: boolean }) {
    // Server action to toggle the flag's value.
    async function toggleFlag(formData: FormData) {
        'use server';
        const user = getUser();
        if (!hasRole(user, ['admin'])) {
            // This is a redundant check for security. Middleware should prevent this.
            console.error("Unauthorized attempt to toggle flag by", user?.email);
            return;
        }
        
        const key = formData.get('key') as FlagKey;
        const currentValue = formData.get('currentValue') === 'true';

        await setFlag(key, !currentValue, user!);
        
        // Why: revalidatePath is crucial for Server Components. It tells Next.js to
        // invalidate the cache for this page, forcing a re-fetch of data and a re-render
        // with the updated flag state.
        revalidatePath('/ops/flags');
    }
    
    // Why: Special UI treatment for "ops" flags. These are often kill-switches,
    // so they need to be visually distinct and potentially have extra confirmation steps.
    const isKillSwitch = flag.type === 'ops';

    return (
        <div className="flex items-center justify-between space-x-4 border-b p-4 last:border-b-0">
            <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none flex items-center gap-2">
                    {isKillSwitch && <AlertTriangle className="h-4 w-4 text-destructive" />}
                    {flag.key}
                </p>
                <p className="text-sm text-muted-foreground">{flag.description}</p>
                 <p className="text-xs text-muted-foreground pt-1">
                    Last updated {formatDistanceToNow(flag.updatedAt, { addSuffix: true })} by {flag.updatedBy}
                </p>
            </div>
            <form action={toggleFlag}>
                <input type="hidden" name="key" value={flag.key} />
                <input type="hidden"name="currentValue" value={flag.value.toString()} />
                <Switch
                    type="submit"
                    checked={flag.value}
                    disabled={isReadOnly}
                    aria-label={`Toggle flag ${flag.key}`}
                    className={isKillSwitch && flag.value ? 'data-[state=checked]:bg-destructive' : ''}
                />
            </form>
        </div>
    );
}


export default async function FeatureFlagsPage() {
    const user = getUser();
    const isReadOnly = !hasRole(user, ['admin']);

    // Fetch flags and audits in parallel for performance.
    const [flags, audits] = await Promise.all([
        listFlags(),
        listAudits(50),
    ]);

    // Why: Categorizing flags makes the UI much easier to scan and understand.
    // Grouping by type (feature, ops, etc.) is a standard and effective pattern.
    const categorizedFlags = flags.reduce((acc, flag) => {
        acc[flag.type].push(flag);
        return acc;
    }, { feature: [], ops: [], experiment: [], permission: [] } as CategorizedFlags);


    return (
        <div className="space-y-8">
            <PageHeader
                title="Feature Flags"
                subtitle="Manage system features and operational switches in real-time."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                     {Object.entries(categorizedFlags).map(([type, flagsOfType]) => (
                        <Card key={type}>
                            <CardHeader>
                                <CardTitle className="capitalize">{type} Flags</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {flagsOfType.length > 0 ? (
                                    flagsOfType.map(flag => <FlagRow key={flag.key} flag={flag} isReadOnly={isReadOnly} />)
                                ) : (
                                    <p className="p-4 text-sm text-muted-foreground">No flags of this type.</p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <div className="lg:col-span-1 space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle>Recent Changes</CardTitle>
                            <CardDescription>Latest 50 flag modifications.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <Table>
                               <TableHeader>
                                   <TableRow>
                                       <TableHead>Flag</TableHead>
                                       <TableHead>Change</TableHead>
                                       <TableHead>By</TableHead>
                                       <TableHead>At</TableHead>
                                   </TableRow>
                               </TableHeader>
                               <TableBody>
                                   {audits.map((audit, i) => (
                                       <TableRow key={i}>
                                           <TableCell className="font-mono text-xs">{audit.flagKey}</TableCell>
                                           <TableCell>
                                                <Badge variant={audit.oldValue ? 'secondary' : 'destructive'}>{audit.oldValue ? 'ON' : 'OFF'}</Badge>
                                                {' -> '}
                                                <Badge variant={audit.newValue ? 'default' : 'destructive'}>{audit.newValue ? 'ON' : 'OFF'}</Badge>
                                           </TableCell>
                                           <TableCell className="text-xs">{audit.by}</TableCell>
                                           <TableCell className="text-xs">{formatDistanceToNow(audit.at, { addSuffix: true })}</TableCell>
                                       </TableRow>
                                   ))}
                               </TableBody>
                           </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
