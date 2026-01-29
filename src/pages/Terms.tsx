import React from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/samvyt/Header';
import { Footer } from '@/components/samvyt/Footer';
import { Link } from 'react-router-dom';

const Terms = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="prose prose-invert max-w-none"
          >
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-8">
              Termos e Condições
            </h1>

            <p className="text-muted-foreground text-sm mb-8">
              Última atualização: Janeiro de 2025
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-display font-semibold text-primary mb-4">
                1. Aceitação dos Termos
              </h2>
              <p className="text-muted-foreground">
                Ao participar da rifa organizada pela SamVyt, você concorda com todos os termos e condições 
                descritos neste documento. A participação implica na aceitação integral destes termos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-display font-semibold text-primary mb-4">
                2. Definições
              </h2>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong className="text-foreground">Organizador:</strong> SamVyt</li>
                <li><strong className="text-foreground">Participante:</strong> Pessoa que adquirir uma ou mais cotas</li>
                <li><strong className="text-foreground">Prêmio:</strong> iPhone 17 Pro Max 256GB</li>
                <li><strong className="text-foreground">Cota:</strong> Número de participação no valor de R$ 1,00</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-display font-semibold text-primary mb-4">
                3. Mecânica da Rifa
              </h2>
              <p className="text-muted-foreground mb-4">
                A rifa consiste em:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Total de 17.000 cotas numeradas de 00001 a 17000</li>
                <li>Valor unitário de R$ 1,00 por cota</li>
                <li>Sorteio baseado na Loteria Federal</li>
                <li>Número vencedor: últimos 5 dígitos do 1º prêmio</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-display font-semibold text-primary mb-4">
                4. Condições de Participação
              </h2>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Maior de 18 anos ou emancipado</li>
                <li>Possuir CPF válido e regular</li>
                <li>Pagamento confirmado dentro do prazo de validade</li>
                <li>Aceitar integralmente estes termos</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-display font-semibold text-primary mb-4">
                5. Processo de Compra
              </h2>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Pagamento exclusivamente via PIX</li>
                <li>Confirmação automática em até 5 minutos</li>
                <li>Números reservados após confirmação de pagamento</li>
                <li>Não há reembolso após confirmação da compra</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-display font-semibold text-primary mb-4">
                6. Do Sorteio
              </h2>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Data do sorteio será comunicada previamente</li>
                <li>Método: Resultado da Loteria Federal</li>
                <li>O número vencedor corresponde aos últimos 5 dígitos do 1º prêmio</li>
                <li>Resultado divulgado publicamente em nossas redes sociais</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-display font-semibold text-primary mb-4">
                7. Entrega do Prêmio
              </h2>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Prazo de até 30 dias úteis após o sorteio</li>
                <li>Vencedor será contatado via email e telefone</li>
                <li>Entrega via Correios (Sedex) ou pessoalmente</li>
                <li>O vencedor terá até 30 dias para reclamar o prêmio</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-display font-semibold text-primary mb-4">
                8. Disposições Gerais
              </h2>
              <p className="text-muted-foreground">
                A SamVyt reserva-se o direito de cancelar a rifa e devolver os valores pagos caso 
                não seja atingido o mínimo de vendas necessário. Qualquer alteração nestes termos 
                será comunicada com antecedência mínima de 48 horas.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-display font-semibold text-primary mb-4">
                9. Contato
              </h2>
              <p className="text-muted-foreground">
                Email: contato@samvyt.com.br<br />
                WhatsApp: Disponível em nosso site
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

export default Terms;
