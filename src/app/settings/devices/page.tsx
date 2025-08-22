
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Smartphone, Monitor, QrCode, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';

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
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [showQrDialog, setShowQrDialog] = useState(false);

    const handleRevoke = (deviceId: string) => {
        // Simulate API call
        console.log(`Revoking device ${deviceId}`);
        setDevices(devices.filter(d => d.id !== deviceId));
    }
    
    const handleLinkDevice = async () => {
        setIsLinking(true);
        // In a real app, you would call a server action to generate a secure, short-lived challenge.
        // For this prototype, we'll generate a simple one on the client.
        const challenge = `link_challenge_${Date.now()}`;
        const linkUrl = `${window.location.origin}/auth/link/verify?challenge=${challenge}`;
        
        // Use an external API to generate the QR code image
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(linkUrl)}`;
        setQrCodeUrl(qrApiUrl);

        // Simulate storing the challenge on the server
        localStorage.setItem('qr_link_challenge', challenge);
        
        setShowQrDialog(true);
        setIsLinking(false);
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

        <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Link a New Device</DialogTitle>
                    <DialogDescription>
                        Scan this QR code with the camera on your new device to securely log in. This code is valid for 5 minutes.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center p-4">
                    {qrCodeUrl ? (
                        <Image src={qrCodeUrl} alt="QR Code to link new device" width={250} height={250} />
                    ) : (
                        <div className="h-[250px] w-[250px] flex items-center justify-center bg-muted rounded-md">
                            <Loader2 className="animate-spin" />
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    </div>
  );
}
