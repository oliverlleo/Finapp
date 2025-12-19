import React from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

export const FinancialCharts: React.FC = () => {
  const { getWorkspaceTransactions, categories } = useFinanceStore();
  const transactions = getWorkspaceTransactions();

  // Prepare data for AreaChart (Balance Evolution)
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  const days = eachDayOfInterval({ start, end });

  const balanceData = days.map(day => {
    const dayTransactions = transactions.filter(t => 
      isSameDay(parseISO(t.date), day) && t.status === 'completed'
    );
    
    const income = dayTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
      
    const expense = dayTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    return {
      date: format(day, 'dd/MM'),
      income,
      expense
    };
  });

  // Prepare data for PieChart (Expenses by Category)
  const currentMonthTransactions = transactions.filter(t => 
    t.type === 'expense' && t.status === 'completed'
  );

  const expensesByCategory = categories
    .filter(c => c.type === 'expense')
    .map(category => {
      const amount = currentMonthTransactions
        .filter(t => t.categoryId === category.id)
        .reduce((acc, t) => acc + t.amount, 0);
      
      return {
        name: category.name,
        value: amount,
        color: category.color
      };
    })
    .filter(item => item.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Evolution Chart */}
      <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold leading-6 text-foreground mb-6">Fluxo Diário (Mês Atual)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={balanceData}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                tick={{fontSize: 12, fill: 'hsl(var(--muted-foreground))'}} 
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis 
                tick={{fontSize: 12, fill: 'hsl(var(--muted-foreground))'}} 
                axisLine={false}
                tickLine={false}
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  color: 'hsl(var(--foreground))'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="income" 
                stroke="#10b981" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorIncome)" 
                name="Receitas" 
              />
              <Area 
                type="monotone" 
                dataKey="expense" 
                stroke="#f43f5e" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorExpense)" 
                name="Despesas" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Categories Chart */}
      <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold leading-6 text-foreground mb-6">Despesas por Categoria</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expensesByCategory}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {expensesByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  color: 'hsl(var(--foreground))'
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span className="text-sm text-muted-foreground ml-1">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
