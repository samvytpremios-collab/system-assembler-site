import React from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/samvyt/Header';
import { Footer } from '@/components/samvyt/Footer';
import { Link } from 'react-router-dom';

const Privacy = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-8">
              Política de Privacidade
            </h1>

            <p className="text-muted-foreground text-sm mb-8">
              Última atualização: Janeiro de 2025
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-display font-semibold text-primary mb-4">
                1. Coleta de Dados
              </h2>
              <p className="text-muted-foreground mb-4">
                Coletamos as seguintes informações quando você participa de nossa rifa:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Nome completo</li>
                <li>Endereço de e-mail</li>
                <li>Número de telefone (opcional)</li>
                <li>Dados de transação de pagamento</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-display font-semibold text-primary mb-4">
                2. Uso dos Dados
              </h2>
              <p className="text-muted-foreground mb-4">
                Seus dados são utilizados exclusivamente para:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Processar sua participação na rifa</li>
                <li>Entrar em contato em caso de vitória</li>
                <li>Enviar atualizações sobre o sorteio</li>
                <li>Cumprir obrigações legais</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-display font-semibold text-primary mb-4">
                3. Segurança
              </h2>
              <p className="text-muted-foreground">
                Implementamos medidas de segurança técnicas e organizacionais para proteger 
                seus dados pessoais contra acesso não autorizado, alteração, divulgação ou 
                destruição. Utilizamos criptografia SSL/TLS para proteger todas as transações.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-display font-semibold text-primary mb-4">
                4. Compartilhamento
              </h2>
              <p className="text-muted-foreground">
                Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros 
                para fins de marketing. Podemos compartilhar dados com processadores de pagamento 
                e serviços de entrega quando necessário para completar a transação.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-display font-semibold text-primary mb-4">
                5. Seus Direitos
              </h2>
              <p className="text-muted-foreground mb-4">
                De acordo com a LGPD, você tem direito a:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incompletos ou incorretos</li>
                <li>Solicitar a exclusão de seus dados</li>
                <li>Revogar consentimento a qualquer momento</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-display font-semibold text-primary mb-4">
                6. Contato
              </h2>
              <p className="text-muted-foreground">
                Para exercer seus direitos ou tirar dúvidas sobre privacidade, 
                entre em contato através do email: privacidade@samvyt.com.br
              </p>
            </section>

            <div className="mt-12 pt-8 border-t border-border">
              <Link 
                to="/"
                className="text-primary hover:underline"
              >
                ← Voltar para a página inicial
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
