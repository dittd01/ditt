
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { topicsData } from '@/app/admin/data';

export default function TopicCurationPage() {
  return (
    <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <PageHeader
                title="Topic Curation"
                subtitle="Manage canonical topics and their variants."
            />
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Canonical Topic (NB)</TableHead>
                        <TableHead>Parameters</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aliases</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {topicsData.map((topic) => (
                        <TableRow key={topic.id}>
                            <TableCell className="font-medium">{topic.nb}</TableCell>
                            <TableCell>{topic.params}</TableCell>
                            <TableCell><Badge variant={topic.status === 'Active' ? 'default' : 'secondary'}>{topic.status}</Badge></TableCell>
                            <TableCell>{topic.aliases}</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>Edit Canonical</DropdownMenuItem>
                                        <DropdownMenuItem>Merge Topics</DropdownMenuItem>
                                        <DropdownMenuItem>Archive</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
        <div className="space-y-4">
             <Card className="sticky top-20">
                <CardHeader>
                    <CardTitle>AI Curation Assist</CardTitle>
                    <CardDescription>Enter a new suggestion to see how the AI would curate it.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input placeholder="E.g. 'Stop taxing working capital so hard'" />
                    <Button>Preview Curation</Button>
                    <div className="pt-4 border-t text-sm space-y-2">
                        <p><strong>Verdict:</strong> <Badge>Merge</Badge></p>
                        <p><strong>Canonical:</strong> Should the wealth tax threshold be raised?</p>
                        <p><strong>Similarity:</strong> 0.92 cosine</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
