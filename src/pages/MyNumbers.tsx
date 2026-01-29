import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/samvyt/Header';
import { Footer } from '@/components/samvyt/Footer';
import { Input } from '@/components/samvyt/Input';
import { PrimaryButton } from '@/components/samvyt/PrimaryButton';
import { useRaffleStore } from '@/store/raffleStore';
import { Search, Ticket, AlertCircle } from 'lucide-react';

const MyNumbers = () => {
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState<{ found: boolean; quotas: string[] } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const { quotas, initializeQuotas } = useRaffleStore();

  useEffect(() => {
    if (quotas.length === 0) {
      initializeQuotas();
    }
  }, [quotas.length, initializeQuotas]);

  const handleSearch = async () => {
    if (!searchEmail.trim()) return;
    
    setIsSearching(true);
    
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find quotas by email
    const userQuotas = quotas
      .filter(q => q.userEmail?.toLowerCase() === searchEmail.toLowerCase())
      .map(q => q.number);
    
    setSearchResult({
      found: userQuotas.length > 0,
      quotas: userQuotas,
    });
    
    setIsSearching(false);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                Meus <span className="text-gradient-cyan">Números</span>
              </h1>
              <p className="text-muted-foreground">
                Digite seu e-mail para consultar seus números da rifa
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 md:p-8">
              <div className="space-y-4">
                <Input
                  label="E-mail cadastrado"
                  type="email"
                  placeholder="seu@email.com"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  icon={<Search size={18} />}
                />
                
                <PrimaryButton
                  fullWidth
                  size="lg"
                  onClick={handleSearch}
                  isLoading={isSearching}
                  disabled={!searchEmail.trim()}
                >
                  <Search size={18} />
                  Consultar
                </PrimaryButton>
              </div>

              {/* Results */}
              {searchResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 pt-8 border-t border-border"
                >
                  {searchResult.found ? (
                    <>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center">
                          <Ticket className="text-success" size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            Encontramos seus números!
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Você possui {searchResult.quotas.length} cota(s)
                          </p>
                        </div>
                      </div>

                      <div className="bg-secondary/50 rounded-lg p-4">
                        <p className="text-sm font-medium text-foreground mb-3">
                          Seus números:
                        </p>
                        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto scrollbar-thin">
                          {searchResult.quotas.map((num) => (
                            <span
                              key={num}
                              className="px-3 py-1 bg-primary/20 text-primary font-mono text-sm rounded"
                            >
                              {num}
                            </span>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/30 rounded-lg">
                      <AlertCircle className="text-warning shrink-0 mt-0.5" size={20} />
                      <div>
                        <p className="font-medium text-foreground">
                          Nenhum número encontrado
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Não encontramos nenhuma compra associada a este e-mail. 
                          Verifique se digitou corretamente ou se utilizou outro endereço.
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Info */}
            <p className="text-xs text-muted-foreground text-center mt-6">
              Apenas participantes com pagamento confirmado aparecem nesta consulta.
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyNumbers;
