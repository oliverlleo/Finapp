import React, { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Plus, Trash2, CheckCircle, Clock, Calendar, Repeat, User, Paperclip, ArrowDownCircle, CheckSquare, Square, Pencil } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { clsx } from 'clsx';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export const Receivables: React.FC = () => {
  const { getWorkspaceTransactions, deleteTransaction, createTransaction, updateTransaction, categories, getCurrentWorkspace, uploadAttachment, toggleTransactionStatus } = useFinanceStore();
  const transactions = getWorkspaceTransactions().filter(t => t.type === 'income');
  const workspace = getCurrentWorkspace();
  const members = workspace?.members || [];
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    categoryId: '',
    isRecurring: false,
    recurrenceFrequency: 'monthly',
    recurrenceEndDate: '',
    beneficiaryId: '',
    attachmentUrl: '',
    isReceived: true
  });

  // Calculate totals
  const totalReceived = transactions
    .filter(t => t.status === 'completed')
    .reduce((acc, t) => acc + t.amount, 0);
    
  const totalPending = transactions
    .filter(t => t.status === 'pending')
    .reduce((acc, t) => acc + t.amount, 0);

  const handleOpenSalary = () => {
    setEditingId(null);
    setFormData({
      description: 'Salário',
      amount: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      categoryId: categories.find(c => c.name === 'Salário' && c.type === 'income')?.id || '',
      isRecurring: true,
      recurrenceFrequency: 'monthly',
      recurrenceEndDate: '',
      beneficiaryId: '',
      attachmentUrl: '',
      isReceived: true
    });
    setIsModalOpen(true);
  };

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData({
      description: '',
      amount: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      categoryId: '',
      isRecurring: false,
      recurrenceFrequency: 'monthly',
      recurrenceEndDate: '',
      beneficiaryId: '',
      attachmentUrl: '',
      isReceived: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tx: any) => {
    setEditingId(tx.id);
    setFormData({
      description: tx.description,
      amount: String(tx.amount),
      date: tx.date,
      categoryId: tx.categoryId,
      isRecurring: tx.isRecurring || false,
      recurrenceFrequency: tx.recurrenceFrequency || 'monthly',
      recurrenceEndDate: tx.recurrenceEndDate || '',
      beneficiaryId: tx.beneficiaryId || '',
      attachmentUrl: tx.attachmentUrl || '',
      isReceived: tx.status === 'completed'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) {
      alert('Selecione uma categoria');
      return;
    }

    if (editingId) {
      const isRecurringEdit = formData.isRecurring;
      let updateAll = false;

      if (isRecurringEdit) {
        updateAll = window.confirm('Esta é uma receita recorrente. Deseja aplicar as alterações para todas as futuras repetições? (OK = Sim, Cancelar = Apenas esta)');
      }

      await updateTransaction(editingId, {
        description: formData.description,
        amount: Number(formData.amount),
        date: formData.date,
        type: 'income',
        categoryId: formData.categoryId,
        status: formData.isReceived ? 'completed' : 'pending',
        isRecurring: formData.isRecurring,
        recurrenceFrequency: formData.isRecurring ? formData.recurrenceFrequency as any : undefined,
        recurrenceEndDate: formData.recurrenceEndDate || undefined,
        beneficiaryId: formData.beneficiaryId || undefined,
        attachmentUrl: formData.attachmentUrl
      }, updateAll);
    } else {
      await createTransaction({
        description: formData.description,
        amount: Number(formData.amount),
        date: formData.date,
        type: 'income',
        categoryId: formData.categoryId,
        status: formData.isReceived ? 'completed' : 'pending',
        paymentMethod: 'cash',
        isRecurring: formData.isRecurring,
        recurrenceFrequency: formData.isRecurring ? formData.recurrenceFrequency as any : undefined,
        recurrenceEndDate: formData.isRecurring ? (formData.recurrenceEndDate || undefined) : undefined,
        beneficiaryId: formData.beneficiaryId || undefined,
        attachmentUrl: formData.attachmentUrl
      });
    }

    setIsModalOpen(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Contas a Receber</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas receitas e recebimentos pendentes.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleOpenSalary}
            className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground focus:outline-none transition-colors"
          >
            <Repeat className="h-4 w-4 mr-2 text-emerald-500" />
            Salário Recorrente
          </button>
          <button
            type="button"
            onClick={handleOpenNew}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus:outline-none transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Receita
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <CheckCircle className="h-6 w-6 text-emerald-500" aria-hidden="true" />
            </div>
            <div className="ml-4 min-w-0">
              <p className="text-sm font-medium text-muted-foreground">Recebido</p>
              <p className="text-2xl font-bold text-foreground truncate">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalReceived)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-amber-500/10 rounded-lg flex-shrink-0">
              <Clock className="h-6 w-6 text-amber-500" aria-hidden="true" />
            </div>
            <div className="ml-4 min-w-0">
              <p className="text-sm font-medium text-muted-foreground">Pendente</p>
              <p className="text-2xl font-bold text-foreground truncate">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPending)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View (Cards) */}
      <div className="grid grid-cols-1 gap-4 sm:hidden">
        {transactions.map((transaction) => {
          const category = categories.find(c => c.id === transaction.categoryId);
          const beneficiary = members.find(m => m.userId === transaction.beneficiaryId);

          return (
            <div key={transaction.id} className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="font-medium text-foreground flex items-center gap-2">
                    {transaction.description}
                    {transaction.isRecurring && <Repeat className="h-3 w-3 text-muted-foreground" />}
                    {beneficiary && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">
                        <User className="h-3 w-3 mr-1" />
                        {beneficiary.name || 'Membro'}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-500">
                      {category?.name || 'Sem categoria'}
                    </span>
                  </div>
                </div>
                <div className="text-sm font-medium text-emerald-500 whitespace-nowrap">
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
                    {transaction.status === 'completed' ? 'Recebido' : 'Receber'}
                  </button>
                  <button
                    onClick={() => handleOpenEdit(transaction)}
                    className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (transaction.isRecurring) {
                        const deleteAll = window.confirm('Esta é uma receita recorrente. Deseja apagar TODAS as repetições? (OK = Todas, Cancelar = Apenas esta)');
                        deleteTransaction(transaction.id, deleteAll);
                      } else if (window.confirm('Tem certeza que deseja apagar?')) {
                        deleteTransaction(transaction.id);
                      }
                    }}
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[200px]">Descrição</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[150px]">Categoria</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[120px]">Data</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[120px]">Valor</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[100px]">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[150px]">Beneficiário</th>
                <th scope="col" className="relative px-6 py-3 min-w-[80px]">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {transactions.map((transaction) => {
                const category = categories.find(c => c.id === transaction.categoryId);
                const beneficiary = members.find(m => m.userId === transaction.beneficiaryId);
                
                return (
                  <tr key={transaction.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-foreground">{transaction.description}</div>
                        {transaction.isRecurring && (
                          <Repeat className="ml-2 h-3 w-3 text-muted-foreground" />
                        )}
                        {transaction.attachmentUrl && (
                          <a href={transaction.attachmentUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-muted-foreground hover:text-primary">
                            <Paperclip className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
                        {category?.name || 'Sem categoria'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {format(parseISO(transaction.date), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-500">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        transaction.status === 'completed' 
                          ? "bg-emerald-500/10 text-emerald-500" 
                          : "bg-amber-500/10 text-amber-500"
                      )}>
                        {transaction.status === 'completed' ? 'Recebido' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      <div className="flex items-center">
                        {beneficiary?.avatar ? (
                          <img src={beneficiary.avatar} alt="" className="h-5 w-5 rounded-full mr-2" />
                        ) : (
                          <User className="h-4 w-4 mr-2" />
                        )}
                        {beneficiary?.name || 'Eu mesmo'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(transaction)}
                          className="text-muted-foreground hover:text-primary transition-colors p-1"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (transaction.isRecurring) {
                              const deleteAll = window.confirm('Esta é uma receita recorrente. Deseja apagar TODAS as repetições? (OK = Todas, Cancelar = Apenas esta)');
                              deleteTransaction(transaction.id, deleteAll);
                            } else if (window.confirm('Tem certeza que deseja apagar?')) {
                              deleteTransaction(transaction.id);
                            }
                          }}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-card px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 w-full sm:max-w-lg sm:p-6 border border-border">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium leading-6 text-foreground">
                        {editingId ? 'Editar Receita' : 'Nova Receita'}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {editingId ? 'Altere os dados da receita.' : 'Adicione uma nova receita ou recebimento.'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground">Descrição</label>
                      <input
                        type="text"
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                        placeholder="Ex: Salário, Freelance..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground">Valor</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground">Data</label>
                        <input
                          type="date"
                          required
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                        />
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="isReceived"
                        type="checkbox"
                        checked={formData.isReceived}
                        onChange={(e) => setFormData({ ...formData, isReceived: e.target.checked })}
                        className="h-4 w-4 rounded border-input bg-background text-primary focus:ring-primary"
                      />
                      <label htmlFor="isReceived" className="ml-2 block text-sm text-foreground">
                        Recebido
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground">Categoria</label>
                      <select
                        required
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                      >
                        <option value="">Selecione uma categoria</option>
                        {categories
                          .filter(c => c.type === 'income')
                          .map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground">Anexo (Arquivo)</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
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
                          className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-input bg-background text-foreground p-2 border rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                        />
                      </div>
                      {uploading && <p className="text-xs text-muted-foreground mt-1">Enviando arquivo...</p>}
                      {formData.attachmentUrl && !uploading && (
                        <p className="text-xs text-emerald-500 mt-1 truncate">Arquivo anexado: {formData.attachmentUrl.split('/').pop()}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground">Membro (Beneficiário)</label>
                      <select
                        value={formData.beneficiaryId}
                        onChange={(e) => setFormData({ ...formData, beneficiaryId: e.target.value })}
                        className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                      >
                        <option value="">Eu mesmo</option>
                        {members.map(m => (
                          <option key={m.userId} value={m.userId}>{m.name || 'Usuário'}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="isRecurring"
                        type="checkbox"
                        checked={formData.isRecurring}
                        onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                        className="h-4 w-4 rounded border-input bg-background text-primary focus:ring-primary"
                      />
                      <label htmlFor="isRecurring" className="ml-2 block text-sm text-foreground">
                        Receita Recorrente (Salário)
                      </label>
                    </div>

                    {formData.isRecurring && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground">Frequência</label>
                          <select
                            value={formData.recurrenceFrequency}
                            onChange={(e) => setFormData({ ...formData, recurrenceFrequency: e.target.value })}
                            className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                          >
                            <option value="monthly">Mensal</option>
                            <option value="weekly">Semanal</option>
                            <option value="yearly">Anual</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground">Data Final (Opcional)</label>
                          <input
                            type="date"
                            value={formData.recurrenceEndDate}
                            onChange={(e) => setFormData({ ...formData, recurrenceEndDate: e.target.value })}
                            className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                          />
                        </div>
                      </div>
                    )}

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
