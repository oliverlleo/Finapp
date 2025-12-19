import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CreditCard, FileText, Settings, Menu as MenuIcon, X, Bell, Target, ArrowDownCircle, FolderPlus, LogOut } from 'lucide-react';
import { WorkspaceSelector } from '../components/common/WorkspaceSelector';
import { MonthSelector } from '../components/common/MonthSelector';
import { Notifications } from '../components/common/Notifications';
import { useFinanceStore } from '../store/useFinanceStore';
import { useAuth } from '../contexts/AuthContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, fetchInitialData, notifications } = useFinanceStore();
  const { signOut } = useAuth();

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Transações', href: '/transactions', icon: FileText },
    { name: 'Recebimentos', href: '/receivables', icon: ArrowDownCircle },
    { name: 'Cartões', href: '/cards', icon: CreditCard },
    { name: 'Metas', href: '/budgets', icon: Target },
    { name: 'Categorias', href: '/categories', icon: FolderPlus },
    { name: 'Configurações', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div 
        className={twMerge(
          "fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border shadow-sm transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 flex-shrink-0 items-center px-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">F</span>
            </div>
            <span className="text-xl font-bold tracking-tight">FinApp</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden p-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col flex-grow overflow-y-auto py-6 px-4 gap-1">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
            Menu Principal
          </div>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={twMerge(
                    "group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon
                    className={twMerge(
                      "mr-3 flex-shrink-0 h-5 w-5 transition-colors",
                      isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-accent-foreground"
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex-shrink-0 border-t border-border p-4">
          <div className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer group">
            <Link to="/settings" className="flex items-center flex-1 min-w-0">
              <div className="relative">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-9 w-9 rounded-full object-cover border border-border"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-card" />
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate group-hover:text-accent-foreground">
                  {user?.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  Ver perfil
                </p>
              </div>
            </Link>
            <button 
              onClick={() => signOut()} 
              className="ml-2 p-2 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col lg:pl-72 transition-all duration-300">
        <div className="sticky top-0 z-20 flex h-16 flex-shrink-0 bg-background/80 backdrop-blur-md border-b border-border">
          <button
            type="button"
            className="px-4 border-r border-border text-muted-foreground focus:outline-none lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <MenuIcon className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex flex-1 justify-between px-2 sm:px-6 lg:px-8 min-w-0">
            <div className="flex flex-1 items-center gap-2 sm:gap-4 min-w-0">
              <WorkspaceSelector />
              <div className="h-6 w-px bg-border hidden sm:block flex-shrink-0" />
              <div className="flex-shrink-0">
                <MonthSelector />
              </div>
            </div>
            <div className="ml-2 flex items-center md:ml-6">
              <Notifications />
            </div>
          </div>
        </div>

        <main className="flex-1 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Outlet />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};
