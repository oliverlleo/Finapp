import React from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { ArrowUpCircle, ArrowDownCircle, Wallet, TrendingUp } from 'lucide-react';
import { clsx } from 'clsx';

export const SummaryCards: React.FC = () => {
  const { getFinancialSummary } = useFinanceStore();
  const { income, expense, balance, predicted } = getFinancialSummary();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const cards = [
    {
      title: 'Saldo Atual',
      value: balance,
      icon: Wallet,
      color: 'text-primary',
      bgIcon: 'bg-primary/10',
    },
    {
      title: 'Receitas (Mês)',
      value: income,
      icon: ArrowUpCircle,
      color: 'text-emerald-500',
      bgIcon: 'bg-emerald-500/10',
    },
    {
      title: 'Despesas (Mês)',
      value: expense,
      icon: ArrowDownCircle,
      color: 'text-rose-500',
      bgIcon: 'bg-rose-500/10',
    },
    {
      title: 'Saldo Previsto',
      value: predicted,
      icon: TrendingUp,
      color: 'text-blue-500',
      bgIcon: 'bg-blue-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <div 
          key={index}
          className="overflow-hidden rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-all duration-200"
        >
          <div className="p-6">
            <div className="flex items-center">
              <div className={clsx("flex-shrink-0 rounded-lg p-3", card.bgIcon)}>
                <card.icon className={clsx("h-6 w-6", card.color)} aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-muted-foreground">{card.title}</dt>
                  <dd>
                    <div className="text-2xl font-bold text-foreground mt-1">{formatCurrency(card.value)}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
