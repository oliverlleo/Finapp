export type TransactionType = 'income' | 'expense' | 'transfer';
export type TransactionStatus = 'pending' | 'completed';
export type PaymentMethod = 'cash' | 'debit' | 'credit';
export type AccountType = 'wallet' | 'bank' | 'credit';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon?: string;
  workspaceId?: string;
  parentId?: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string; // ISO date string
  type: TransactionType;
  categoryId: string;
  workspaceId: string;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  cardId?: string; // Deprecated in favor of accountId for credit cards, but kept for compat
  accountId?: string;
  userId?: string;
  isRecurring?: boolean;
  recurrenceFrequency?: 'monthly' | 'weekly' | 'yearly';
  recurrenceEndDate?: string;
  beneficiaryId?: string;
  attachmentUrl?: string;
  tags?: string[];
  transferAccountId?: string;
}

export interface Account {
  id: string;
  workspaceId: string;
  name: string;
  type: AccountType;
  balance: number;
  initialBalance: number;
  creditLimit?: number;
  closingDay?: number;
  dueDay?: number;
}

export interface Card extends Account {
  // Legacy interface for compatibility, extends Account
  brand?: string;
  last4Digits?: string;
  limit: number; // mapped to creditLimit
}

export interface WorkspaceMember {
  userId: string;
  role: 'admin' | 'member';
  name?: string;
  avatar?: string;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  members: WorkspaceMember[];
  currency: string;
}

export interface WorkspaceInvite {
  id: string;
  workspaceId: string;
  email: string;
  role: 'admin' | 'member';
  status: 'pending' | 'accepted' | 'rejected';
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Budget {
  id: string;
  workspaceId: string;
  categoryId: string;
  amount: number;
  period: 'monthly' | 'yearly';
  rollover: boolean;
}
