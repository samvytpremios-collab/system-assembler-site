import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'cyan' | 'green' | 'yellow' | 'red';
}

const colors = {
  cyan: 'text-primary',
  green: 'text-success',
  yellow: 'text-warning',
  red: 'text-destructive',
};

const bgColors = {
  cyan: 'bg-primary/10',
  green: 'bg-success/10',
  yellow: 'bg-warning/10',
  red: 'bg-destructive/10',
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color = 'cyan',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-card border border-border rounded-lg p-6 hover:shadow-cyan transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-sm text-muted-foreground">{title}</span>
        {icon && (
          <div className={cn('p-2 rounded-lg', bgColors[color])}>
            <div className={colors[color]}>{icon}</div>
          </div>
        )}
      </div>
      <p className={cn('text-3xl font-display font-bold mb-1', colors[color])}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {subtitle && (
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      )}
      {trend && trendValue && (
        <div className="flex items-center gap-1 mt-2">
          <span
            className={cn(
              'text-sm',
              trend === 'up' && 'text-success',
              trend === 'down' && 'text-destructive',
              trend === 'neutral' && 'text-muted-foreground'
            )}
          >
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
            {trendValue}
          </span>
        </div>
      )}
    </motion.div>
  );
};
