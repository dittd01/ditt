
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
import { BarChart, LineChart } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const pollPerformance = [
    { poll: 'Raise wealth-tax threshold to NOK 10m?', status: 'Active', total_votes: '150,234', votes_last_7d: '12,456' },
    { poll: 'High-speed rail Oslo–Trondheim?', status: 'Active', total_votes: '120,876', votes_last_7d: '9,876' },
    { poll: 'Halt new oil & gas exploration licenses?', status: 'Archived', total_votes: '76,543', votes_last_7d: 'N/A' },
]

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
              <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category"/>
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="tax">Taxation</SelectItem>
                  <SelectItem value="transport">Infrastructure</SelectItem>
              </SelectContent>
          </Select>
           <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Device"/>
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Devices</SelectItem>
                  <SelectItem value="desktop">Desktop</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
              </SelectContent>
          </Select>
           <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Votes per Day</CardTitle></CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
            <LineChart className="w-16 h-16" />
            <p>Line chart placeholder</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Sessions per Day</CardTitle></CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
            <LineChart className="w-16 h-16" />
            <p>Line chart placeholder</p>
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
                  <TableHead>Total Votes</TableHead>
                  <TableHead>Votes (Last 7d)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pollPerformance.map((poll, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{poll.poll}</TableCell>
                    <TableCell>{poll.status}</TableCell>
                    <TableCell>{poll.total_votes}</TableCell>
                    <TableCell>{poll.votes_last_7d}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    </div>
  );
}
