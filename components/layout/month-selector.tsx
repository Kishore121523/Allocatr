// components/layout/month-selector.tsx

'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MonthSelectorProps {
  currentMonth: string; // Format: "YYYY-MM"
  onMonthChange: (month: string) => void;
  className?: string;
}

export function MonthSelector({ currentMonth, onMonthChange, className }: MonthSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Parse current month
  const [year, month] = currentMonth.split('-').map(Number);
  const currentDate = new Date(year, month - 1);

  // Format display text
  const formatMonthDisplay = (monthStr: string) => {
    const [y, m] = monthStr.split('-').map(Number);
    const date = new Date(y, m - 1);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Navigate months
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    
    const newMonthKey = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`;
    onMonthChange(newMonthKey);
  };

  // Generate month options (6 months back, current, 6 months forward)
  const generateMonthOptions = () => {
    const options = [];
    const today = new Date();
    const currentYear = today.getFullYear();
    const todayMonth = today.getMonth();

    // Go back 12 months from current date
    for (let i = -12; i <= 6; i++) {
      const optionDate = new Date(currentYear, todayMonth + i);
      const monthKey = `${optionDate.getFullYear()}-${String(optionDate.getMonth() + 1).padStart(2, '0')}`;
      const todayMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      const isCurrentMonth = monthKey === todayMonthKey;
      const isFutureMonth = optionDate > today;
      
      options.push({
        key: monthKey,
        display: formatMonthDisplay(monthKey),
        date: optionDate,
        isCurrentMonth,
        isFutureMonth,
        isSelected: monthKey === currentMonth
      });
    }

    return options.reverse(); // Most recent first
  };

  const monthOptions = generateMonthOptions();
  const currentMonthDisplay = formatMonthDisplay(currentMonth);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Quick navigation buttons */}
      <Button 
        variant="outline" 
        size="icon"
        onClick={() => navigateMonth('prev')}
        className="h-9 w-9 flex-shrink-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Month display with popover */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="h-9 px-3 min-w-0 flex-1 justify-between"
          >
            <span className="font-medium truncate">{currentMonthDisplay}</span>
            <Calendar className="h-4 w-4 ml-1 flex-shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-foreground">Select Month</h3>
            <div className="max-h-64 overflow-y-auto scrollbar-hide space-y-1">
              {monthOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => {
                    onMonthChange(option.key);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md transition-colors",
                    "hover:bg-muted",
                    option.isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
                    option.isFutureMonth && !option.isSelected && "text-muted-foreground cursor-not-allowed"
                  )}
                  disabled={option.isFutureMonth && !option.isSelected}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option.display}</span>
                    {option.isCurrentMonth && !option.isSelected && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Current
                      </span>
                    )}
                    {option.isSelected && (
                      <span className="text-xs bg-primary-foreground/20 px-2 py-1 rounded">
                        Selected
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Quick navigation buttons */}
      <Button 
        variant="outline" 
        size="icon"
        onClick={() => navigateMonth('next')}
        className="h-9 w-9 flex-shrink-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
