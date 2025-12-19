import React, { useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { ChevronDown, Building2, User, Plus } from 'lucide-react';
import { Menu, Transition, Dialog } from '@headlessui/react';
import { Fragment } from 'react';
import { clsx } from 'clsx';

export const WorkspaceSelector: React.FC = () => {
  const { workspaces, currentWorkspaceId, switchWorkspace, createWorkspace } = useFinanceStore();
  const currentWorkspace = workspaces.find(w => w.id === currentWorkspaceId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName) return;
    const result = await createWorkspace(newWorkspaceName);
    if (result?.error) {
      alert(`Erro ao criar workspace: ${result.error.message || JSON.stringify(result.error)}`);
    } else {
      setNewWorkspaceName('');
      setIsModalOpen(false);
      alert('Workspace criado com sucesso!');
    }
  };

  return (
    <>
      <Menu as="div" className="relative inline-block text-left max-w-[120px] sm:max-w-xs flex-shrink">
        <div>
          <Menu.Button className="inline-flex w-full justify-center items-center gap-x-1 sm:gap-x-2 rounded-lg bg-background/50 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-foreground shadow-sm ring-1 ring-inset ring-border hover:bg-accent hover:text-accent-foreground transition-colors">
            {currentWorkspace?.name.includes('Família') ? <Building2 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" /> : <User className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />}
            <span className="truncate">{currentWorkspace?.name}</span>
            <ChevronDown className="-mr-1 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute left-0 z-10 mt-2 w-56 origin-top-left rounded-lg bg-popover shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-border">
            <div className="p-1">
              {workspaces.map((workspace) => (
                <Menu.Item key={workspace.id}>
                  {({ active }) => (
                    <button
                      onClick={() => switchWorkspace(workspace.id)}
                      className={clsx(
                        active ? 'bg-accent text-accent-foreground' : 'text-foreground',
                        'block w-full px-3 py-2 text-left text-sm rounded-md transition-colors truncate'
                      )}
                    >
                      {workspace.name}
                    </button>
                  )}
                </Menu.Item>
              ))}
              <div className="my-1 border-t border-border"></div>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className={clsx(
                      active ? 'bg-accent text-accent-foreground' : 'text-primary',
                      'block w-full px-3 py-2 text-left text-sm font-medium flex items-center rounded-md transition-colors'
                    )}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar novo workspace
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>

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
                  <Dialog.Title className="text-lg font-medium leading-6 text-foreground mb-4">Criar Novo Workspace</Dialog.Title>
                  <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground">Nome do Workspace</label>
                      <input
                        type="text"
                        required
                        value={newWorkspaceName}
                        onChange={(e) => setNewWorkspaceName(e.target.value)}
                        className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                        placeholder="Ex: Minha Empresa, Família..."
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
                        Criar
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};
