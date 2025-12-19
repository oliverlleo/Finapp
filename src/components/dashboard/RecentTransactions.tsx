import React from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowUpCircle, ArrowDownCircle, CreditCard, Banknote } from 'lucide-react';
import { clsx } from 'clsx';

export const RecentTransactions: React.FC = () => {
  const { getWorkspaceTransactions, categories, cards } = useFinanceStore();
  const transactions = getWorkspaceTransactions()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5); // Show only last 5

  const getCategory = (id: string) => categories.find(c => c.id === id);
  const getCard = (id?: string) => cards.find(c => c.id === id);

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-border">
        <h3 className="text-lg font-semibold leading-6 text-foreground">Últimas Transações</h3>
      </div>
      <ul role="list" className="divide-y divide-border">
        {transactions.map((transaction) => {
          const category = getCategory(transaction.categoryId);
          const card = getCard(transaction.cardId);
          const isExpense = transaction.type === 'expense';

          return (
            <li key={transaction.id} className="px-6 py-4 hover:bg-accent/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={clsx(
                    "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center",
                    isExpense ? "bg-rose-500/10" : "bg-emerald-500/10"
                  )}>
                    {isExpense ? (
                      <ArrowDownCircle className="h-6 w-6 text-rose-500" />
                    ) : (
                      <ArrowUpCircle className="h-6 w-6 text-emerald-500" />
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-foreground">{transaction.description}</p>
                    <div className="flex items-center text-sm text-muted-foreground mt-0.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground mr-2">
                        {category?.name}
                      </span>
                      {transaction.paymentMethod === 'credit' && card && (
                        <span className="flex items-center text-xs">
                          <CreditCard className="h-3 w-3 mr-1" />
                          {card.name}
                        </span>
                      )}
                      {transaction.paymentMethod === 'cash' && (
                        <span className="flex items-center text-xs">
                          <Banknote className="h-3 w-3 mr-1" />
                          Dinheiro
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p className={clsx(
                    "text-sm font-semibold",
                    isExpense ? "text-rose-500" : "text-emerald-500"
                  )}>
                    {isExpense ? '-' : '+'}
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transaction.amount)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(parseISO(transaction.date), "d 'de' MMM", { locale: ptBR })}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
        {transactions.length === 0 && (
          <li className="px-6 py-10 text-center text-muted-foreground">
            Nenhuma transação encontrada neste workspace.
          </li>
        )}
      </ul>
    </div>
  );
};
