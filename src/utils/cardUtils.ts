import { parseISO, getDate, addMonths, format, startOfMonth, isSameMonth, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Transaction } from '../types/finance';

export const calculateInvoiceDate = (transactionDate: string | Date, closingDay: number): Date => {
  const date = typeof transactionDate === 'string' ? parseISO(transactionDate) : transactionDate;
  const day = getDate(date);
  
  if (day >= closingDay) {
    return addMonths(startOfMonth(date), 1);
  }
  return startOfMonth(date);
};

export const formatInvoiceMonth = (date: Date): string => {
  return format(date, 'MMMM yyyy', { locale: ptBR });
};

export const getOpenInvoiceAmount = (transactions: Transaction[], cardId: string, closingDay: number): number => {
  const now = new Date();
  const currentInvoiceDate = calculateInvoiceDate(now, closingDay);
  
  return transactions
    .filter(t => {
      if (t.cardId !== cardId || t.type !== 'expense') return false;
      const tInvoiceDate = calculateInvoiceDate(t.date, closingDay);
      return isSameMonth(tInvoiceDate, currentInvoiceDate);
    })
    .reduce((acc, t) => acc + t.amount, 0);
};

export const getAvailableLimit = (limit: number, transactions: Transaction[], cardId: string, closingDay: number): number => {
  // Simplified: Limit - Current Open Invoice
  // In a real app, this should include all unpaid invoices/installments
  const openInvoice = getOpenInvoiceAmount(transactions, cardId, closingDay);
  return limit - openInvoice;
};
