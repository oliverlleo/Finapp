import React, { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Plus, Trash2, Upload, Repeat, Tag, Paperclip, ArrowRightLeft, CheckSquare, Square, User, Calendar } from 'lucide-react';
import { format, parseISO, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { clsx } from 'clsx';
import { StatementImport } from '../components/transactions/StatementImport';

export const Transactions: React.FC = () => {
  const { getWorkspaceTransactions, categories, cards, createTransaction, deleteTransaction, toggleTransactionStatus, getCurrentWorkspace, uploadAttachment } = useFinanceStore();
  const transactions = getWorkspaceTransactions();
  const workspace = getCurrentWorkspace();
  const members = workspace?.members || [];
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'expense',
    categoryId: '',
    cardId: '',
    isRecurring: false,
    recurrenceFrequency: 'monthly',
    recurrenceEndDate: '',
    beneficiaryId: '',
    attachmentUrl: '',
    tags: '',
    isInstallment: false,
    installmentsCount: 2,
    transferAccountId: '',
    isPaid: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId && formData.type !== 'transfer') {
      alert('Por favor, selecione uma categoria.');
      return;
    }

    const baseTransaction = {
      description: formData.description,
      amount: Number(formData.amount),
      date: formData.date,
      type: formData.type as any,
      categoryId: formData.categoryId,
      status: formData.isPaid ? 'completed' : 'pending' as any,
      paymentMethod: formData.cardId ? 'credit' : 'cash',
      cardId: formData.cardId || undefined,
      isRecurring: formData.isRecurring,
      recurrenceFrequency: formData.isRecurring ? formData.recurrenceFrequency as any : undefined,
      recurrenceEndDate: formData.recurrenceEndDate || undefined,
      attachmentUrl: formData.attachmentUrl,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
      transferAccountId: formData.type === 'transfer' ? formData.transferAccountId : undefined,
      beneficiaryId: formData.beneficiaryId || undefined
    };

    if (formData.isInstallment && formData.installmentsCount > 1 && formData.type === 'expense') {
      for (let i = 0; i < formData.installmentsCount; i++) {
        const date = addMonths(parseISO(formData.date), i);
        await createTransaction({
          ...baseTransaction,
          description: `${formData.description} (${i + 1}/${formData.installmentsCount})`,
          date: format(date, 'yyyy-MM-dd'),
          status: i === 0 && formData.isPaid ? 'completed' : 'pending' // Only first installment is paid if selected
        });
      }
    } else {
      await createTransaction(baseTransaction);
    }

    setIsModalOpen(false);
    setFormData({
      description: '',
      amount: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      type: 'expense',
      categoryId: '',
      cardId: '',
      isRecurring: false,
      recurrenceFrequency: 'monthly',
      recurrenceEndDate: '',
      beneficiaryId: '',
      attachmentUrl: '',
      tags: '',
      isInstallment: false,
      installmentsCount: 2,
      transferAccountId: '',
      isPaid: true
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Transações</h1>
          <p className="text-muted-foreground mt-1">
            Lista de todas as suas receitas, despesas e transferências.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsImportOpen(true)}
            className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground focus:outline-none transition-colors w-full sm:w-auto"
          >
            <Upload className="h-4 w-4 mr-2" />
            Importar Extrato
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus:outline-none transition-colors w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Transação
          </button>
        </div>
      </div>

      {/* Mobile View (Cards) */}
      <div className="grid grid-cols-1 gap-4 sm:hidden">
        {transactions.map((transaction) => {
          const category = categories.find(c => c.id === transaction.categoryId);
          const card = cards.find(c => c.id === transaction.cardId);
          const beneficiary = members.find(m => m.userId === transaction.beneficiaryId);

          return (
            <div key={transaction.id} className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="font-medium text-foreground flex items-center gap-2">
                    {transaction.description}
                    {transaction.isRecurring && <Repeat className="h-3 w-3 text-muted-foreground" />}
                    {transaction.type === 'transfer' && <ArrowRightLeft className="h-3 w-3 text-blue-500" />}
                  </div>
                  <div className="text-xs text-muted-foreground flex flex-wrap gap-1">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                      {category?.name || (transaction.type === 'transfer' ? 'Transferência' : 'Sem categoria')}
                    </span>
                    {card && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                        {card.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className={clsx(
                  "text-sm font-medium whitespace-nowrap",
                  transaction.type === 'income' ? "text-emerald-500" : 
                  transaction.type === 'expense' ? "text-destructive" : "text-blue-500"
                )}>
                  {transaction.type === 'expense' ? '-' : transaction.type === 'income' ? '+' : ''}
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transaction.amount)}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(parseISO(transaction.date), 'dd/MM/yyyy')}
                  </span>
                  {beneficiary && (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {beneficiary.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {transaction.attachmentUrl && (
                    <a href={transaction.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                      <Paperclip className="h-4 w-4" />
                    </a>
                  )}
                  <button 
                    onClick={() => toggleTransactionStatus(transaction.id, transaction.status)}
                    className={clsx(
                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                      transaction.status === 'completed' 
                        ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" 
                        : "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                    )}
                  >
                    {transaction.status === 'completed' ? <CheckSquare className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
                    {transaction.status === 'completed' ? 'Pago' : 'Pagar'}
                  </button>
                  <button
                    onClick={() => deleteTransaction(transaction.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop View (Table) */}
      <div className="hidden sm:block bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-muted-foreground sm:pl-6 w-10">
                  <span className="sr-only">Status</span>
                </th>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-muted-foreground sm:pl-6 min-w-[200px]">
                  Descrição
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-muted-foreground min-w-[150px]">
                  Categoria
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-muted-foreground min-w-[120px]">
                  Data
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-muted-foreground min-w-[150px]">
                  Membro
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-muted-foreground min-w-[120px]">
                  Valor
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-muted-foreground w-10">
                  <span className="sr-only">Anexo</span>
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 min-w-[80px]">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {transactions.map((transaction) => {
                const category = categories.find(c => c.id === transaction.categoryId);
                const card = cards.find(c => c.id === transaction.cardId);
                const beneficiary = members.find(m => m.userId === transaction.beneficiaryId);

                return (
                  <tr key={transaction.id} className="hover:bg-muted/50 transition-colors">
                    <td className="pl-4 pr-3 py-4 text-sm sm:pl-6">
                      <button 
                        onClick={() => toggleTransactionStatus(transaction.id, transaction.status)}
                        className={clsx(
                          "transition-colors",
                          transaction.status === 'completed' ? "text-emerald-500" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {transaction.status === 'completed' ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                      </button>
                    </td>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div className="flex items-center">
                        <div className="font-medium text-foreground">{transaction.description}</div>
                        {transaction.isRecurring && (
                          <Repeat className="ml-2 h-3 w-3 text-muted-foreground" />
                        )}
                        {transaction.type === 'transfer' && (
                          <ArrowRightLeft className="ml-2 h-3 w-3 text-blue-500" />
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground flex gap-1 mt-1">
                        {card && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                            {card.name}
                          </span>
                        )}
                        {transaction.tags?.map(tag => (
                          <span key={tag} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                        {category?.name || (transaction.type === 'transfer' ? 'Transferência' : 'Sem categoria')}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                      {format(parseISO(transaction.date), 'dd/MM/yyyy')}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        {beneficiary?.avatar ? (
                          <img src={beneficiary.avatar} alt="" className="h-5 w-5 rounded-full mr-2" />
                        ) : (
                          <User className="h-4 w-4 mr-2" />
                        )}
                        {beneficiary?.name || 'Eu mesmo'}
                      </div>
                    </td>
                    <td className={clsx(
                      "whitespace-nowrap px-3 py-4 text-sm font-medium",
                      transaction.type === 'income' ? "text-emerald-500" : 
                      transaction.type === 'expense' ? "text-destructive" : "text-blue-500"
                    )}>
                      {transaction.type === 'expense' ? '-' : transaction.type === 'income' ? '+' : ''}
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transaction.amount)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                      {transaction.attachmentUrl && (
                        <a href={transaction.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                          <Paperclip className="h-4 w-4" />
                        </a>
                      )}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button
                        onClick={() => deleteTransaction(transaction.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Transition show={isModalOpen} as={Fragment}>
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
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-card px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 border border-border">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-foreground mb-4"
                  >
                    Nova Transação
                  </Dialog.Title>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Tipo</label>
                      <div className="flex rounded-md shadow-sm">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, type: 'expense' })}
                          className={clsx(
                            "relative inline-flex items-center px-4 py-2 rounded-l-md border text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-primary flex-1 justify-center transition-colors",
                            formData.type === 'expense' 
                              ? "bg-destructive/10 border-destructive/20 text-destructive z-10" 
                              : "bg-card border-input text-muted-foreground hover:bg-accent"
                          )}
                        >
                          Despesa
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, type: 'income' })}
                          className={clsx(
                            "relative -ml-px inline-flex items-center px-4 py-2 border text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-primary flex-1 justify-center transition-colors",
                            formData.type === 'income' 
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 z-10" 
                              : "bg-card border-input text-muted-foreground hover:bg-accent"
                          )}
                        >
                          Receita
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, type: 'transfer' })}
                          className={clsx(
                            "relative -ml-px inline-flex items-center px-4 py-2 rounded-r-md border text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-primary flex-1 justify-center transition-colors",
                            formData.type === 'transfer' 
                              ? "bg-blue-500/10 border-blue-500/20 text-blue-500 z-10" 
                              : "bg-card border-input text-muted-foreground hover:bg-accent"
                          )}
                        >
                          Transf.
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Descrição</label>
                      <input
                        type="text"
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="block w-full rounded-md border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Valor</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          className="block w-full rounded-md border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Data</label>
                        <input
                          type="date"
                          required
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="block w-full rounded-md border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                        />
                      </div>
                    </div>

                    {formData.type !== 'transfer' && (
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Categoria</label>
                        <select
                          required
                          value={formData.categoryId}
                          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                          className="block w-full rounded-md border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                        >
                          <option value="">Selecione uma categoria</option>
                          {categories
                            .filter(c => c.type === formData.type)
                            .map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    )}

                    {formData.type === 'expense' && (
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Cartão de Crédito (Opcional)</label>
                        <select
                          value={formData.cardId}
                          onChange={(e) => setFormData({ ...formData, cardId: e.target.value })}
                          className="block w-full rounded-md border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                        >
                          <option value="">Nenhum (Dinheiro/Débito)</option>
                          {cards.map((card) => (
                            <option key={card.id} value={card.id}>
                              {card.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {formData.type === 'transfer' && (
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Conta de Destino</label>
                        <select
                          required
                          value={formData.transferAccountId}
                          onChange={(e) => setFormData({ ...formData, transferAccountId: e.target.value })}
                          className="block w-full rounded-md border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                        >
                          <option value="">Selecione a conta</option>
                          {cards.map((card) => (
                            <option key={card.id} value={card.id}>
                              {card.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Membro (Beneficiário)</label>
                      <select
                        value={formData.beneficiaryId}
                        onChange={(e) => setFormData({ ...formData, beneficiaryId: e.target.value })}
                        className="block w-full rounded-md border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                      >
                        <option value="">Eu mesmo</option>
                        {members.map(m => (
                          <option key={m.userId} value={m.userId}>{m.name || 'Usuário'}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="isPaid"
                          type="checkbox"
                          checked={formData.isPaid}
                          onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
                          className="h-4 w-4 rounded border-input text-primary focus:ring-primary bg-background"
                        />
                        <label htmlFor="isPaid" className="ml-2 block text-sm text-foreground">
                          {formData.type === 'income' ? 'Recebido' : 'Pago'}
                        </label>
                      </div>

                      {formData.type === 'expense' && (
                        <div className="flex items-center">
                          <input
                            id="isInstallment"
                            type="checkbox"
                            checked={formData.isInstallment}
                            onChange={(e) => setFormData({ ...formData, isInstallment: e.target.checked })}
                            className="h-4 w-4 rounded border-input text-primary focus:ring-primary bg-background"
                          />
                          <label htmlFor="isInstallment" className="ml-2 block text-sm text-foreground">
                            Parcelado
                          </label>
                        </div>
                      )}
                    </div>

                    {formData.isInstallment && (
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Número de Parcelas</label>
                        <input
                          type="number"
                          min="2"
                          max="120"
                          value={formData.installmentsCount}
                          onChange={(e) => setFormData({ ...formData, installmentsCount: Number(e.target.value) })}
                          className="block w-full rounded-md border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                        />
                      </div>
                    )}

                    {!formData.isInstallment && (
                      <div className="flex items-center">
                        <input
                          id="isRecurring"
                          type="checkbox"
                          checked={formData.isRecurring}
                          onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                          className="h-4 w-4 rounded border-input text-primary focus:ring-primary bg-background"
                        />
                        <label htmlFor="isRecurring" className="ml-2 block text-sm text-foreground">
                          Transação Recorrente
                        </label>
                      </div>
                    )}

                    {formData.isRecurring && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">Frequência</label>
                          <select
                            value={formData.recurrenceFrequency}
                            onChange={(e) => setFormData({ ...formData, recurrenceFrequency: e.target.value })}
                            className="block w-full rounded-md border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                          >
                            <option value="monthly">Mensal</option>
                            <option value="weekly">Semanal</option>
                            <option value="yearly">Anual</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">Data Final (Opcional)</label>
                          <input
                            type="date"
                            value={formData.recurrenceEndDate}
                            onChange={(e) => setFormData({ ...formData, recurrenceEndDate: e.target.value })}
                            className="block w-full rounded-md border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Tags (separadas por vírgula)</label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <input
                          type="text"
                          value={formData.tags}
                          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                          placeholder="viagem, trabalho, reembolso"
                          className="block w-full pl-10 rounded-md border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Anexo (Arquivo)</label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Paperclip className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <input
                          type="file"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setUploading(true);
                              const url = await uploadAttachment(file);
                              setUploading(false);
                              if (url) {
                                setFormData({ ...formData, attachmentUrl: url });
                              } else {
                                alert('Erro ao fazer upload do arquivo.');
                              }
                            }
                          }}
                          className="block w-full pl-10 rounded-md border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                      </div>
                      {uploading && <p className="text-xs text-muted-foreground mt-1">Enviando arquivo...</p>}
                      {formData.attachmentUrl && !uploading && (
                        <p className="text-xs text-emerald-500 mt-1 truncate">Arquivo anexado: {formData.attachmentUrl.split('/').pop()}</p>
                      )}
                    </div>

                    <div className="mt-6 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="inline-flex w-full justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="inline-flex w-full justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
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
      </Transition>

      <StatementImport isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
    </div>
  );
};
