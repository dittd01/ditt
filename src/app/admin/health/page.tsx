
import { PageHeader } from '@/components/admin/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Database, Cloud, AlertCircle as AlertIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const mockHealth = [
    { name: 'Firestore Latency', status: 'ok', details: 'Read: 25ms, Write: 40ms' },
    { name: 'Genkit AI Functions', status: 'ok', details: 'All functions responsive' },
    { name: 'Next.js Server', status: 'warn', details: 'Memory usage at 85%' },
    { name: 'BankID API', status: 'ok', details: 'Connection healthy' },
]

export default function HealthPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="System Health"
        subtitle="Monitor the status of key application components."
      />

      <Alert severity="warning">
        <AlertIcon />
        <AlertTitle>Scheduled Maintenance</AlertTitle>
        <AlertDescription>
          A brief maintenance window is scheduled for tomorrow at 02:00 CET to deploy system updates.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mockHealth.map(service => (
            <Card key={service.name}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">{service.name}</CardTitle>
                    {service.status === 'ok' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {service.status === 'warn' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                    {service.status === 'down' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold capitalize">
                        <Badge variant={service.status === 'ok' ? 'default' : service.status === 'warn' ? 'destructive' : 'secondary'}>{service.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground pt-2">{service.details}</p>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
}
