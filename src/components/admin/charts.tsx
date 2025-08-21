
'use client';
import { chartData } from '@/app/admin/data';
import {
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid
} from 'recharts';

export function DauChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart data={chartData.dau}>
        <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            borderColor: 'hsl(var(--border))',
          }}
        />
        <Line type="monotone" dataKey="DAU" stroke="hsl(var(--primary))" dot={false} />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}


export function VotesChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart data={chartData.votes}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
        <Tooltip
           contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            borderColor: 'hsl(var(--border))',
          }}
        />
        <Bar dataKey="votes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

export function SessionsChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart data={chartData.sessions}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
        <Tooltip
           contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            borderColor: 'hsl(var(--border))',
          }}
        />
        <Line type="monotone" dataKey="sessions" stroke="hsl(var(--primary))" dot={false} />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
