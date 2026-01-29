import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
  glowOnHover?: boolean;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  hover = false,
  delay = 0,
  glowOnHover = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={
        hover
          ? {
              y: -8,
              transition: { duration: 0.2 },
            }
          : undefined
      }
      className={cn(
        'bg-card border border-border rounded-lg p-6 transition-shadow duration-300',
        hover && 'cursor-pointer',
        glowOnHover && 'hover:shadow-cyan hover:border-primary/50',
        className
      )}
    >
      {children}
    </motion.div>
  );
};
