
import { ReactNode } from 'react';
import Link from 'next/link';
import { User, Shield, Bell, Smartphone } from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const navItems = [
    { href: '/settings/profile', icon: User, label: 'Profile' },
    { href: '/settings/account', icon: Shield, label: 'Account' },
    { href: '/settings/devices', icon: Smartphone, label: 'Devices' },
    { href: '/settings/notifications', icon: Bell, label: 'Notifications' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
        <PageHeader title="Settings" subtitle="Manage your account and profile settings." />
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-8">
            <aside className="md:col-span-1">
                 <nav className="flex flex-col space-y-1">
                    {navItems.map((item) => (
                        <Button key={item.label} variant="ghost" className="justify-start" asChild>
                            <Link href={item.href}>
                                <item.icon className="mr-2 h-4 w-4" />
                                {item.label}
                            </Link>
                        </Button>
                    ))}
                 </nav>
            </aside>
            <main className="md:col-span-3">
                {children}
            </main>
        </div>
    </div>
  );
}
