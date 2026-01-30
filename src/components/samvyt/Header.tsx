import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo';
import { PrimaryButton } from './PrimaryButton';
import { Menu, X, Search } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Participar', href: '/#participar' },
    { name: 'Como Funciona', href: '/#como-funciona' },
    { name: 'Meus Números', href: '/meus-numeros', icon: <Search size={16} /> },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled 
          ? 'bg-[#0E1E2E]/80 backdrop-blur-md py-3 border-b border-white/10' 
          : 'bg-transparent py-6'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors flex items-center gap-2',
                  location.pathname === link.href || (link.href.startsWith('/#') && location.pathname === '/')
                    ? 'text-primary'
                    : 'text-foreground/70 hover:text-primary'
                )}
              >
                {link.icon}
                {link.name}
              </a>
            ))}
            <a href="#participar">
              <PrimaryButton size="sm" className="bg-[#00E5FF] text-[#0E1E2E] font-bold">
                Comprar Cotas
              </PrimaryButton>
            </a>
          </nav>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0E1E2E] border-b border-white/10 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-medium text-foreground/70 hover:text-primary py-2 flex items-center gap-3"
                >
                  {link.icon}
                  {link.name}
                </a>
              ))}
              <a href="#participar" onClick={() => setIsMobileMenuOpen(false)}>
                <PrimaryButton fullWidth size="lg" className="bg-[#00E5FF] text-[#0E1E2E] font-bold">
                  Comprar Cotas
                </PrimaryButton>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
