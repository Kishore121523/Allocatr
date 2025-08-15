// lib/budget-calculations.ts

import { startOfMonth, endOfMonth, differenceInDays } from 'date-fns';

export function getDailyBudgetRemaining(remainingBudget: number): number {
  const today = new Date();
  const endOfCurrentMonth = endOfMonth(today);
  const daysRemaining = differenceInDays(endOfCurrentMonth, today) + 1; // Include today
  
  return daysRemaining > 0 ? remainingBudget / daysRemaining : 0;
}

export function getRemainingDaysInMonth(): number {
  const today = new Date();
  const endOfCurrentMonth = endOfMonth(today);
  return Math.max(0, differenceInDays(endOfCurrentMonth, today) + 1); // Include today
}

export function calculateBudgetFlexibility(
  totalIncome: number,
  totalAllocated: number
): {
  unallocatedAmount: number;
  flexibilityPercentage: number;
  hasUnallocatedFunds: boolean;
} {
  const unallocatedAmount = Math.max(0, totalIncome - totalAllocated);
  const flexibilityPercentage = totalIncome > 0 ? (unallocatedAmount / totalIncome) * 100 : 0;
  const hasUnallocatedFunds = unallocatedAmount > 0;
  
  return {
    unallocatedAmount,
    flexibilityPercentage,
    hasUnallocatedFunds,
  };
}

export function getSpendingVelocity(
  totalSpent: number,
  monthlyIncome: number,
  dayOfMonth: number,
  daysInMonth: number
): {
  expectedSpentByNow: number;
  isAheadOfPace: boolean;
  projectedMonthEnd: number;
} {
  const expectedSpentByNow = (monthlyIncome * dayOfMonth) / daysInMonth;
  const isAheadOfPace = totalSpent > expectedSpentByNow;
  const dailySpendingRate = totalSpent / dayOfMonth;
  const projectedMonthEnd = dailySpendingRate * daysInMonth;
  
  return {
    expectedSpentByNow,
    isAheadOfPace,
    projectedMonthEnd,
  };
}

export function calculateCategoryHealthScore(
  allocated: number,
  spent: number,
  dayOfMonth: number,
  daysInMonth: number
): {
  score: number; // 0-100
  status: 'excellent' | 'good' | 'warning' | 'danger';
  message: string;
} {
  if (allocated === 0) {
    return {
      score: spent > 0 ? 0 : 100,
      status: spent > 0 ? 'danger' : 'excellent',
      message: spent > 0 ? 'Spending without budget' : 'No activity',
    };
  }
  
  const expectedSpentByNow = (allocated * dayOfMonth) / daysInMonth;
  const utilizationRate = spent / allocated;
  const timeProgress = dayOfMonth / daysInMonth;
  
  let score = 100;
  let status: 'excellent' | 'good' | 'warning' | 'danger' = 'excellent';
  let message = 'On track';
  
  if (utilizationRate > 1) {
    // Over budget
    score = Math.max(0, 100 - (utilizationRate - 1) * 200);
    status = 'danger';
    message = 'Over budget';
  } else if (spent > expectedSpentByNow * 1.2) {
    // Spending too fast
    score = Math.max(20, 100 - ((spent / expectedSpentByNow) - 1) * 100);
    status = 'warning';
    message = 'Spending ahead of pace';
  } else if (spent < expectedSpentByNow * 0.5 && timeProgress > 0.5) {
    // Under-utilizing (might indicate poor budgeting)
    score = Math.max(60, 100 - (0.5 - (spent / expectedSpentByNow)) * 80);
    status = 'good';
    message = 'Under budget';
  }
  
  return { score, status, message };
}
