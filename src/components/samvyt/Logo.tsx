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
        {/* Premium Metallic Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 via-accent-cyan/20 to-primary/40 blur-lg rounded-full" />
        <div className="relative z-10 p-1 bg-gradient-to-b from-white/20 to-transparent rounded-lg border border-white/10 backdrop-blur-sm">
          <Sparkles
            size={iconSizes[size]}
            className="text-primary drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]"
          />
        </div>
      </motion.div>
      {showText && (
        <span className={`font-display font-bold tracking-tight ${sizes[size]}`}>
          <span className="text-foreground">Sam</span>
          <span className="text-gradient-cyan drop-shadow-[0_0_10px_rgba(0,229,255,0.3)]">Vyt</span>
        </span>
      )}
    </motion.div>
  );
};
