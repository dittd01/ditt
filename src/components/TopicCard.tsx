import Link from 'next/link'
import Image from 'next/image'
import type { Topic } from '@/lib/types'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Users } from 'lucide-react'

export function TopicCard({ topic }: { topic: Topic }) {
  const getPercentage = (optionId: string) => {
    if (topic.totalVotes === 0) return 0
    return (topic.votes[optionId] / topic.totalVotes) * 100
  }

  return (
    <Link href={`/t/${topic.slug}`} className="group block">
      <Card className="h-full flex flex-col transition-all duration-200 ease-in-out group-hover:shadow-xl group-hover:-translate-y-1">
        <CardHeader className="p-0">
          <div className="aspect-video relative">
            <Image
              src={topic.imageUrl}
              alt={topic.question}
              fill
              className="rounded-t-lg object-cover"
              data-ai-hint={
                topic.slug === 'oslo-car-free-zone' ? 'oslo city' :
                topic.slug === 'daylight-savings-time' ? 'clock time' :
                'voting technology'
              }
            />
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-6 space-y-4">
          <CardTitle className="text-lg font-semibold leading-snug">{topic.question}</CardTitle>
          <div className="space-y-4 pt-2">
            {topic.options.map((option) => (
              <div key={option.id}>
                <div className="flex justify-between mb-1 text-sm">
                  <span className="text-muted-foreground">{option.label}</span>
                  <span className="font-medium">{getPercentage(option.id).toFixed(1)}%</span>
                </div>
                <Progress value={getPercentage(option.id)} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="w-4 h-4 mr-2" />
            <span>{topic.totalVotes.toLocaleString()} votes</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
