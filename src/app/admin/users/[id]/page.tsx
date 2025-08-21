
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Info, Sparkles, Upload, Wand2 } from 'lucide-react';
import { usersData } from '@/app/admin/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { generateMockUserAction } from '@/app/actions';


const userFormSchema = z.object({
  displayName: z.string().min(2, { message: 'Display name must be at least 2 characters.' }),
  username: z.string().min(3, { message: 'Username must be at least 3 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  bio: z.string().max(160).optional(),
  role: z.enum(['voter', 'admin_readonly', 'analyst', 'moderator', 'admin']),
  status: z.enum(['active', 'suspended', 'deactivated']),
  notifications: z.object({
    newContent: z.boolean(),
    weeklyDigest: z.boolean(),
  })
});

type UserFormValues = z.infer<typeof userFormSchema>;

const roleDescriptions: Record<UserFormValues['role'], string> = {
    voter: 'Standard user. Can vote, propose topics, and participate in debates.',
    admin_readonly: 'Can view all admin pages but cannot make any changes.',
    analyst: 'Access to Analytics and Data Exports pages.',
    moderator: 'Can manage Topic Curation and the Suggestions Queue.',
    admin: 'Full access to all administrative features.',
};

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
            role: 'voter',
            status: 'active',
            notifications: { newContent: true, weeklyDigest: false },
        } : {
            displayName: userData?.name,
            username: userData?.username,
            email: `${userData?.username}@example.com`,
            bio: 'A mock bio for this user.',
            role: 'voter',
            status: 'active',
            notifications: { newContent: true, weeklyDigest: true },
        }
    });

    const watchedRole = form.watch('role');
    
    function onSubmit(data: UserFormValues) {
        console.log(data);
        toast({
            title: isNew ? 'User Created' : 'User Updated',
            description: `The user ${data.displayName} has been saved.`,
        });
    }

    const handleGenerateMockUser = async () => {
        form.control.register('bio'); 
        form.control.register('email');
        
        toast({ title: 'Generating Mock User...', description: 'Please wait while the AI creates a profile.' });
        const result = await generateMockUserAction();
        if(result.success && result.data) {
            form.reset({
                ...form.getValues(),
                displayName: result.data.displayName,
                username: result.data.username,
                email: result.data.email,
                bio: result.data.bio,
                role: 'voter',
                status: 'active',
            });
            toast({ title: 'Mock User Generated!', description: 'The form has been populated with AI-generated data.' });
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive' });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <PageHeader
                    title={isNew ? 'Create User' : 'Edit User'}
                    subtitle={isNew ? 'Add a new user to the system.' : `Editing details for ${userData?.name}.`}
                >
                    <div className="flex items-center gap-2">
                         {isNew && (
                            <Button variant="outline" onClick={handleGenerateMockUser} type="button">
                                <Wand2 className="mr-2 h-4 w-4" />
                                AI Mock Standard User
                            </Button>
                        )}
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
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button type="button" variant="outline">Change Photo</Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem>
                                                <Upload className="mr-2" />
                                                Upload from device
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Sparkles className="mr-2" />
                                                Generate with AI
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
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
                                        <FormItem className="space-y-3">
                                            <FormControl>
                                                <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="flex flex-col space-y-2"
                                                >
                                                {Object.keys(roleDescriptions).map(roleKey => (
                                                    <FormItem key={roleKey}>
                                                        <Label className={cn(
                                                            "flex flex-col items-start space-y-1 rounded-md border-2 p-3 transition-all hover:border-accent",
                                                            field.value === roleKey && "border-primary"
                                                        )}>
                                                            <div className="flex w-full items-center gap-2">
                                                                <FormControl>
                                                                    <RadioGroupItem value={roleKey} />
                                                                </FormControl>
                                                                <span className="font-semibold text-foreground">
                                                                    {roleKey.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                                </span>
                                                            </div>
                                                            <FormDescription className="pl-6 text-xs text-muted-foreground">
                                                                {roleDescriptions[roleKey as keyof typeof roleDescriptions]}
                                                            </FormDescription>
                                                        </Label>
                                                    </FormItem>
                                                ))}
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
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
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    className="flex flex-col space-y-2"
                                                    >
                                                    <FormItem>
                                                        <Label className="flex h-10 w-full cursor-pointer items-center justify-start rounded-md border px-3 text-sm transition-all hover:border-accent has-[input:checked]:border-primary">
                                                            <FormControl>
                                                                <RadioGroupItem value="active" className="mr-2" />
                                                            </FormControl>
                                                            Active
                                                        </Label>
                                                    </FormItem>
                                                    <FormItem>
                                                        <Label className="flex h-10 w-full cursor-pointer items-center justify-start rounded-md border px-3 text-sm transition-all hover:border-accent has-[input:checked]:border-primary">
                                                            <FormControl>
                                                                <RadioGroupItem value="suspended" className="mr-2" />
                                                            </FormControl>
                                                            Suspended
                                                        </Label>
                                                    </FormItem>
                                                    <FormItem>
                                                        <Label className="flex h-10 w-full cursor-pointer items-center justify-start rounded-md border px-3 text-sm transition-all hover:border-accent has-[input:checked]:border-destructive has-[input:checked]:text-destructive-foreground has-[input:checked]:bg-destructive">
                                                            <FormControl>
                                                                <RadioGroupItem value="deactivated" className="mr-2" />
                                                            </FormControl>
                                                            Deactivated
                                                        </Label>
                                                    </FormItem>
                                                </RadioGroup>
                                            </FormControl>
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
