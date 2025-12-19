import React, { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Plus, Trash2, FolderPlus } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { clsx } from 'clsx';
import { Fragment } from 'react';

export const Categories: React.FC = () => {
  const { categories, createCategory } = useFinanceStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    color: '#000000',
    parentId: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCategory({
      name: formData.name,
      type: formData.type as any,
      color: formData.color,
      parentId: formData.parentId || undefined
    });
    setIsModalOpen(false);
    setFormData({ name: '', type: 'expense', color: '#000000', parentId: '' });
  };

  const rootCategories = categories.filter(c => !c.parentId);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Categorias</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas categorias de receitas e despesas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus:outline-none transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </button>
      </div>

      {/* Mobile View (Cards) */}
      <div className="grid grid-cols-1 gap-4 sm:hidden">
        {rootCategories.map((category) => {
          const subcategories = categories.filter(c => c.parentId === category.id);
          return (
            <div key={category.id} className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full ring-1 ring-border" style={{ backgroundColor: category.color }} />
                  <span className="font-medium text-foreground">{category.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {category.type === 'income' ? 'Receita' : 'Despesa'}
                </span>
              </div>
              {subcategories.length > 0 && (
                <div className="pl-4 space-y-2 border-l-2 border-border ml-2">
                  {subcategories.map(sub => (
                    <div key={sub.id} className="flex items-center justify-between text-sm py-1">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full ring-1 ring-border" style={{ backgroundColor: sub.color }} />
                        <span className="text-foreground">{sub.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[200px]">
                  Nome
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[100px]">
                  Tipo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[80px]">
                  Cor
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {rootCategories.map((category) => {
                const subcategories = categories.filter(c => c.parentId === category.id);
                return (
                  <React.Fragment key={category.id}>
                    <tr className="bg-muted/30">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {category.type === 'income' ? 'Receita' : 'Despesa'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        <div className="h-4 w-4 rounded-full ring-1 ring-border" style={{ backgroundColor: category.color }} />
                      </td>
                    </tr>
                    {subcategories.map(sub => (
                      <tr key={sub.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground pl-10 flex items-center">
                          <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full mr-3" />
                          {sub.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {sub.type === 'income' ? 'Receita' : 'Despesa'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          <div className="h-4 w-4 rounded-full ring-1 ring-border" style={{ backgroundColor: sub.color }} />
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
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
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-card px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 w-full sm:max-w-sm sm:p-6 border border-border">
                  <Dialog.Title className="text-lg font-medium leading-6 text-foreground mb-4">Nova Categoria</Dialog.Title>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground">Nome</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground">Tipo</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                      >
                        <option value="expense">Despesa</option>
                        <option value="income">Receita</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground">Cor</label>
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="mt-1 block w-full h-10 rounded-md border-input bg-background shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-1 border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground">Categoria Pai (Opcional)</label>
                      <select
                        value={formData.parentId}
                        onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                        className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                      >
                        <option value="">Nenhuma (Raiz)</option>
                        {rootCategories
                          .filter(c => c.type === formData.type)
                          .map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                      </select>
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
