// lib/budget-calculations.ts

import { Budget, Transaction, CategorySpending, DashboardStats } from '@/types';

export function calculateCategorySpending(
  budget: Budget,
  transactions: Transaction[]
): CategorySpending[] {
  const categoryMap = new Map<string, CategorySpending>();

  // Initialize with budget categories
  budget.categories.forEach((category) => {
    categoryMap.set(category.id, {
      categoryId: category.id,
      categoryName: category.name,
      allocated: category.allocatedAmount,
      spent: 0,
      remaining: category.allocatedAmount,
      percentageUsed: 0,
      color: category.color,
      isUnallocated: false, // Regular budget categories are not unallocated
    });
  });

  // Calculate spending per category
  transactions.forEach((transaction) => {
    const category = categoryMap.get(transaction.categoryId);
    if (category) {
      category.spent += transaction.amount;
      category.remaining = category.allocated - category.spent;
      
      // Handle percentage calculation for zero-budget categories
      if (category.allocated > 0) {
        category.percentageUsed = Math.round((category.spent / category.allocated) * 100);
      } else if (category.spent > 0) {
        // If there's spending but no allocation, show as over budget (999% to indicate issue)
        category.percentageUsed = 999;
      } else {
        category.percentageUsed = 0;
      }
      

    } else {
      // Handle transactions for categories that no longer exist in budget
      // This can happen if a category was deleted after transactions were created
      console.warn(`Transaction found for unknown category: ${transaction.categoryId} (${transaction.categoryName})`);
    }
  });

  return Array.from(categoryMap.values());
}

export function calculateDashboardStats(
  budget: Budget | null,
  transactions: Transaction[]
): DashboardStats {
  if (!budget) {
    return {
      totalBudget: 0,
      totalSpent: 0,
      remainingBudget: 0,
      percentageUsed: 0,
      categoriesOverBudget: 0,
      transactionCount: 0,
    };
  }

  // Use total income as the total budget for flexible budgeting
  const totalBudget = budget.monthlyIncome;
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const remainingBudget = totalBudget - totalSpent;
  const percentageUsed = totalBudget > 0 
    ? Math.round((totalSpent / totalBudget) * 100)
    : 0;

  // Count categories over budget (only allocated categories)
  const categorySpending = calculateCategorySpending(budget, transactions);
  const categoriesOverBudget = categorySpending.filter(
    (cat) => cat.percentageUsed > 100
  ).length;

  return {
    totalBudget,
    totalSpent,
    remainingBudget,
    percentageUsed,
    categoriesOverBudget,
    transactionCount: transactions.length,
  };
}

export function calculateBudgetFlexibility(budget: Budget): {
  totalAllocated: number;
  unallocatedAmount: number;
  flexibilityPercentage: number;
  hasUnallocatedFunds: boolean;
} {
  const totalAllocated = budget.categories.reduce((sum, cat) => sum + cat.allocatedAmount, 0);
  const unallocatedAmount = budget.monthlyIncome - totalAllocated;
  const flexibilityPercentage = budget.monthlyIncome > 0 
    ? Math.round((unallocatedAmount / budget.monthlyIncome) * 100)
    : 0;

  return {
    totalAllocated,
    unallocatedAmount,
    flexibilityPercentage,
    hasUnallocatedFunds: unallocatedAmount > 0,
  };
}

export function calculateEnhancedCategorySpending(
  budget: Budget,
  transactions: Transaction[]
): CategorySpending[] {
  const categorySpending = calculateCategorySpending(budget, transactions);
  const { unallocatedAmount, hasUnallocatedFunds } = calculateBudgetFlexibility(budget);

  // Add unallocated funds as a virtual category if they exist
  if (hasUnallocatedFunds) {
    categorySpending.push({
      categoryId: 'unallocated',
      categoryName: 'Unallocated',
      allocated: unallocatedAmount,
      spent: 0,
      remaining: unallocatedAmount,
      percentageUsed: 0,
      color: '#6b7280', // Gray color for unallocated funds
      isUnallocated: true,
    });
  }

  return categorySpending;
}

export function getSpendingByDay(
  transactions: Transaction[],
  daysToShow: number = 30
): { date: string; amount: number }[] {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - daysToShow);

  const spendingMap = new Map<string, number>();

  // Initialize all days with 0
  for (let i = 0; i <= daysToShow; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    spendingMap.set(dateKey, 0);
  }

  // Add transaction amounts
  transactions.forEach((transaction) => {
    const transactionDate = new Date(transaction.date);
    if (transactionDate >= startDate && transactionDate <= today) {
      const dateKey = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}-${String(transactionDate.getDate()).padStart(2, '0')}`;
      const current = spendingMap.get(dateKey) || 0;
      spendingMap.set(dateKey, current + transaction.amount);
    }
  });

  return Array.from(spendingMap.entries()).map(([date, amount]) => ({
    date,
    amount,
  }));
}

export function getTopCategories(
  categorySpending: CategorySpending[],
  limit: number = 5
): CategorySpending[] {
  return [...categorySpending]
    .filter(cat => !cat.isUnallocated) // Exclude unallocated funds from top categories
    .sort((a, b) => b.spent - a.spent)
    .slice(0, limit);
}

export function getRemainingDaysInMonth(): number {
  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return lastDay.getDate() - today.getDate() + 1;
}

export function getDailyBudgetRemaining(
  remainingBudget: number
): number {
  const daysLeft = getRemainingDaysInMonth();
  return daysLeft > 0 ? remainingBudget / daysLeft : 0;
}

export function getDailyAllocatedBudgetRemaining(
  budget: Budget,
  transactions: Transaction[]
): number {
  const categorySpending = calculateCategorySpending(budget, transactions);
  const totalAllocatedRemaining = categorySpending.reduce((sum, cat) => sum + Math.max(0, cat.remaining), 0);
  const daysLeft = getRemainingDaysInMonth();
  return daysLeft > 0 ? totalAllocatedRemaining / daysLeft : 0;
}

export function getMonthProgress(): number {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const totalDays = lastDay.getDate();
  const daysPassed = today.getDate();
  return Math.round((daysPassed / totalDays) * 100);
}

export function calculateOverBudgetInsights(
  budget: Budget,
  transactions: Transaction[]
): {
  overBudgetCategories: CategorySpending[];
  totalOverage: number;
  canCoverWithUnallocated: boolean;
  coveragePercentage: number;
} {
  const categorySpending = calculateCategorySpending(budget, transactions);
  const { unallocatedAmount } = calculateBudgetFlexibility(budget);
  
  const overBudgetCategories = categorySpending.filter(cat => cat.remaining < 0);
  const totalOverage = overBudgetCategories.reduce((sum, cat) => sum + Math.abs(cat.remaining), 0);
  
  const canCoverWithUnallocated = unallocatedAmount >= totalOverage;
  const coveragePercentage = totalOverage > 0 
    ? Math.min(100, Math.round((unallocatedAmount / totalOverage) * 100))
    : 100;

  return {
    overBudgetCategories,
    totalOverage,
    canCoverWithUnallocated,
    coveragePercentage,
  };
}