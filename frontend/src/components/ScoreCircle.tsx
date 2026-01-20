import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ScoreCircleProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export function ScoreCircle({ score, size = 'md', label, className }: ScoreCircleProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  const sizeConfig = {
    sm: { width: 80, stroke: 6, fontSize: 'text-lg' },
    md: { width: 140, stroke: 8, fontSize: 'text-3xl' },
    lg: { width: 200, stroke: 10, fontSize: 'text-5xl' },
  };
  
  const config = sizeConfig[size];
  const radius = (config.width - config.stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedScore / 100) * circumference;
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'stroke-success';
    if (score >= 60) return 'stroke-primary';
    if (score >= 40) return 'stroke-warning';
    return 'stroke-destructive';
  };
  
  const getScoreTextColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-primary';
    if (score >= 40) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="relative" style={{ width: config.width, height: config.width }}>
        <svg
          className="transform -rotate-90"
          width={config.width}
          height={config.width}
        >
          {/* Background circle */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            className="stroke-muted"
            strokeWidth={config.stroke}
          />
          {/* Progress circle */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            className={cn('transition-all duration-1000 ease-out', getScoreColor(score))}
            strokeWidth={config.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('font-display font-bold', config.fontSize, getScoreTextColor(score))}>
            {animatedScore}
          </span>
        </div>
      </div>
      {label && (
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      )}
    </div>
  );
}
