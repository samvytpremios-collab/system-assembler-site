import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'h-2',
  md: 'h-4',
  lg: 'h-6',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  showLabel = true,
  size = 'md',
  className,
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">
            {value.toLocaleString()} / {max.toLocaleString()} cotas
          </span>
          <span className="text-sm font-semibold text-primary">
            {percentage.toFixed(1)}%
          </span>
        </div>
      )}
      <div className={cn('w-full bg-secondary rounded-full overflow-hidden', sizes[size])}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={cn(
            'h-full rounded-full progress-fill',
            percentage >= 75 && 'animate-glow-pulse'
          )}
        />
      </div>
    </div>
  );
};
