import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRaffleStore } from '@/store/raffleStore';
import { Logo } from '@/components/samvyt/Logo';
import { StatCard } from '@/components/samvyt/StatCard';
import { ProgressBar } from '@/components/samvyt/ProgressBar';
import { PrimaryButton } from '@/components/samvyt/PrimaryButton';
import { 
  Grid3X3, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Users, 
  FileText,
  Trophy,
  ArrowLeft,
  Search,
  Download,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Admin = () => {
  const { quotas, getStats, config, initializeQuotas } = useRaffleStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'sold' | 'pending' | 'available'>('sold');

  useEffect(() => {
    if (quotas.length === 0) {
      initializeQuotas();
    }
  }, [quotas.length, initializeQuotas]);

  const stats = getStats();

  // Get participants (sold quotas grouped by user)
  const participants = React.useMemo(() => {
    const grouped: Record<string, { name: string; email?: string; quotas: string[]; date?: Date }> = {};
    
    quotas
      .filter(q => q.status === 'sold' && q.userName)
      .forEach(quota => {
        const key = quota.userEmail || quota.userName || 'unknown';
        if (!grouped[key]) {
          grouped[key] = {
            name: quota.userName || 'Desconhecido',
            email: quota.userEmail,
            quotas: [],
            date: quota.purchaseDate,
          };
        }
        grouped[key].quotas.push(quota.number);
      });

    return Object.entries(grouped).map(([key, data]) => ({
      id: key,
      ...data,
    }));
  }, [quotas]);

  const filteredQuotas = React.useMemo(() => {
    return quotas.filter(q => {
      if (filterStatus !== 'all' && q.status !== filterStatus) return false;
      if (searchTerm && !q.number.includes(searchTerm) && 
          !q.userName?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [quotas, filterStatus, searchTerm]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft size={20} />
              </Link>
              <Logo size="sm" />
            </div>
            <h1 className="text-lg font-display font-semibold text-foreground">
              Painel Administrativo
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total de Cotas"
            value={stats.totalQuotas.toLocaleString()}
            icon={<Grid3X3 size={24} />}
            color="cyan"
          />
          <StatCard
            title="Vendidas"
            value={stats.soldQuotas.toLocaleString()}
            subtitle={`${stats.percentage.toFixed(1)}%`}
            icon={<CheckCircle size={24} />}
            color="green"
          />
          <StatCard
            title="Pendentes"
            value={stats.pendingQuotas.toLocaleString()}
            icon={<Clock size={24} />}
            color="yellow"
          />
          <StatCard
            title="Receita Total"
            value={`R$ ${stats.revenue.toLocaleString()}`}
            subtitle={`Meta: R$ ${stats.totalQuotas.toLocaleString()}`}
            icon={<DollarSign size={24} />}
            color="green"
          />
        </div>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-6 mb-8"
        >
          <h2 className="text-lg font-display font-semibold text-foreground mb-4">
            Progresso Geral
          </h2>
          <ProgressBar value={stats.soldQuotas} max={stats.totalQuotas} size="lg" />
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Sorteio: {format(config.drawDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </span>
            <span className="text-primary font-medium">{config.drawMethod}</span>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <PrimaryButton variant="primary">
            <Trophy size={18} />
            Realizar Sorteio
          </PrimaryButton>
          <PrimaryButton variant="outline">
            <FileText size={18} />
            Exportar Relatório
          </PrimaryButton>
          <PrimaryButton variant="outline">
            <Users size={18} />
            Ver Todos Participantes
          </PrimaryButton>
        </div>

        {/* Participants List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl overflow-hidden mb-8"
        >
          <div className="p-6 border-b border-border">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-lg font-display font-semibold text-foreground">
                Participantes ({participants.length})
              </h2>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-input border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary w-48"
                  />
                </div>
                <button className="p-2 bg-secondary rounded-lg hover:bg-secondary/80">
                  <Download size={18} className="text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Participante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Cotas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {participants.slice(0, 10).map((participant) => (
                  <tr key={participant.id} className="hover:bg-secondary/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                          <span className="text-primary text-sm font-medium">
                            {participant.name[0]?.toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-foreground">{participant.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {participant.email || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                        {participant.quotas.length} cotas
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-success">
                      R$ {(participant.quotas.length * config.pricePerQuota).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {participant.date ? format(participant.date, 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {participants.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                Nenhum participante encontrado
              </div>
            )}
          </div>
        </motion.div>

        {/* Quota Grid Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-foreground">
              Visualização de Cotas
            </h2>
            <div className="flex items-center gap-2">
              {(['all', 'sold', 'pending', 'available'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    filterStatus === status
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {status === 'all' ? 'Todas' : 
                   status === 'sold' ? 'Vendidas' :
                   status === 'pending' ? 'Pendentes' : 'Disponíveis'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-20 lg:grid-cols-25 gap-0.5 max-h-64 overflow-y-auto scrollbar-thin">
            {filteredQuotas.slice(0, 500).map((quota) => (
              <div
                key={quota.number}
                title={`${quota.number} - ${quota.status}`}
                className={`aspect-square text-[6px] flex items-center justify-center rounded-sm ${
                  quota.status === 'sold' ? 'bg-success/60' :
                  quota.status === 'pending' ? 'bg-warning/60' :
                  'bg-secondary'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-6 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-secondary" />
              <span className="text-muted-foreground">Disponível</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-success/60" />
              <span className="text-muted-foreground">Vendida</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-warning/60" />
              <span className="text-muted-foreground">Pendente</span>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Admin;
