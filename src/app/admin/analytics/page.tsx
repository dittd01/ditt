
'use client';
import { DateRangePicker } from '@/components/admin/DateRangePicker';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { pollPerformanceData } from '@/app/admin/data';
import { SessionsChart, VotesChart } from '@/components/admin/charts';
import { KpiCard } from '@/components/admin/KpiCard';
import { Users, BarChart, CheckCircle } from 'lucide-react';
import { kpiData } from '@/app/admin/data';

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        subtitle="Deep dive into user engagement and poll performance."
      >
        <DateRangePicker />
      </PageHeader>
      
      <div className="flex flex-wrap items-center gap-4">
          <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Category"/>
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="tax">Taxation</SelectItem>
                  <SelectItem value="transport">Infrastructure</SelectItem>
              </SelectContent>
          </Select>
           <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Device"/>
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Devices</SelectItem>
                  <SelectItem value="desktop">Desktop</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
              </SelectContent>
          </Select>
           <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Locale"/>
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Locales</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="nb">Norwegian</SelectItem>
              </SelectContent>
          </Select>
          <Button>Apply Filters</Button>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <KpiCard title="Active Users (DAU)" data={kpiData.dau} icon={Users} />
        <KpiCard title="Total Sessions" data={kpiData.sessions} icon={BarChart} />
        <KpiCard title="Total Votes Cast" data={kpiData.totalVotes} icon={CheckCircle} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Votes per Day</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <VotesChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Sessions per Day</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <SessionsChart />
          </CardContent>
        </Card>
      </div>

      <Card>
          <CardHeader>
            <CardTitle>Poll Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Poll</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total Votes</TableHead>
                  <TableHead className="text-right">Votes (Last 7d)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pollPerformanceData.map((poll, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{poll.poll}</TableCell>
                    <TableCell>{poll.status}</TableCell>
                    <TableCell className="text-right">{poll.total_votes.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{poll.votes_last_7d.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    </div>
  );
}
