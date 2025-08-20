'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AccountSettingsPage() {
  return (
    <div className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>Email Address</CardTitle>
                <CardDescription>Your email address is used for login and notifications.</CardDescription>
            </CardHeader>
            <CardContent>
                <Input type="email" defaultValue="test.user@example.com" disabled />
            </CardContent>
            <CardFooter>
                 <Button variant="outline">Change Email</Button>
            </CardFooter>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>It's a good idea to use a strong password that you're not using elsewhere.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div>
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                 </div>
                  <div>
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                 </div>
            </CardContent>
            <CardFooter>
                 <Button>Update Password</Button>
            </CardFooter>
        </Card>
        <Card className="border-destructive">
            <CardHeader>
                <CardTitle>Delete Account</CardTitle>
                <CardDescription>Permanently delete your account and all of your content.</CardDescription>
            </CardHeader>
            <CardFooter>
                 <Button variant="destructive">Delete Your Account</Button>
            </CardFooter>
        </Card>
    </div>
  );
}
