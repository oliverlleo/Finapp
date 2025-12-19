import React from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const MonthSelector: React.FC = () => {
  const { selectedDate, setSelectedDate } = useFinanceStore();

  const handlePrev = () => setSelectedDate(subMonths(selectedDate, 1));
  const handleNext = () => setSelectedDate(addMonths(selectedDate, 1));

  return (
    <div className="flex items-center space-x-1 sm:space-x-2 bg-background/50 p-0.5 sm:p-1 rounded-lg border border-border">
      <button 
        onClick={handlePrev} 
        className="p-1 sm:p-1.5 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors text-muted-foreground"
      >
        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
      </button>
      <span className="text-xs sm:text-sm font-medium text-foreground capitalize min-w-[70px] sm:min-w-[100px] text-center select-none truncate">
        {format(selectedDate, 'MMMM yyyy', { locale: ptBR })}
      </span>
      <button 
        onClick={handleNext} 
        className="p-1 sm:p-1.5 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors text-muted-foreground"
      >
        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
      </button>
    </div>
  );
};
