
'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar';
import {
  Home,
  BarChart2,
  List,
  MessageSquareQuote,
  Lightbulb,
  Users,
  Shield,
  FileText,
  HeartPulse,
  Download,
  Settings,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/admin/overview', icon: Home, label: 'Overview', roles: ['ReadOnly', 'Analyst', 'Moderator', 'Admin', 'Owner'] },
  { href: '/admin/analytics', icon: BarChart2, label: 'Analytics', roles: ['ReadOnly', 'Analyst', 'Moderator', 'Admin', 'Owner'] },
  { href: '/admin/polls', icon: List, label: 'Polls', roles: ['ReadOnly', 'Analyst', 'Moderator', 'Admin', 'Owner'] },
  { href: '/admin/topic-curation', icon: Lightbulb, label: 'Topic Curation', roles: ['Moderator', 'Admin', 'Owner'] },
  { href: '/admin/suggestions-queue', icon: MessageSquareQuote, label: 'Suggestions Queue', roles: ['Moderator', 'Admin', 'Owner'] },
  { href: '/admin/users', icon: Users, label: 'Users', roles: ['Admin', 'Owner'] },
  { href: '/admin/audit-logs', icon: Shield, label: 'Audit Logs', roles: ['Admin', 'Owner'] },
  { href: '/admin/feature-flags', icon: FileText, label: 'Feature Flags', roles: ['Admin', 'Owner'] },
  { href: '/admin/health', icon: HeartPulse, label: 'Health', roles: ['Admin', 'Owner'] },
  { href: '/admin/exports', icon: Download, label: 'Exports', roles: ['Analyst', 'Admin', 'Owner'] },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 p-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                D
              </div>
              <h2 className="text-lg font-semibold">Admin Panel</h2>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <Link href={item.href}>
                     <SidebarMenuButton
                      tooltip={item.label}
                      isActive={pathname === item.href}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Settings />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                 <SidebarMenuButton>
                  <LogOut />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
         <SidebarInset>
            <AdminHeader />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
              {children}
            </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
