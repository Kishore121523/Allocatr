'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { BarChart3, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { CategorySpending, Transaction } from '@/types';

type PatternsTabProps = {
  transactions: Transaction[];
  allocatedCategories: CategorySpending[];
};

export function PatternsTab({ transactions, allocatedCategories }: PatternsTabProps) {

  // Calculate weekly spending data with fixed day mapping
  const weeklyData = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName, dayIndex) => {
    const dayTransactions = transactions.filter(t => new Date(t.date).getDay() === dayIndex);
    const dayTotal = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
    const transactionCount = dayTransactions.length;
    
    return {
      day: dayName,
      total: dayTotal,
      count: transactionCount,
      average: transactionCount > 0 ? dayTotal / transactionCount : 0
    };
  });

  const maxDayTotal = Math.max(...weeklyData.map(d => d.total), 1); // Avoid division by zero
  const totalWeeklySpent = weeklyData.reduce((sum, d) => sum + d.total, 0);

  // Calculate current month's period spending pattern
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Get first day of current month
  const monthStart = new Date(currentYear, currentMonth, 1);
  // Get last day of current month
  const monthEnd = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = monthEnd.getDate();
  
  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= monthStart && transactionDate <= monthEnd;
  });
  
  // Create periods based on month length
  let periods = [];
  
  if (daysInMonth === 28) {
    // February (non-leap year): 3 periods of 9-10 days
    periods = [
      { start: 1, end: 10 },
      { start: 11, end: 20 },
      { start: 21, end: 28 }
    ];
  } else if (daysInMonth === 29) {
    // February (leap year): 3 periods
    periods = [
      { start: 1, end: 10 },
      { start: 11, end: 20 },
      { start: 21, end: 29 }
    ];
  } else if (daysInMonth === 30) {
    // 30-day months: 3 periods of 10 days each
    periods = [
      { start: 1, end: 10 },
      { start: 11, end: 20 },
      { start: 21, end: 30 }
    ];
  } else {
    // 31-day months: 3 periods with last one taking extra day
    periods = [
      { start: 1, end: 10 },
      { start: 11, end: 20 },
      { start: 21, end: 31 }
    ];
  }

  const monthlyData = periods.map((period, periodIndex) => {
    const periodTransactions = currentMonthTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      const dayOfMonth = transactionDate.getDate();
      return dayOfMonth >= period.start && dayOfMonth <= period.end;
    });
    
    return {
      period: `${period.start}-${period.end}`,
      total: periodTransactions.reduce((sum, t) => sum + t.amount, 0),
      count: periodTransactions.length,
      isCurrentPeriod: now.getDate() >= period.start && now.getDate() <= period.end
    };
  });

  const maxWeekTotal = Math.max(...monthlyData.map(d => d.total), 1);

  return (
    <div className="grid gap-4 sm:gap-6">
      {/* Improved Weekly Spending Pattern */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Weekly Spending Pattern
          </CardTitle>
          <CardDescription className="text-sm">
            Total spent: {formatCurrency(totalWeeklySpent)} across {transactions.length} {transactions.length === 1 ? 'transaction' : 'transactions'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-4">
            {weeklyData.map((dayData) => {
              const heightPercentage = (dayData.total / maxDayTotal) * 100;
              const isHighSpending = dayData.total > totalWeeklySpent / 7 * 1.2; // 20% above average
              
              return (
                <div key={dayData.day} className="flex flex-col items-center">
                  <div className="w-full h-20 sm:h-32 bg-muted rounded-lg relative overflow-hidden mb-2 flex items-end">
                    <div
                      className={`w-full transition-all duration-700 rounded-lg flex flex-col justify-end p-0.5 sm:p-1 ${
                        isHighSpending 
                        ? 'bg-gradient-to-t from-[#ff4d00]/80 to-[#ff4d00]/60 dark:from-[#f1b980]/80 dark:to-[#f1b980]/60' 
                        : dayData.total > 0 
                          ? 'bg-gradient-to-t from-teal-500/80 to-teal-400/80 dark:from-teal-400/80 dark:to-teal-300/80'
                          : 'bg-gradient-to-t from-stone-300 to-stone-200 dark:from-stone-600 dark:to-stone-700'
                      }`}
                      style={{ height: `${Math.max(heightPercentage, 8)}%` }}
                    >
                      {dayData.total > 0 && (
                        <div className="text-center">
                          <div className="md:text-[12px] text-[8px] text-xs text-white font-bold leading-tight">
                            {formatCurrency(dayData.total)}
                          </div>
                          {/* Hide transaction count on mobile for cleaner look */}
                          {dayData.count > 0 && (
                            <div className="hidden sm:block text-xs text-white/80">
                              {dayData.count} {dayData.count === 1 ? 'transaction' : 'transactions'}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-medium text-center">{dayData.day}</span>
                  {/* Hide average on mobile for cleaner look */}
                  {dayData.average > 0 && (
                    <span className="hidden sm:block text-xs text-muted-foreground">
                      avg: {formatCurrency(dayData.average)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Weekly insights */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 p-3 bg-muted/30 rounded-lg">
            <div className="text-center">
              <div className="text-base sm:text-lg font-semibold">
                {weeklyData.find(d => d.total === Math.max(...weeklyData.map(wd => wd.total)))?.day || 'N/A'}
              </div>
              <div className="text-xs text-muted-foreground">Highest spending day</div>
            </div>
            <div className="text-center">
              <div className="text-base sm:text-lg font-semibold">
                {formatCurrency(totalWeeklySpent / 7)}
              </div>
              <div className="text-xs text-muted-foreground">Daily average</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trend Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Monthly Spending Periods
          </CardTitle>
          <CardDescription className="text-sm">
            Spending breakdown for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} ({daysInMonth} days)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {monthlyData.map((periodData, index) => {
              const widthPercentage = (periodData.total / maxWeekTotal) * 100;
              const isCurrentPeriod = periodData.isCurrentPeriod;
              
              return (
                <div key={periodData.period} className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                    <span className={`text-sm font-medium ${isCurrentPeriod ? 'text-primary' : ''}`}>
                      <span className="hidden sm:inline">Period {index + 1} (Days {periodData.period})</span>
                      <span className="sm:hidden">Days {periodData.period}</span>
                      {isCurrentPeriod ? ' (Current)' : ''}
                    </span>
                    <div className="text-left sm:text-right">
                      <span className="text-sm font-semibold">{formatCurrency(periodData.total)}</span>
                      {/* Hide transaction count on mobile for cleaner look */}
                      <span className="hidden sm:inline text-xs text-muted-foreground ml-2">
                        ({periodData.count} {periodData.count === 1 ? 'transaction' : 'transactions'})
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 sm:h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isCurrentPeriod 
                          ? 'bg-gradient-to-r from-[#ff4d00] to-[#ff4d00]/80 dark:from-[#f1b980] dark:to-[#f1b980]/80' 
                          : 'bg-gradient-to-r from-teal-500 to-teal-600 dark:from-teal-400 dark:to-teal-500'
                      }`}
                      style={{ width: `${Math.max(widthPercentage, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>


    </div>
  );
}