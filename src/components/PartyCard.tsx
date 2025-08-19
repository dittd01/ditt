'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import type { Party } from '@/lib/election-data';
import { Button } from './ui/button';

interface PartyCardProps {
  party: Party;
  onVote: (partyId: string) => void;
  disabled: boolean;
}

export function PartyCard({ party, onVote, disabled }: PartyCardProps) {
  return (
    <Card className="overflow-hidden transition-all duration-200 ease-in-out hover:shadow-xl hover:-translate-y-1">
      <CardContent className="p-0">
        <div className="aspect-[4/3] relative">
          <Image
            src={party.imageUrl}
            alt={party.name}
            fill
            className="object-cover"
            data-ai-hint={party.aiHint}
          />
        </div>
      </CardContent>
      <CardFooter className="p-2" style={{ backgroundColor: party.color, color: party.textColor || '#FFFFFF' }}>
          <Button 
            onClick={() => onVote(party.id)} 
            disabled={disabled}
            className="w-full h-auto py-2 px-1 text-center font-bold text-base"
            style={{ 
                backgroundColor: party.color, 
                color: party.textColor || '#FFFFFF',
                '--tw-ring-color': party.textColor || '#FFFFFF' 
            } as React.CSSProperties}
            variant="ghost"
          >
            {party.abbreviation}
          </Button>
      </CardFooter>
    </Card>
  );
}
