
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { currentUser } from '@/lib/user-data';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { generateAvatar } from '@/ai/flows/generate-avatar';
import { Loader2, Sparkles, Upload } from 'lucide-react';
import { Label } from '@/components/ui/label';


const profileFormSchema = z.object({
  username: z.string()
    .min(3, { message: "Username must be at least 3 characters." })
    .max(20, { message: "Username must not be longer than 20 characters." })
    .regex(/^[a-z0-9_]+$/, { message: "Username can only contain lowercase letters, numbers, and underscores." }),
  displayName: z.string().max(50).optional(),
  bio: z.string().max(280).optional(),
  website: z.string().url({ message: "Please enter a valid URL." }).optional(),
  location: z.string().max(50).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileSettingsPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.photoUrl);
  const [showGeneratorDialog, setShowGeneratorDialog] = useState(false);
  const [avatarPrompt, setAvatarPrompt] = useState('');

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: currentUser.username,
      displayName: currentUser.displayName || '',
      bio: currentUser.bio || '',
      website: currentUser.website || '',
      location: currentUser.location || '',
    },
    mode: 'onChange',
  });

  async function onSubmit(data: ProfileFormValues) {
    setIsSubmitting(true);
    console.log(data);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved.",
    });
    setIsSubmitting(false);
  }

  const handleGenerateAvatar = async () => {
      if (!avatarPrompt) return;
      setIsGenerating(true);
      try {
          const result = await generateAvatar({ prompt: avatarPrompt });
          if(result.imageUrl) {
              setAvatarUrl(result.imageUrl);
          }
          setShowGeneratorDialog(false);
          setAvatarPrompt('');
           toast({
              title: "Avatar Generated!",
              description: "Your new avatar is ready. Don't forget to save.",
            });
      } catch (e) {
           toast({
              variant: 'destructive',
              title: "Generation Failed",
              description: "Could not generate avatar. Please try again.",
            });
      } finally {
        setIsGenerating(false);
      }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Public Profile</CardTitle>
          <CardDescription>
            This is where you manage your public identity. You can change your avatar by uploading a photo or generating one with AI, and you can edit your display name, bio, website, and location.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="flex items-center gap-4">
                 <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarUrl} data-ai-hint="handsome man" />
                    <AvatarFallback>{currentUser.initials}</AvatarFallback>
                </Avatar>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button type="button" variant="outline">Change Photo</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => toast({ title: "Not Implemented", description: "File uploads are coming soon."})}>
                            <Upload className="mr-2" />
                            Upload from device
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setShowGeneratorDialog(true)}>
                            <Sparkles className="mr-2" />
                            Generate with AI
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="your_username" {...field} disabled />
                    </FormControl>
                    <FormDescription>
                      Usernames can only be changed once every 7 days.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} />
                    </FormControl>
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
                    <FormControl>
                      <Textarea
                        placeholder="Tell us a little bit about yourself"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                     <FormDescription>
                      You can @-mention other users to link to them.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input placeholder="https://yourwebsite.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Location" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Profile
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Dialog open={showGeneratorDialog} onOpenChange={setShowGeneratorDialog}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Generate Avatar with AI</DialogTitle>
                <DialogDescription>Describe the avatar you'd like to create.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
                <Label htmlFor="avatar-prompt">Prompt</Label>
                <Input 
                    id="avatar-prompt"
                    value={avatarPrompt}
                    onChange={e => setAvatarPrompt(e.target.value)}
                    placeholder="e.g., a handsome man, photorealistic" 
                />
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setShowGeneratorDialog(false)} disabled={isGenerating}>Cancel</Button>
                <Button onClick={handleGenerateAvatar} disabled={isGenerating || !avatarPrompt}>
                    {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
