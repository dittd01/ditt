
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
import { Edit } from 'lucide-react';
import { featureFlagsData } from '@/app/admin/data';

export default function FeatureFlagsPage() {
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
            {featureFlagsData.map((flag) => (
                 <TableRow key={flag.key}>
                    <TableCell className="font-mono">{flag.key}</TableCell>
                    <TableCell>{flag.desc}</TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                            <Switch checked={flag.enabled} />
                            <Badge variant={flag.enabled ? 'default' : 'secondary'}>{flag.enabled ? 'Enabled' : 'Disabled'}</Badge>
                        </div>
                    </TableCell>
                    <TableCell>{flag.rollout}</TableCell>
                    <TableCell>
                        <Button variant="ghost" size="icon">
                            <Edit />
                        </Button>
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
