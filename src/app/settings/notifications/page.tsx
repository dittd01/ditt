'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function NotificationSettingsPage() {
  return (
    <Card>
        <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Choose what you want to be notified about.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="new-vote-reply" className="flex flex-col space-y-1">
                    <span>Replies to your votes</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                        Get notified when someone replies to your vote suggestions.
                    </span>
                </Label>
                <Switch id="new-vote-reply" defaultChecked />
            </div>
            <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="new-topic-suggestion" className="flex flex-col space-y-1">
                    <span>New topic suggestions</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                        Get notified when a new topic is suggested in your subscribed categories.
                    </span>
                </Label>
                <Switch id="new-topic-suggestion" />
            </div>
             <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="weekly-digest" className="flex flex-col space-y-1">
                    <span>Weekly digest</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                        A weekly roundup of the most popular topics.
                    </span>
                </Label>
                <Switch id="weekly-digest" defaultChecked/>
            </div>
        </CardContent>
    </Card>
  );
}
