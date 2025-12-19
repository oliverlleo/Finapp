import React, { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Plus, CreditCard as CreditCardIcon } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { getOpenInvoiceAmount, getAvailableLimit } from '../utils/cardUtils';

export const Cards: React.FC = () => {
  const { getWorkspaceCards, getWorkspaceTransactions, createCard } = useFinanceStore();
  const cards = getWorkspaceCards();
  const transactions = getWorkspaceTransactions();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    limit: '',
    closingDay: '1',
    dueDay: '10',
    initialBalance: '0'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCard({
      name: formData.name,
      brand: 'Visa', // Default
      last4Digits: '0000',
      limit: Number(formData.limit),
      closingDay: Number(formData.closingDay),
      dueDay: Number(formData.dueDay),
      initialBalance: Number(formData.initialBalance)
    });
    setIsModalOpen(false);
    setFormData({ name: '', limit: '', closingDay: '1', dueDay: '10', initialBalance: '0' });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Cartões de Crédito</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus cartões e limites.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus:outline-none transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Cartão
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const usage = getOpenInvoiceAmount(transactions, card.id, card.closingDay || 1);
          const available = getAvailableLimit(card.limit, transactions, card.id, card.closingDay || 1);
          const usagePercentage = Math.min((usage / card.limit) * 100, 100);

          return (
            <div key={card.id} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-5 flex items-center justify-between bg-muted/30 border-b border-border">
                <div className="flex items-center min-w-0 mr-2">
                  <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                    <CreditCardIcon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="ml-3 text-lg font-semibold text-foreground truncate">{card.name}</h3>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary flex-shrink-0">
                  Dia {card.dueDay}
                </span>
              </div>
              <div className="px-6 py-6 flex-1 flex flex-col justify-between">
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Limite Total</dt>
                    <dd className="mt-1 text-sm font-semibold text-foreground">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(card.limit)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Disponível</dt>
                    <dd className="mt-1 text-sm font-semibold text-emerald-500">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(available)}
                    </dd>
                  </div>
                  <div className="col-span-2 pt-2">
                    <dt className="text-sm font-medium text-muted-foreground">Fatura Atual</dt>
                    <dd className="mt-1 text-2xl font-bold text-foreground">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(usage)}
                    </dd>
                  </div>
                </dl>
                <div className="mt-6">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Uso do limite</span>
                    <span>{usagePercentage.toFixed(0)}%</span>
                  </div>
                  <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      style={{ width: `${usagePercentage}%` }}
                      className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-out rounded-full"
                    />
                  </div>
                </div>
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
                  <Dialog.Title className="text-lg font-medium leading-6 text-foreground mb-4">Novo Cartão</Dialog.Title>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground">Nome do Cartão</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                        placeholder="Ex: Nubank, Visa Platinum"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground">Limite</label>
                      <input
                        type="number"
                        required
                        value={formData.limit}
                        onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                        className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground">Dia Fechamento</label>
                        <input
                          type="number"
                          min="1"
                          max="31"
                          required
                          value={formData.closingDay}
                          onChange={(e) => setFormData({ ...formData, closingDay: e.target.value })}
                          className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground">Dia Vencimento</label>
                        <input
                          type="number"
                          min="1"
                          max="31"
                          required
                          value={formData.dueDay}
                          onChange={(e) => setFormData({ ...formData, dueDay: e.target.value })}
                          className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground">Saldo Inicial (Dívida Atual)</label>
                      <input
                        type="number"
                        value={formData.initialBalance}
                        onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
                        className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                        placeholder="0.00"
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
