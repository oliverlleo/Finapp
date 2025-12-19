import React, { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Plus, Trash2, Target, Pencil } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { clsx } from 'clsx';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { Fragment } from 'react';

export const Budgets: React.FC = () => {
  const { getWorkspaceBudgets, getWorkspaceTransactions, categories, createBudget, updateBudget, deleteBudget } = useFinanceStore();
  const budgets = getWorkspaceBudgets();
  const transactions = getWorkspaceTransactions();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    period: 'monthly'
  });

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData({ categoryId: '', amount: '', period: 'monthly' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (budget: any) => {
    setEditingId(budget.id);
    setFormData({
      categoryId: budget.categoryId,
      amount: String(budget.amount),
      period: budget.period || 'monthly'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      await updateBudget(editingId, {
        amount: Number(formData.amount),
        period: formData.period as 'monthly' | 'yearly'
      });
    } else {
      await createBudget({
        categoryId: formData.categoryId,
        amount: Number(formData.amount),
        period: formData.period as 'monthly' | 'yearly',
        rollover: false
      });
    }

    setIsModalOpen(false);
    setFormData({ categoryId: '', amount: '', period: 'monthly' });
    setEditingId(null);
  };

  const getBudgetProgress = (categoryId: string, amount: number) => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);

    const spent = transactions
      .filter(t => 
        t.categoryId === categoryId && 
        t.type === 'expense' &&
        isWithinInterval(parseISO(t.date), { start, end })
      )
      .reduce((acc, t) => acc + t.amount, 0);

    const percentage = Math.min((spent / amount) * 100, 100);
    return { spent, percentage };
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Metas de Orçamento</h1>
          <p className="text-muted-foreground mt-1">
            Defina limites de gastos por categoria para o mês atual.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenNew}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus:outline-none transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Meta
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {budgets.map((budget) => {
          const category = categories.find(c => c.id === budget.categoryId);
          const { spent, percentage } = getBudgetProgress(budget.categoryId, budget.amount);
          const isOverBudget = spent > budget.amount;

          return (
            <div key={budget.id} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-5 flex items-center justify-between bg-muted/30 border-b border-border">
                <div className="flex items-center min-w-0 mr-2">
                  <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="ml-3 text-lg font-semibold text-foreground truncate">{category?.name}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(budget)}
                    className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Tem certeza que deseja apagar esta meta?')) {
                        deleteBudget(budget.id);
                      }
                    }}
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="px-6 py-6 flex-1">
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className={isOverBudget ? "text-destructive" : "text-foreground"}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(spent)}
                  </span>
                  <span className="text-muted-foreground">
                    de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(budget.amount)}
                  </span>
                </div>
                
                <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={clsx(
                      "h-2.5 rounded-full transition-all duration-500 ease-out",
                      isOverBudget ? "bg-destructive" : percentage > 80 ? "bg-amber-500" : "bg-emerald-500"
                    )}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground text-right">
                  {percentage.toFixed(1)}% utilizado
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <Transition.Root show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setIsModalOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-card px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 w-full sm:max-w-sm sm:p-6 border border-border">
                  <Dialog.Title className="text-lg font-medium leading-6 text-foreground mb-4">
                    {editingId ? 'Editar Meta' : 'Nova Meta'}
                  </Dialog.Title>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground">Categoria</label>
                      <select
                        disabled={!!editingId}
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border disabled:opacity-50"
                        required
                      >
                        <option value="">Selecione...</option>
                        {categories
                          .filter(c => c.type === 'expense')
                          .map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground">Limite Mensal</label>
                      <input
                        type="number"
                        required
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                      />
                    </div>

                    <div className="mt-5 sm:mt-6 flex gap-2">
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md border border-input bg-background px-4 py-2 text-base font-medium text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground focus:outline-none sm:text-sm transition-colors"
                        onClick={() => setIsModalOpen(false)}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="inline-flex w-full justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-base font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none sm:text-sm transition-colors"
                      >
                        Salvar
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
};
