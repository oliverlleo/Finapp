import React, { useState, useRef } from 'react';
import { Upload, FileText, Check, AlertCircle } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Fragment } from 'react';

interface StatementImportProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StatementImport: React.FC<StatementImportProps> = ({ isOpen, onClose }) => {
  const { createTransaction, categories } = useFinanceStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setMessage('');
    }
  };

  const parseCSV = async (text: string) => {
    const lines = text.split('\n');
    let count = 0;
    
    // Simple CSV parser: Date,Description,Amount
    // Example: 2025-12-18,Uber,25.90
    
    for (const line of lines) {
      const [date, description, amountStr] = line.split(',');
      if (!date || !description || !amountStr) continue;

      const amount = parseFloat(amountStr);
      if (isNaN(amount)) continue;

      // Auto-categorize based on description (Simple logic)
      let categoryId = '';
      const lowerDesc = description.toLowerCase();
      
      if (lowerDesc.includes('uber') || lowerDesc.includes('posto')) {
        categoryId = categories.find(c => c.name === 'Transporte')?.id || '';
      } else if (lowerDesc.includes('mercado') || lowerDesc.includes('food')) {
        categoryId = categories.find(c => c.name === 'Alimentação')?.id || '';
      }

      // Determine type
      const type = amount < 0 ? 'expense' : 'income';
      const absAmount = Math.abs(amount);

      await createTransaction({
        description: description.trim(),
        amount: absAmount,
        date: date.trim(), // Assuming YYYY-MM-DD
        type,
        categoryId: categoryId || categories[0]?.id || '', // Fallback
        status: 'completed',
        paymentMethod: 'debit' // Default to debit for imports
      });
      
      count++;
    }
    return count;
  };

  const handleUpload = async () => {
    if (!file) return;
    setProcessing(true);

    try {
      const text = await file.text();
      const count = await parseCSV(text);
      setStatus('success');
      setMessage(`${count} transações importadas com sucesso!`);
      setTimeout(() => {
        onClose();
        setFile(null);
        setStatus('idle');
      }, 2000);
    } catch (error) {
      console.error(error);
      setStatus('error');
      setMessage('Erro ao processar arquivo. Verifique o formato (CSV: Data,Descricao,Valor).');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-card px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6 border border-border">
                <Dialog.Title className="text-lg font-medium leading-6 text-foreground mb-4">Importar Extrato</Dialog.Title>
                
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-input rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-accent/50 transition-colors">
                    <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Selecione um arquivo CSV (Data, Descrição, Valor)
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".csv,.txt"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center px-4 py-2 border border-input shadow-sm text-sm font-medium rounded-md text-foreground bg-background hover:bg-accent focus:outline-none transition-colors"
                    >
                      Selecionar Arquivo
                    </button>
                    {file && (
                      <p className="mt-2 text-sm font-medium text-primary">
                        {file.name}
                      </p>
                    )}
                  </div>

                  {status === 'success' && (
                    <div className="rounded-md bg-emerald-500/10 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <Check className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-emerald-500">{message}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {status === 'error' && (
                    <div className="rounded-md bg-destructive/10 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <AlertCircle className="h-5 w-5 text-destructive" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-destructive">{message}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-5 sm:mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex w-full justify-center rounded-md border border-input bg-background px-4 py-2 text-base font-medium text-foreground shadow-sm hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:text-sm transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleUpload}
                      disabled={!file || processing}
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-base font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:text-sm disabled:opacity-50 transition-colors"
                    >
                      {processing ? 'Processando...' : 'Importar'}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
