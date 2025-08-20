
'use client';

import { useParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Mail, MapPin, Milestone, CheckCircle, XCircle, CopyCheck } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useState, useEffect } from 'react';

type Suggestion = {
  id: number;
  text: string;
  verdict: string;
  reason: string;
  slug: string | null;
}

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
  suggestions: [
    {
      id: 5,
      text: 'Foreign fishing boats should be banned from Norwegian waters.',
      verdict: 'Approved',
      reason: 'Clear, single-issue question.',
      slug: 'foreign-fishing-boats-should-be-banned-from-norwegian-waters',
    },
    {
      id: 1,
      text: 'Should all public transport be free in major cities?',
      verdict: 'Approved',
      reason: 'Clear, single-issue question.',
      slug: 'free-transit-for-under-18s', // Note: slug might not perfectly match text
    },
    {
      id: 2,
      text: 'More money for schools and also lower taxes.',
      verdict: 'Rejected',
      reason: 'Contains multiple, conflicting issues.',
      slug: null,
    },
    {
      id: 3,
      text: 'What about making the wealth tax higher?',
      verdict: 'Merged',
      reason: 'Similar to existing topic: "Raise wealth-tax threshold to NOK 10m?"',
      slug: null,
    },
     {
      id: 4,
      text: 'Introduce a four-day work week as standard.',
      verdict: 'Approved',
      reason: 'Unique and well-defined topic.',
      slug: null, // This topic doesn't exist yet as a poll
    },
  ]
};

const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
        case 'Approved':
            return <CheckCircle className="h-4 w-4 text-green-500" />;
        case 'Merged':
            return <CopyCheck className="h-4 w-4 text-blue-500" />;
        case 'Rejected':
            return <XCircle className="h-4 w-4 text-red-500" />;
        default:
            return null;
    }
}

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const [userSuggestions, setUserSuggestions] = useState<Suggestion[]>(mockUser.suggestions);

  useEffect(() => {
    const customSuggestions: Suggestion[] = JSON.parse(localStorage.getItem('user_suggestions') || '[]');
    // Combine and remove duplicates, giving precedence to custom suggestions
    const combined = [...customSuggestions, ...mockUser.suggestions];
    const uniqueSuggestions = Array.from(new Set(combined.map(s => s.id)))
        .map(id => combined.find(s => s.id === id)!);
    setUserSuggestions(uniqueSuggestions);

    const handleStorageChange = () => {
        const updatedCustomSuggestions: Suggestion[] = JSON.parse(localStorage.getItem('user_suggestions') || '[]');
        const updatedCombined = [...updatedCustomSuggestions, ...mockUser.suggestions];
        const updatedUnique = Array.from(new Set(updatedCombined.map(s => s.id)))
            .map(id => updatedCombined.find(s => s.id === id)!);
        setUserSuggestions(updatedUnique);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('topicAdded', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('topicAdded', handleStorageChange);
    };

  }, []);

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
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-8">
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
      
      {userSuggestions.length > 0 && (
         <Card>
            <CardHeader>
                <CardTitle>Topic Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Suggestion</TableHead>
                            <TableHead>Verdict</TableHead>
                            <TableHead>Reason / Outcome</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {userSuggestions.map((s) => (
                            <TableRow key={s.id}>
                                <TableCell className="font-medium">
                                  {s.verdict === 'Approved' && s.slug ? (
                                    <Link href={`/t/${s.slug}`} className="hover:underline text-primary">
                                      {s.text}
                                    </Link>
                                  ) : (
                                    s.text
                                  )}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={s.verdict === 'Rejected' ? 'destructive' : s.verdict === 'Merged' ? 'secondary' : 'default'} className="gap-1.5 pl-2">
                                        {getVerdictIcon(s.verdict)}
                                        {s.verdict}
                                    </Badge>
                                </TableCell>
                                <TableCell>{s.reason}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      )}

    </div>
  );
}
