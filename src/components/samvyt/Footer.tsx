import React from 'react';
import { motion } from 'framer-motion';
import { Logo } from './Logo';
import { Instagram, MessageCircle, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Logo size="lg" />
            <p className="mt-4 text-muted-foreground max-w-md">
              Rifas planejadas com total transparência. Participação consciente, sorteio auditável via Loteria Federal.
            </p>
            <div className="flex gap-4 mt-6">
              <a
                href="#"
                className="p-2 bg-secondary rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="p-2 bg-secondary rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <MessageCircle size={20} />
              </a>
              <a
                href="mailto:contato@samvyt.com.br"
                className="p-2 bg-secondary rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#como-funciona" className="text-muted-foreground hover:text-primary transition-colors">
                  Como Funciona
                </a>
              </li>
              <li>
                <a href="#participar" className="text-muted-foreground hover:text-primary transition-colors">
                  Participar
                </a>
              </li>
              <li>
                <Link to="/meus-numeros" className="text-muted-foreground hover:text-primary transition-colors">
                  Meus Números
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/termos" className="text-muted-foreground hover:text-primary transition-colors">
                  Termos e Condições
                </Link>
              </li>
              <li>
                <Link to="/privacidade" className="text-muted-foreground hover:text-primary transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Regulamento
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SamVyt. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
