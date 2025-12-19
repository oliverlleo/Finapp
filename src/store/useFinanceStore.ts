import { create } from 'zustand';
import { Transaction, Workspace, User, Card, Category, Budget, WorkspaceInvite } from '../types/finance';
import { supabase } from '../lib/supabase';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO, format, isBefore, isSameDay } from 'date-fns';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'success';
  read: boolean;
  date: string;
}

interface FinanceState {
  user: User | null;
  workspaces: Workspace[];
  currentWorkspaceId: string | null;
  categories: Category[];
  transactions: Transaction[];
  cards: Card[];
  budgets: Budget[];
  loading: boolean;
  selectedDate: Date;
  notifications: Notification[];
  
  // Actions
  fetchInitialData: () => Promise<void>;
  switchWorkspace: (workspaceId: string) => void;
  createWorkspace: (name: string) => Promise<{ error?: any; data?: any }>;
  createTransaction: (transaction: Omit<Transaction, 'id' | 'workspaceId' | 'userId'>) => Promise<void>;
  createCard: (card: Omit<Card, 'id' | 'workspaceId'>) => Promise<void>;
  updateCard: (id: string, card: Partial<Card>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  createBudget: (budget: Omit<Budget, 'id' | 'workspaceId'>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  toggleTransactionStatus: (id: string, currentStatus: 'pending' | 'completed') => Promise<void>;
  createCategory: (category: Omit<Category, 'id' | 'workspaceId'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  updateBudget: (id: string, budget: Partial<Budget>) => Promise<void>;
  createInvite: (email: string, role: 'admin' | 'member') => Promise<void>;
  updateProfile: (name: string, avatarUrl?: string) => Promise<void>;
  updateMemberProfile: (userId: string, name: string, avatarUrl?: string) => Promise<void>;
  setSelectedDate: (date: Date) => void;
  subscribeToRealtime: () => void;
  joinWorkspace: (workspaceId: string) => Promise<boolean>;
  uploadAttachment: (file: File) => Promise<string | null>;
  uploadAvatar: (file: File) => Promise<string | null>;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  
  // Selectors
  getCurrentWorkspace: () => Workspace | undefined;
  getWorkspaceTransactions: () => Transaction[];
  getWorkspaceCards: () => Card[];
  getWorkspaceBudgets: () => Budget[];
  getFinancialSummary: () => {
    income: number;
    expense: number;
    balance: number;
    predicted: number;
  };
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  user: null,
  workspaces: [],
  currentWorkspaceId: null,
  categories: [],
  transactions: [],
  cards: [],
  budgets: [],
  loading: false,
  selectedDate: new Date(),
  notifications: [],

  markNotificationAsRead: (id) => {
    set(state => ({
      notifications: state.notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  fetchInitialData: async () => {
    set({ loading: true });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      set({ loading: false });
      return;
    }

    // Fetch Workspaces
    const { data: workspacesData } = await supabase
      .from('workspaces')
      .select('*');

    // Fetch User Profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    let workspaces = workspacesData || [];
    
    if (workspaces.length === 0) {
      // Create default workspace using RPC to avoid RLS recursion during insert+select
      const { data: newWs, error: createWsError } = await supabase.rpc('create_workspace', {
        p_name: 'Meu Workspace'
      });

      if (createWsError) {
        console.error('Erro ao criar workspace padrão:', createWsError);
      }

      if (newWs) {
        workspaces = [newWs as any];
      }
    }

    const currentWorkspaceId = get().currentWorkspaceId || workspaces[0]?.id;

    // Fetch Categories
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('*')
      .eq('workspace_id', currentWorkspaceId);

    // Fetch Accounts (Cards/Wallets)
    const { data: accountsData } = await supabase
      .from('accounts')
      .select('*')
      .eq('workspace_id', currentWorkspaceId);

    // Fetch Transactions
    const { data: transactionsData } = await supabase
      .from('transactions')
      .select('*')
      .eq('workspace_id', currentWorkspaceId);

    // Fetch Budgets
    const { data: budgetsData } = await supabase
      .from('budgets')
      .select('*')
      .eq('workspace_id', currentWorkspaceId);

    // Fetch Import Rules
    const { data: rulesData } = await supabase
      .from('import_rules')
      .select('*')
      .eq('workspace_id', currentWorkspaceId);

    // Fetch Members
    const { data: membersData } = await supabase
      .from('workspace_members')
      .select('*, profiles(full_name, avatar_url)')
      .eq('workspace_id', currentWorkspaceId);

    // Map to frontend types
    const mappedWorkspaces: Workspace[] = workspaces.map(w => ({
      id: w.id,
      name: w.name,
      ownerId: w.owner_id,
      members: w.id === currentWorkspaceId ? (membersData || []).map((m: any) => ({
        userId: m.user_id,
        role: m.role,
        name: m.display_name || m.profiles?.full_name,
        avatar: m.avatar_url || m.profiles?.avatar_url
      })) : [],
      currency: 'BRL'
    }));

    const mappedCategories: Category[] = (categoriesData || []).map(c => ({
      id: c.id,
      name: c.name,
      type: c.type as any,
      color: c.color || '#000',
      icon: c.icon,
      workspaceId: c.workspace_id,
      parentId: c.parent_id
    }));

    const mappedCards: Card[] = (accountsData || [])
      .filter(a => a.type === 'credit')
      .map(c => ({
        id: c.id,
        name: c.name,
        brand: 'Visa',
        last4Digits: '0000',
        limit: c.credit_limit || 0,
        closingDay: c.closing_day || 1,
        dueDay: c.due_day || 10,
        workspaceId: c.workspace_id,
        type: 'credit',
        balance: c.balance || 0,
        initialBalance: c.initial_balance || 0
      }));

    const mappedTransactions: Transaction[] = (transactionsData || []).map(t => ({
      id: t.id,
      description: t.description,
      amount: t.amount,
      date: t.date,
      type: t.type as any,
      categoryId: t.category_id,
      workspaceId: t.workspace_id,
      status: t.status as any,
      paymentMethod: t.account_id ? 'credit' : 'cash',
      cardId: t.account_id,
      accountId: t.account_id,
      userId: t.user_id,
      isRecurring: t.is_recurring,
      recurrenceFrequency: t.recurrence_frequency,
      recurrenceEndDate: t.recurrence_end_date,
      beneficiaryId: t.beneficiary_id,
      attachmentUrl: t.attachment_url,
      tags: t.tags,
      transferAccountId: t.transfer_account_id
    }));

    const mappedBudgets: Budget[] = (budgetsData || []).map(b => ({
      id: b.id,
      workspaceId: b.workspace_id,
      categoryId: b.category_id,
      amount: b.amount,
      period: b.period as any,
      rollover: b.rollover
    }));

    const mappedImportRules: ImportRule[] = (rulesData || []).map(r => ({
      id: r.id,
      workspaceId: r.workspace_id,
      pattern: r.pattern,
      categoryId: r.category_id
    }));

    // Generate Notifications
    const notifications: Notification[] = [];
    const today = new Date();
    const pendingExpenses = (transactionsData || []).filter((t: any) => 
      t.type === 'expense' && t.status === 'pending'
    );

    pendingExpenses.forEach((t: any) => {
      const dueDate = parseISO(t.date);
      // Check if overdue (before today and NOT today)
      if (isBefore(dueDate, today) && !isSameDay(dueDate, today)) {
        notifications.push({
          id: `overdue-${t.id}`,
          title: 'Conta Atrasada',
          message: `A conta "${t.description}" venceu em ${format(dueDate, 'dd/MM')}.`,
          type: 'warning',
          read: false,
          date: t.date
        });
      } else if (isSameDay(dueDate, today)) {
        notifications.push({
          id: `due-today-${t.id}`,
          title: 'Vence Hoje',
          message: `A conta "${t.description}" vence hoje!`,
          type: 'warning',
          read: false,
          date: t.date
        });
      }
    });

    set({
      user: { 
        id: user.id, 
        name: profileData?.full_name || user.user_metadata.full_name || user.email, 
        email: user.email || '',
        avatar: profileData?.avatar_url 
      },
      workspaces: mappedWorkspaces,
      currentWorkspaceId,
      categories: mappedCategories,
      cards: mappedCards,
      transactions: mappedTransactions,
      budgets: mappedBudgets,
      importRules: mappedImportRules,
      notifications,
      loading: false
    });
    
    get().subscribeToRealtime();
  },

  switchWorkspace: (workspaceId) => {
    set({ currentWorkspaceId: workspaceId });
    get().fetchInitialData(); 
  },

  createWorkspace: async (name) => {
    const { user } = get();
    if (!user) return { error: 'Usuário não autenticado' };

    // Use RPC to create workspace + owner membership + default categories in one transaction,
    // and avoid insert+select triggering recursive RLS checks.
    const { data: newWs, error } = await supabase.rpc('create_workspace', { p_name: name });

    if (error) {
      console.error('Erro ao criar workspace:', error);
      return { error };
    }

    if (newWs) {
      get().fetchInitialData();
      return { data: newWs };
    }

    return { error: 'Erro desconhecido' };
  },

  createTransaction: async (transaction) => {
    const { currentWorkspaceId, user } = get();
    if (!currentWorkspaceId || !user) return;

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        workspace_id: currentWorkspaceId,
        description: transaction.description,
        amount: transaction.amount,
        date: transaction.date,
        type: transaction.type,
        category_id: transaction.categoryId,
        account_id: transaction.accountId || transaction.cardId || null,
        status: transaction.status,
        user_id: user.id,
        is_recurring: transaction.isRecurring,
        recurrence_frequency: transaction.recurrenceFrequency,
        recurrence_end_date: transaction.recurrenceEndDate,
        beneficiary_id: transaction.beneficiaryId,
        attachment_url: transaction.attachmentUrl,
        tags: transaction.tags,
        transfer_account_id: transaction.transferAccountId
      })
      .select()
      .single();

    if (data && !error) {
      get().fetchInitialData();
    }
  },

  createCard: async (card) => {
    const { currentWorkspaceId } = get();
    if (!currentWorkspaceId) return;

    const { data, error } = await supabase
      .from('accounts')
      .insert({
        workspace_id: currentWorkspaceId,
        name: card.name,
        type: 'credit',
        credit_limit: card.limit,
        closing_day: card.closingDay,
        due_day: card.dueDay,
        balance: 0,
        initial_balance: card.initialBalance
      })
      .select()
      .single();

    if (data && !error) {
      get().fetchInitialData();
    }
  },

  updateCard: async (id, card) => {
    const { currentWorkspaceId } = get();
    if (!currentWorkspaceId) return;

    const { error } = await supabase
      .from('accounts')
      .update({
        name: card.name,
        credit_limit: card.limit,
        closing_day: card.closingDay,
        due_day: card.dueDay,
        initial_balance: card.initialBalance
      })
      .eq('id', id)
      .eq('workspace_id', currentWorkspaceId);

    if (!error) {
      get().fetchInitialData();
    } else {
      console.error('Erro ao atualizar cartão:', error);
      alert('Erro ao atualizar cartão.');
    }
  },

  deleteCard: async (id) => {
    const { currentWorkspaceId } = get();
    if (!currentWorkspaceId) return;

    const { error, count } = await supabase
      .from('accounts')
      .delete({ count: 'exact' })
      .eq('id', id)
      .eq('workspace_id', currentWorkspaceId);

    if (error) {
      console.error('Erro ao deletar cartão:', error);
      alert('Erro ao apagar cartão.');
      return;
    }

    if (count !== null && count > 0) {
      set(state => ({
        cards: state.cards.filter(c => c.id !== id)
      }));
    } else {
      alert('Não foi possível apagar o cartão. Verifique se você tem permissão.');
    }
  },

  deleteTransaction: async (id) => {
    const { currentWorkspaceId } = get();
    if (!currentWorkspaceId) return;

    const { error, count } = await supabase
      .from('transactions')
      .delete({ count: 'exact' })
      .eq('id', id)
      .eq('workspace_id', currentWorkspaceId);

    if (error) {
      console.error('Erro ao deletar transação:', error);
      alert('Erro ao apagar transação. Verifique o console.');
      return;
    }

    if (count !== null && count > 0) {
      set(state => ({
        transactions: state.transactions.filter(t => t.id !== id)
      }));
    } else {
      alert('Não foi possível apagar a transação. Verifique se você tem permissão.');
    }
  },

  createBudget: async (budget) => {
    const { currentWorkspaceId } = get();
    if (!currentWorkspaceId) return;

    const { data, error } = await supabase
      .from('budgets')
      .insert({
        workspace_id: currentWorkspaceId,
        category_id: budget.categoryId,
        amount: budget.amount,
        period: budget.period,
        rollover: budget.rollover
      })
      .select()
      .single();

    if (data && !error) {
      get().fetchInitialData();
    }
  },

  deleteBudget: async (id) => {
    const { currentWorkspaceId } = get();
    if (!currentWorkspaceId) return;

    const { error, count } = await supabase
      .from('budgets')
      .delete({ count: 'exact' })
      .eq('id', id)
      .eq('workspace_id', currentWorkspaceId);

    if (error) {
      console.error('Erro ao deletar orçamento:', error);
      alert('Erro ao apagar orçamento.');
      return;
    }

    if (count !== null && count > 0) {
      set(state => ({
        budgets: state.budgets.filter(b => b.id !== id)
      }));
    } else {
      alert('Não foi possível apagar o orçamento. Verifique se você tem permissão.');
    }
  },

  toggleTransactionStatus: async (id, currentStatus) => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    const { error } = await supabase
      .from('transactions')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      set(state => ({
        transactions: state.transactions.map(t => 
          t.id === id ? { ...t, status: newStatus } : t
        )
      }));
    }
  },

  createCategory: async (category) => {
    const { currentWorkspaceId } = get();
    if (!currentWorkspaceId) return;

    const { data, error } = await supabase
      .from('categories')
      .insert({
        workspace_id: currentWorkspaceId,
        name: category.name,
        type: category.type,
        color: category.color,
        icon: category.icon,
        parent_id: category.parentId
      })
      .select()
      .single();

    if (data && !error) {
      get().fetchInitialData();
    }
  },

  updateCategory: async (id, category) => {
    const { currentWorkspaceId } = get();
    if (!currentWorkspaceId) return;

    const { error } = await supabase
      .from('categories')
      .update({
        name: category.name,
        type: category.type,
        color: category.color,
        icon: category.icon,
        parent_id: category.parentId
      })
      .eq('id', id)
      .eq('workspace_id', currentWorkspaceId);

    if (!error) {
      get().fetchInitialData();
    } else {
      console.error('Erro ao atualizar categoria:', error);
      alert('Erro ao atualizar categoria.');
    }
  },

  deleteCategory: async (id) => {
    const { currentWorkspaceId } = get();
    if (!currentWorkspaceId) return;

    const { error, count } = await supabase
      .from('categories')
      .delete({ count: 'exact' })
      .eq('id', id)
      .eq('workspace_id', currentWorkspaceId);

    if (error) {
      console.error('Erro ao deletar categoria:', error);
      alert('Erro ao apagar categoria. Verifique se existem transações vinculadas.');
      return;
    }

    if (count !== null && count > 0) {
      set(state => ({
        categories: state.categories.filter(c => c.id !== id)
      }));
    } else {
      alert('Não foi possível apagar a categoria. Verifique suas permissões.');
    }
  },

  updateTransaction: async (id, transaction) => {
    const { currentWorkspaceId } = get();
    if (!currentWorkspaceId) return;

    const { error } = await supabase
      .from('transactions')
      .update({
        description: transaction.description,
        amount: transaction.amount,
        date: transaction.date,
        type: transaction.type,
        category_id: transaction.categoryId,
        status: transaction.status,
        is_recurring: transaction.isRecurring,
        recurrence_frequency: transaction.recurrenceFrequency,
        attachment_url: transaction.attachmentUrl,
        beneficiary_id: transaction.beneficiaryId
      })
      .eq('id', id)
      .eq('workspace_id', currentWorkspaceId);

    if (!error) {
      get().fetchInitialData();
    } else {
      console.error('Erro ao atualizar transação:', error);
      alert('Erro ao atualizar transação.');
    }
  },

  updateBudget: async (id, budget) => {
    const { currentWorkspaceId } = get();
    if (!currentWorkspaceId) return;

    const { error } = await supabase
      .from('budgets')
      .update({
        amount: budget.amount,
        period: budget.period,
        rollover: budget.rollover
      })
      .eq('id', id)
      .eq('workspace_id', currentWorkspaceId);

    if (!error) {
      get().fetchInitialData();
    } else {
      console.error('Erro ao atualizar orçamento:', error);
      alert('Erro ao atualizar orçamento.');
    }
  },

  createInvite: async (email, role) => {
    const { currentWorkspaceId } = get();
    if (!currentWorkspaceId) return;

    await supabase
      .from('workspace_invites')
      .insert({
        workspace_id: currentWorkspaceId,
        email,
        role,
        status: 'pending'
      });
  },

  updateProfile: async (name, avatarUrl) => {
    const { user } = get();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, full_name: name, avatar_url: avatarUrl });

    if (!error) {
      set(state => ({
        user: state.user ? { ...state.user, name, avatar: avatarUrl } : null
      }));
    }
  },

  updateMemberProfile: async (userId, name, avatarUrl) => {
    const { currentWorkspaceId } = get();
    if (!currentWorkspaceId) return;

    const { error } = await supabase
      .from('workspace_members')
      .update({ display_name: name, avatar_url: avatarUrl })
      .eq('workspace_id', currentWorkspaceId)
      .eq('user_id', userId);

    if (!error) {
      set(state => ({
        workspaces: state.workspaces.map(w => {
          if (w.id === currentWorkspaceId) {
            return {
              ...w,
              members: w.members.map(m => {
                if (m.userId === userId) {
                  return { ...m, name, avatar: avatarUrl };
                }
                return m;
              })
            };
          }
          return w;
        })
      }));
    }
  },

  setSelectedDate: (date) => set({ selectedDate: date }),

  subscribeToRealtime: () => {
    const { currentWorkspaceId } = get();
    if (!currentWorkspaceId) return;

    supabase
      .channel('public:transactions')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions', filter: `workspace_id=eq.${currentWorkspaceId}` }, (payload) => {
        const newTx = payload.new as any;
        set(state => ({
          notifications: [...state.notifications, `Nova transação: ${newTx.description}`],
          transactions: [...state.transactions, {
            id: newTx.id,
            description: newTx.description,
            amount: newTx.amount,
            date: newTx.date,
            type: newTx.type,
            categoryId: newTx.category_id,
            workspaceId: newTx.workspace_id,
            status: newTx.status,
            paymentMethod: newTx.account_id ? 'credit' : 'cash',
            cardId: newTx.account_id,
            accountId: newTx.account_id,
            userId: newTx.user_id,
            isRecurring: newTx.is_recurring,
            recurrenceFrequency: newTx.recurrence_frequency,
            recurrenceEndDate: newTx.recurrence_end_date,
            beneficiaryId: newTx.beneficiary_id,
            attachmentUrl: newTx.attachment_url,
            tags: newTx.tags,
            transferAccountId: newTx.transfer_account_id
          }]
        }));
      })
      .subscribe();
  },

  joinWorkspace: async (workspaceId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('workspace_members')
      .insert({ workspace_id: workspaceId, user_id: user.id, role: 'member' });

    if (!error) {
      get().fetchInitialData();
      return true;
    }
    return false;
  },

  uploadAttachment: async (file: File) => {
    const { user } = get();
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Erro ao fazer upload:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('attachments')
      .getPublicUrl(fileName);

    return publicUrl;
  },

  uploadAvatar: async (file: File) => {
    const { user } = get();
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      console.error('Erro ao fazer upload do avatar:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return publicUrl;
  },

  getCurrentWorkspace: () => {
    const { workspaces, currentWorkspaceId } = get();
    return workspaces.find(w => w.id === currentWorkspaceId);
  },

  getWorkspaceTransactions: () => {
    const { transactions, currentWorkspaceId, selectedDate } = get();
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    
    return transactions.filter(t => 
      t.workspaceId === currentWorkspaceId &&
      isWithinInterval(parseISO(t.date), { start, end })
    );
  },

  getWorkspaceCards: () => {
    const { cards, currentWorkspaceId } = get();
    return cards.filter(c => c.workspaceId === currentWorkspaceId);
  },

  getWorkspaceBudgets: () => {
    const { budgets, currentWorkspaceId } = get();
    return budgets.filter(b => b.workspaceId === currentWorkspaceId);
  },

  getFinancialSummary: () => {
    const transactions = get().getWorkspaceTransactions(); // Already filtered by date
    
    const income = transactions
      .filter(t => t.type === 'income' && t.status === 'completed')
      .reduce((acc, t) => acc + t.amount, 0);

    const expense = transactions
      .filter(t => t.type === 'expense' && t.status === 'completed')
      .reduce((acc, t) => acc + t.amount, 0);

    const balance = income - expense;

    const predictedIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
      
    const predictedExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    const predicted = predictedIncome - predictedExpense;

    return { income, expense, balance, predicted };
  }
}));
