import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const sizes = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-4xl',
};

const iconSizes = {
  sm: 20,
  md: 28,
  lg: 40,
};

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-2"
    >
      <motion.div
        whileHover={{ rotate: 15, scale: 1.1 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-primary/30 blur-lg rounded-full" />
        <Sparkles
          size={iconSizes[size]}
          className="text-primary relative z-10"
        />
      </motion.div>
      {showText && (
        <span className={`font-display font-bold ${sizes[size]}`}>
          <span className="text-foreground">Sam</span>
          <span className="text-gradient-cyan">Vyt</span>
        </span>
      )}
    </motion.div>
  );
};
