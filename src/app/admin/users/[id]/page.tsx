
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { usersData } from '@/app/admin/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

const userFormSchema = z.object({
  displayName: z.string().min(2, { message: 'Display name must be at least 2 characters.' }),
  username: z.string().min(3, { message: 'Username must be at least 3 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  bio: z.string().max(160).optional(),
  role: z.enum(['admin', 'moderator', 'analyst', 'readonly']),
  status: z.enum(['active', 'suspended', 'deactivated']),
  notifications: z.object({
    newContent: z.boolean(),
    weeklyDigest: z.boolean(),
  })
});

type UserFormValues = z.infer<typeof userFormSchema>;

export default function EditUserPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const userId = params.id as string;
    const isNew = userId === 'new';
    
    // In a real app, you'd fetch this data. For mock, we find it.
    const userData = isNew ? null : usersData.find(u => u.id === userId);

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userFormSchema),
        defaultValues: isNew ? {
            displayName: '',
            username: '',
            email: '',
            bio: '',
            role: 'readonly',
            status: 'active',
            notifications: { newContent: true, weeklyDigest: false },
        } : {
            displayName: userData?.name,
            username: userData?.username,
            email: `${userData?.username}@example.com`,
            bio: 'A mock bio for this user.',
            role: 'readonly',
            status: 'active',
            notifications: { newContent: true, weeklyDigest: true },
        }
    });

    function onSubmit(data: UserFormValues) {
        console.log(data);
        toast({
            title: isNew ? 'User Created' : 'User Updated',
            description: `The user ${data.displayName} has been saved.`,
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <PageHeader
                    title={isNew ? 'Create User' : 'Edit User'}
                    subtitle={isNew ? 'Add a new user to the system.' : `Editing details for ${userData?.name}.`}
                >
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => router.back()} type="button">
                            <ArrowLeft className="mr-2 h-4 w-4" />Back
                        </Button>
                        <Button type="submit">
                            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isNew ? 'Create User' : 'Save Changes'}
                        </Button>
                    </div>
                </PageHeader>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>User Profile</CardTitle>
                                <CardDescription>Basic information for the user's public profile.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                 <div className="flex items-center gap-4">
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage src={userData?.avatar} />
                                        <AvatarFallback>{userData?.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    <Button type="button" variant="outline">Change Photo</Button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                     <FormField
                                        control={form.control}
                                        name="displayName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Display Name</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="username"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Username</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl><Input {...field} type="email" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="bio"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Bio</FormLabel>
                                            <FormControl><Textarea {...field} /></FormControl>
                                            <FormDescription>A brief description for their profile.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle>Password</CardTitle>
                                <CardDescription>Manage user password. Only available on creation for this mock.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                 <Input type="password" placeholder="New Password" disabled={!isNew} />
                                 {isNew && <p className="text-sm text-muted-foreground">A link to set the password will be sent to the user's email.</p>}
                            </CardContent>
                        </Card>
                    </div>
                    <div className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Role</CardTitle>
                                <CardDescription>Set the user's permissions within the application.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name="role"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="readonly">Read-Only</SelectItem>
                                                    <SelectItem value="analyst">Analyst</SelectItem>
                                                    <SelectItem value="moderator">Moderator</SelectItem>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Status</CardTitle>
                                <CardDescription>Control the user's access to the application.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="suspended">Suspended</SelectItem>
                                                    <SelectItem value="deactivated">Deactivated</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle>Notifications</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField control={form.control} name="notifications.newContent" render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel>New Content</FormLabel>
                                            <FormDescription>Notify about new polls.</FormDescription>
                                        </div>
                                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    </FormItem>
                                 )} />
                                <FormField control={form.control} name="notifications.weeklyDigest" render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                                         <div className="space-y-0.5">
                                            <FormLabel>Weekly Digest</FormLabel>
                                            <FormDescription>Send weekly summary.</FormDescription>
                                        </div>
                                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    </FormItem>
                                 )} />
                            </CardContent>
                        </Card>
                        { !isNew && 
                             <Card className="border-destructive">
                                <CardHeader>
                                    <CardTitle>Danger Zone</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Button type="button" variant="destructive">Delete User</Button>
                                </CardContent>
                            </Card>
                        }
                    </div>
                </div>
            </form>
        </Form>
    );
}
