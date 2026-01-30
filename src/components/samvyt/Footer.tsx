import React from 'react';
import { Logo } from './Logo';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0E1E2E] border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-6">
            <Logo size="lg" />
            <p className="text-muted-foreground text-sm leading-relaxed">
              A SamVyt é uma plataforma de rifas planejadas focada em transparência, 
              segurança e participação consciente.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all">
                <Facebook size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-foreground font-display font-bold mb-6">Links Rápidos</h4>
            <ul className="space-y-4">
              <li>
                <a href="#participar" className="text-muted-foreground hover:text-primary transition-colors text-sm">Participar</a>
              </li>
              <li>
                <a href="#como-funciona" className="text-muted-foreground hover:text-primary transition-colors text-sm">Como Funciona</a>
              </li>
              <li>
                <Link to="/meus-numeros" className="text-muted-foreground hover:text-primary transition-colors text-sm">Meus Números</Link>
              </li>
              <li>
                <a href="#faq" className="text-muted-foreground hover:text-primary transition-colors text-sm">Perguntas Frequentes</a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-foreground font-display font-bold mb-6">Legal</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/termos" className="text-muted-foreground hover:text-primary transition-colors text-sm">Termos de Uso</Link>
              </li>
              <li>
                <Link to="/privacidade" className="text-muted-foreground hover:text-primary transition-colors text-sm">Política de Privacidade</Link>
              </li>
              <li>
                <span className="text-muted-foreground text-sm">Sorteio via Loteria Federal</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-foreground font-display font-bold mb-6">Contato</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail size={18} className="text-primary shrink-0" />
                <span className="text-muted-foreground text-sm">contato@samvyt.com.br</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={18} className="text-primary shrink-0" />
                <span className="text-muted-foreground text-sm">(00) 00000-0000</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-primary shrink-0" />
                <span className="text-muted-foreground text-sm">Brasília, DF</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-xs">
            © 2025 SamVyt Rifas Planejadas. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-muted-foreground text-[10px] uppercase tracking-widest">Pagamento Seguro</span>
            <div className="flex items-center gap-2 grayscale opacity-50">
              <Zap size={16} className="text-primary" />
              <span className="text-foreground font-bold text-xs">PIX</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
