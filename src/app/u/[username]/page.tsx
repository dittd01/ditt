
'use client';

import { useParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Globe, Mail, MapPin, Milestone, CheckCircle, XCircle, CopyCheck, Bookmark } from 'lucide-react';
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
import { currentUser } from '@/lib/user-data';
import { allTopics } from '@/lib/data';
import type { Topic } from '@/lib/types';


type Suggestion = {
  id: number | string;
  text: string;
  verdict: string;
  reason: string;
  slug: string | null;
}

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
  const [userSuggestions, setUserSuggestions] = useState<Suggestion[]>([]);
  const [bookmarkedTopics, setBookmarkedTopics] = useState<Topic[]>([]);
  
  const user = username === currentUser.username ? currentUser : null;

  useEffect(() => {
    const syncUserData = () => {
      if (user) {
        const customSuggestions: Suggestion[] = JSON.parse(localStorage.getItem('user_suggestions') || '[]');
        setUserSuggestions(customSuggestions);

        const bookmarkedTopicIds: string[] = JSON.parse(localStorage.getItem('bookmarked_topics') || '[]');
        const bookmarked = allTopics.filter(topic => bookmarkedTopicIds.includes(topic.id));
        setBookmarkedTopics(bookmarked);
      } else {
        setUserSuggestions([]);
        setBookmarkedTopics([]);
      }
    };

    syncUserData();
    
    // Rerender if storage changes
    window.addEventListener('storage', syncUserData);
    window.addEventListener('topicAdded', syncUserData);
    window.addEventListener('bookmarkChange', syncUserData); // Listen for bookmark changes

    return () => {
      window.removeEventListener('storage', syncUserData);
      window.removeEventListener('topicAdded', syncUserData);
      window.removeEventListener('bookmarkChange', syncUserData);
    };

  }, [user]);


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
            <AvatarImage src={user.photoUrl} alt={user.displayName} className="object-cover" />
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
                <span>Joined {new Date().toLocaleDateString()}</span>
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
      
      {bookmarkedTopics.length > 0 && (
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bookmark className="h-5 w-5"/>
                  Bookmarked Topics
                </CardTitle>
                <CardDescription>Topics you've saved for later.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Topic</TableHead>
                            <TableHead className="text-right">Total Votes</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bookmarkedTopics.map((topic) => (
                            <TableRow key={topic.id}>
                                <TableCell className="font-medium">
                                  <Link href={`/t/${topic.slug}`} className="hover:underline text-primary">
                                    {topic.question}
                                  </Link>
                                </TableCell>
                                <TableCell className="text-right">{topic.totalVotes.toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      )}

      {userSuggestions.length > 0 && (
         <Card>
            <CardHeader>
                <CardTitle>Your Topic Suggestions</CardTitle>
                 <CardDescription>The history of topics you've proposed.</CardDescription>
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
