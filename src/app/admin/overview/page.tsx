
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
import { Users, FileText, CheckCircle, Download, BarChart } from 'lucide-react';
import Link from 'next/link';
import { kpiData, topPollsData } from '@/app/admin/data';
import { DauChart } from '@/components/admin/charts';

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
          <CardContent className="h-[300px] pl-2">
            <DauChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full justify-start" variant="outline"><Link href="/admin/polls/new"><FileText className="mr-2" />Create Poll</Link></Button>
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
                {topPollsData.map((poll) => (
                  <TableRow key={poll.id}>
                    <TableCell className="font-medium">{poll.title}</TableCell>
                    <TableCell className="text-right">{poll.votes.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    </div>
  );
}
