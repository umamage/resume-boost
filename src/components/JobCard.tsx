import React, { useState } from 'react';
import { MapPin, DollarSign, Clock, Briefcase, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Job } from '@/services/api';
import { cn } from '@/lib/utils';

interface JobCardProps {
  job: Job;
  onApply: (jobId: string) => Promise<void>;
}

export function JobCard({ job, onApply }: JobCardProps) {
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  
  const handleApply = async () => {
    setIsApplying(true);
    try {
      await onApply(job.id);
      setHasApplied(true);
    } finally {
      setIsApplying(false);
    }
  };
  
  const getMatchBadgeVariant = (score: number) => {
    if (score >= 85) return 'success';
    if (score >= 70) return 'default';
    return 'secondary';
  };

  return (
    <Card className="group hover-lift glass-card overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors truncate">
              {job.title}
            </h3>
            <p className="text-muted-foreground font-medium mt-1">{job.company}</p>
          </div>
          <Badge 
            variant={getMatchBadgeVariant(job.matchScore) as 'default' | 'secondary'}
            className={cn(
              'shrink-0 font-semibold',
              job.matchScore >= 85 && 'bg-success text-success-foreground'
            )}
          >
            {job.matchScore}% Match
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-4 h-4" />
            <span>{job.salary}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{job.postedAt}</span>
          </div>
        </div>
        
        <p className="text-sm text-foreground/80 line-clamp-2">{job.description}</p>
        
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            <Briefcase className="w-3 h-3 mr-1" />
            {job.type}
          </Badge>
          {job.requirements.slice(0, 2).map((req, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {req}
            </Badge>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button
          onClick={handleApply}
          disabled={isApplying || hasApplied}
          variant={hasApplied ? 'success' : 'hero'}
          className="w-full"
        >
          {isApplying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Applying...
            </>
          ) : hasApplied ? (
            <>
              <Check className="w-4 h-4" />
              Applied
            </>
          ) : (
            'Apply Now'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
