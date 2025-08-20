'use client';

import { useParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Globe, Mail, MapPin, Milestone } from 'lucide-react';

// Mock data - in a real app, this would be fetched from Firestore
const mockUser = {
  username: 'testuser',
  displayName: 'Test User',
  bio: 'This is a mock bio for the test user. Building things with Next.js and Firebase.',
  location: 'Oslo, Norway',
  website: 'https://example.com',
  photoUrl: 'https://placehold.co/256x256.png',
  initials: 'TU',
  pronouns: 'they/them',
  interests: ['Votering', 'Teknologi', 'Demokrati'],
  createdAt: new Date(),
};

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;

  // In a real app, you would fetch user data based on the username
  // For now, we'll just display the mock user if the username matches
  const user = username === mockUser.username ? mockUser : null;

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold">User not found</h1>
        <p className="text-muted-foreground">The profile for @{username} could not be located.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Card>
        <CardHeader className="flex flex-col items-center justify-center space-y-4 bg-muted/30 p-8 text-center">
          <Avatar className="h-24 w-24 border-4 border-background">
            <AvatarImage src={user.photoUrl} alt={user.displayName} />
            <AvatarFallback>{user.initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">{user.displayName}</h1>
            <p className="text-muted-foreground">@{user.username}</p>
             {user.pronouns && <p className="text-sm text-muted-foreground">{user.pronouns}</p>}
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">About</h2>
            <p className="text-muted-foreground">{user.bio || 'No bio provided.'}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
             {user.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{user.location}</span>
                </div>
            )}
             {user.website && (
                <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <Globe className="h-4 w-4" />
                    <span>{user.website.replace(/^https?:\/\//, '')}</span>
                </a>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
                <Milestone className="h-4 w-4" />
                <span>Joined {user.createdAt.toLocaleDateString()}</span>
            </div>
          </div>

          {user.interests && user.interests.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Interests</h2>
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest) => (
                  <span key={interest} className="px-3 py-1 text-sm rounded-full bg-secondary text-secondary-foreground">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
