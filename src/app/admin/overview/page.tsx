
import { DateRangePicker } from '@/components/admin/DateRangePicker';
import { KpiCard } from '@/components/admin/KpiCard';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BarChart, LineChart, Users, FileText, CheckCircle, Download } from 'lucide-react';
import Link from 'next/link';

// Mock Data
const kpiData = {
  dau: { value: '12,456', delta: '+12.5%' },
  sessions: { value: '34,890', delta: '+8.2%' },
  totalVotes: { value: '1,2M', delta: '+25K' },
  newUsers: { value: '1,502', delta: '-3.1%' },
};

const topPolls = [
  { id: 1, title: 'Raise wealth-tax threshold to NOK 10m?', votes: '150,234' },
  { id: 2, title: 'High-speed rail Oslo–Trondheim?', votes: '120,876' },
  { id: 3, title: 'Adopt ranked-choice voting for national elections?', votes: '98,456' },
  { id: 4, title: 'Increase carbon tax to NOK 2,000/ton?', votes: '88,123' },
  { id: 5, title: 'Halt new oil & gas exploration licenses?', votes: '76,543' },
];

export default function OverviewPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Overview"
        subtitle="Key metrics and quick actions for the last 7 days."
      >
        <DateRangePicker />
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Daily Active Users" data={kpiData.dau} icon={Users} />
        <KpiCard title="Sessions" data={kpiData.sessions} icon={BarChart} />
        <KpiCard title="Total Votes" data={kpiData.totalVotes} icon={CheckCircle} />
        <KpiCard title="New Users" data={kpiData.newUsers} icon={Users} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Daily Active Users</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
            <LineChart className="w-16 h-16" />
            <p>Line chart placeholder</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="outline"><FileText className="mr-2" />Create Poll</Button>
            <Button asChild className="w-full justify-start" variant="outline"><Link href="/admin/suggestions-queue"><CheckCircle className="mr-2" />Review Suggestions</Link></Button>
            <Button asChild className="w-full justify-start" variant="outline"><Link href="/admin/exports"><Download className="mr-2" />Export Dataset</Link></Button>
          </CardContent>
        </Card>
      </div>

       <Card>
          <CardHeader>
            <CardTitle>Top 5 Polls by Votes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Poll Title</TableHead>
                  <TableHead className="text-right">Total Votes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPolls.map((poll) => (
                  <TableRow key={poll.id}>
                    <TableCell className="font-medium">{poll.title}</TableCell>
                    <TableCell className="text-right">{poll.votes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    </div>
  );
}
