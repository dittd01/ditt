
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Smartphone, Monitor, QrCode, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const mockDevices = [
    {
        id: 'device_1',
        platform: 'mobile',
        createdAt: new Date().toISOString(),
        lastSeenAt: new Date().toISOString(),
        isCurrent: true,
    },
    {
        id: 'device_2',
        platform: 'desktop',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
        lastSeenAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
        isCurrent: false,
    }
]

export default function DevicesSettingsPage() {
    const [devices, setDevices] = useState(mockDevices);
    const [isLinking, setIsLinking] = useState(false);

    const handleRevoke = (deviceId: string) => {
        // Simulate API call
        console.log(`Revoking device ${deviceId}`);
        setDevices(devices.filter(d => d.id !== deviceId));
    }
    
    const handleLinkDevice = () => {
        setIsLinking(true);
        // In the next step, this will open a dialog with a QR code.
        setTimeout(() => {
            console.log("Initiating QR code generation...");
            setIsLinking(false);
        }, 1500)
    }

  return (
    <div className="space-y-8">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Devices</CardTitle>
                    <CardDescription>Manage the devices linked to your account for passkey login.</CardDescription>
                </div>
                <Button onClick={handleLinkDevice} disabled={isLinking}>
                    {isLinking ? (
                        <Loader2 className="mr-2 animate-spin"/>
                    ) : (
                        <QrCode className="mr-2" />
                    )}
                    Link New Device
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Device</TableHead>
                            <TableHead>Added</TableHead>
                            <TableHead>Last Seen</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {devices.map(device => (
                            <TableRow key={device.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {device.platform === 'mobile' ? <Smartphone/> : <Monitor />}
                                        <span className="font-medium capitalize">{device.platform}</span>
                                        {device.isCurrent && <span className="text-xs text-muted-foreground">(Current)</span>}
                                    </div>
                                </TableCell>
                                <TableCell>{format(new Date(device.createdAt), 'PP')}</TableCell>
                                <TableCell>{format(new Date(device.lastSeenAt), 'PPp')}</TableCell>
                                <TableCell>
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" disabled={device.isCurrent}>
                                                <Trash2 className="text-destructive"/>
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>Revoke Device Access?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will permanently remove passkey login from this device. You will need to re-link it to use it for login again. This action cannot be undone.
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleRevoke(device.id)}>
                                                Yes, Revoke Access
                                            </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
