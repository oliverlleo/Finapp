import React, { useState, useRef } from 'react';
import { Upload, FileText, Check, AlertCircle, ArrowRight, Save } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Fragment } from 'react';
import { TransactionType } from '../../types/finance';

interface StatementImportProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PreviewItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  originalDescription: string;
}

export const StatementImport: React.FC<StatementImportProps> = ({ isOpen, onClose }) => {
  const { createTransaction, categories, importRules, createImportRule } = useFinanceStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const [previewData, setPreviewData] = useState<PreviewItem[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setMessage('');
    }
  };

  const detectCategory = (description: string): string => {
    // 1. Check saved patterns from DB
    for (const rule of importRules) {
      if (description.toLowerCase().includes(rule.pattern.toLowerCase())) {
        return rule.categoryId;
      }
    }

    // 2. Hardcoded logic
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('uber') || lowerDesc.includes('posto')) {
      return categories.find(c => c.name === 'Transporte')?.id || '';
    } else if (lowerDesc.includes('mercado') || lowerDesc.includes('food') || lowerDesc.includes('ifood')) {
      return categories.find(c => c.name === 'Alimentação')?.id || '';
    }
    
    return '';
  };

  const parseCSV = async (text: string) => {
    const lines = text.split('\n');
    const items: PreviewItem[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const [date, description, amountStr] = line.split(',');
      if (!date || !description || !amountStr) continue;

      const amount = parseFloat(amountStr);
      if (isNaN(amount)) continue;

      const type: TransactionType = amount < 0 ? 'expense' : 'income';
      const absAmount = Math.abs(amount);
      const categoryId = detectCategory(description);

      items.push({
        id: `row-${i}`,
        date: date.trim(),
        description: description.trim(),
        amount: absAmount,
        type,
        categoryId: categoryId || categories[0]?.id || '',
        originalDescription: description.trim()
      });
    }
    return items;
  };

  const handleUpload = async () => {
    if (!file) return;
    setProcessing(true);

    try {
      const text = await file.text();
      const items = await parseCSV(text);
      setPreviewData(items);
      setStep('preview');
      setProcessing(false);
    } catch (error) {
      setStatus('error');
      setMessage('Erro ao processar arquivo.');
      setProcessing(false);
    }
  };

  const handleSave = async () => {
    setProcessing(true);
    let count = 0;

    for (const item of previewData) {
      await createTransaction({
        description: item.description,
        amount: item.amount,
        date: item.date,
        type: item.type,
        categoryId: item.categoryId,
        status: 'completed',
        paymentMethod: 'debit'
      });
      
      // Learn pattern if category was manually set/confirmed
      if (item.categoryId && item.description) {
        // Check if rule already exists
        const exists = importRules.some(r => r.pattern === item.description && r.categoryId === item.categoryId);
        if (!exists) {
           await createImportRule(item.description, item.categoryId);
        }
      }
      count++;
    }

    setStatus('success');
    setMessage(`${count} transações importadas com sucesso!`);
    setTimeout(() => {
      onClose();
      setStep('upload');
      setFile(null);
      setStatus('idle');
      setPreviewData([]);
    }, 2000);
    setProcessing(false);
  };

  const updatePreviewItem = (id: string, field: keyof PreviewItem, value: any) => {
    setPreviewData(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
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
              <Dialog.Panel className={`relative transform overflow-hidden rounded-lg bg-card px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 w-full ${step === 'preview' ? 'sm:max-w-4xl' : 'sm:max-w-lg'} sm:p-6 border border-border`}>
                {step === 'upload' ? (
                  <div className="space-y-4">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Upload className="h-6 w-6 text-primary" aria-hidden="true" />
                    </div>
                    <div className="text-center">
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-foreground">
                        Importar Extrato
                      </Dialog.Title>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Selecione um arquivo CSV ou OFX para importar suas transações.
                      </p>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-center rounded-md border-2 border-dashed border-border px-6 pt-5 pb-6">
                        <div className="space-y-1 text-center">
                          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                          <div className="flex text-sm text-muted-foreground">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer rounded-md bg-background font-medium text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary/90"
                            >
                              <span>Upload um arquivo</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                accept=".csv,.ofx"
                                className="sr-only"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                              />
                            </label>
                            <p className="pl-1">ou arraste e solte</p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            CSV, OFX até 10MB
                          </p>
                        </div>
                      </div>
                    </div>

                    {file && (
                      <div className="flex items-center justify-between bg-muted/50 p-3 rounded-md">
                        <span className="text-sm text-foreground truncate">{file.name}</span>
                        <button onClick={() => setFile(null)} className="text-muted-foreground hover:text-destructive">
                          Remover
                        </button>
                      </div>
                    )}

                    {status === 'success' && (
                      <div className="rounded-md bg-green-50 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <Check className="h-5 w-5 text-green-400" aria-hidden="true" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-green-800">{message}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {status === 'error' && (
                      <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-red-800">{message}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-5 sm:mt-6">
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-base font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleUpload}
                        disabled={!file || processing}
                      >
                        {processing ? 'Processando...' : 'Continuar para Pré-visualização'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-foreground">
                        Pré-visualização da Importação
                      </Dialog.Title>
                      <button
                        onClick={() => setStep('upload')}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        Voltar
                      </button>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto border rounded-md">
                      <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Data</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Descrição</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Valor</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Categoria</th>
                          </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-border">
                          {previewData.map((item) => (
                            <tr key={item.id}>
                              <td className="px-3 py-4 whitespace-nowrap text-sm text-foreground">{item.date}</td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm text-foreground">{item.description}</td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm text-foreground">
                                <span className={item.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}>
                                  {item.amount.toFixed(2)}
                                </span>
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm text-foreground">
                                <select
                                  value={item.categoryId}
                                  onChange={(e) => updatePreviewItem(item.id, 'categoryId', e.target.value)}
                                  className="block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-1 border"
                                >
                                  <option value="">Selecione...</option>
                                  {categories
                                    .filter(c => c.type === item.type)
                                    .map(c => (
                                      <option key={c.id} value={c.id}>{c.name}</option>
                                    ))
                                  }
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-5 sm:mt-6 flex gap-3">
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md border border-border bg-card px-4 py-2 text-base font-medium text-foreground shadow-sm hover:bg-accent focus:outline-none sm:text-sm"
                        onClick={() => setStep('upload')}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-base font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:text-sm disabled:opacity-50"
                        onClick={handleSave}
                        disabled={processing}
                      >
                        {processing ? 'Salvando...' : `Confirmar Importação (${previewData.length})`}
                      </button>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
