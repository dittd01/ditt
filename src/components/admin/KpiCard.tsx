
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
    title: string;
    data: {
        value: string;
        delta: string;
    };
    icon: LucideIcon;
}

export function KpiCard({ title, data, icon: Icon }: KpiCardProps) {
    const isPositive = data.delta.startsWith('+');
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{data.value}</div>
                <p className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {data.delta} vs last period
                </p>
            </CardContent>
        </Card>
    );
}
