import React from 'react';
import { Popover, Transition } from '@headlessui/react';
import { Bell, Check } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Fragment } from 'react';
import { clsx } from 'clsx';

export const Notifications: React.FC = () => {
  const { notifications, markNotificationAsRead, clearNotifications } = useFinanceStore();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Popover className="relative">
      <Popover.Button className="relative rounded-full bg-background p-2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors">
        <span className="sr-only">View notifications</span>
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
        )}
      </Popover.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-lg bg-popover shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-border">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-foreground">Notificações</h3>
              {notifications.length > 0 && (
                <button 
                  onClick={clearNotifications}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Limpar tudo
                </button>
              )}
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma notificação
                </p>
              ) : (
                notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={clsx(
                      "flex items-start gap-3 p-3 rounded-md transition-colors",
                      notification.read ? "bg-background border border-border" : "bg-muted"
                    )}
                  >
                    <div className={clsx(
                      "mt-1.5 h-2 w-2 rounded-full flex-shrink-0",
                      notification.type === 'warning' ? "bg-amber-500" : "bg-blue-500"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => markNotificationAsRead(notification.id)}
                        className="text-muted-foreground hover:text-primary mt-0.5"
                        title="Marcar como lida"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
};
