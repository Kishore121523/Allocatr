// hooks/use-transactions.ts

import { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  Timestamp
} from 'firebase/firestore';
import { startOfMonth, endOfMonth } from 'date-fns';
import { db, COLLECTIONS } from '../lib/firebase';
import { useAuth } from '../providers/auth-provider';
import { Transaction, CategorySpending, DashboardStats } from '../types';
import { parseYYYYMMDDToLocalDate } from '../lib/utils';

export function useTransactions(monthKey?: string) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    let queryConstraints = [
      where('userId', '==', user.id),
      orderBy('date', 'desc'),
      orderBy('createdAt', 'desc')
    ];

    // Filter by month if specified
    if (monthKey) {
      const monthDate = parseYYYYMMDDToLocalDate(monthKey + '-01');
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      queryConstraints = [
        where('userId', '==', user.id),
        where('date', '>=', Timestamp.fromDate(monthStart)),
        where('date', '<=', Timestamp.fromDate(monthEnd)),
        orderBy('date', 'desc'),
        orderBy('createdAt', 'desc')
      ];
    }

    const transactionsQuery = query(
      collection(db, COLLECTIONS.TRANSACTIONS),
      ...queryConstraints
    );

    const unsubscribe = onSnapshot(
      transactionsQuery,
      (snapshot) => {
        const transactionsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate() || new Date(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as Transaction[];
        
        setTransactions(transactionsList);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching transactions:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, monthKey]);

  const addTransaction = async (
    amount: number,
    description: string,
    categoryId: string,
    categoryName: string,
    date: Date,
    isAICategorized: boolean = false
  ): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const transactionData = {
        userId: user.id,
        amount,
        description,
        categoryId,
        categoryName,
        date: Timestamp.fromDate(date),
        isAICategorized,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
      };

      await addDoc(collection(db, COLLECTIONS.TRANSACTIONS), transactionData);
    } catch (err) {
      console.error('Error adding transaction:', err);
      throw err;
    }
  };

  const updateTransaction = async (
    transactionId: string,
    updates: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>
  ): Promise<void> => {
    try {
      const updateData = {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date()),
      };

      if (updates.date) {
        (updateData as any).date = Timestamp.fromDate(updates.date);
      }

      await updateDoc(doc(db, COLLECTIONS.TRANSACTIONS, transactionId), updateData);
    } catch (err) {
      console.error('Error updating transaction:', err);
      throw err;
    }
  };

  const deleteTransaction = async (transactionId: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.TRANSACTIONS, transactionId));
    } catch (err) {
      console.error('Error deleting transaction:', err);
      throw err;
    }
  };

  return {
    transactions,
    loading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
}

// Hook to calculate category spending and dashboard stats
export function useCategorySpending(
  transactions: Transaction[],
  budget: any
): {
  categorySpending: CategorySpending[];
  dashboardStats: DashboardStats;
  categoryColors: Map<string, string>;
} {
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalBudget: 0,
    totalSpent: 0,
    remainingBudget: 0,
    percentageUsed: 0,
    categoriesOverBudget: 0,
    transactionCount: 0,
  });
  const [categoryColors, setCategoryColors] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    if (!budget) {
      setCategorySpending([]);
      setDashboardStats({
        totalBudget: 0,
        totalSpent: 0,
        remainingBudget: 0,
        percentageUsed: 0,
        categoriesOverBudget: 0,
        transactionCount: transactions.length,
      });
      return;
    }

    // Calculate spending by category
    const spendingByCategory = new Map<string, number>();
    const colors = new Map<string, string>();

    // Initialize with budget categories
    budget.categories.forEach((category: any) => {
      spendingByCategory.set(category.id, 0);
      colors.set(category.id, category.color);
    });

    // Sum up transactions by category
    transactions.forEach(transaction => {
      const currentSpent = spendingByCategory.get(transaction.categoryId) || 0;
      spendingByCategory.set(transaction.categoryId, currentSpent + transaction.amount);
    });

    // Calculate category spending data
    const categorySpendingData: CategorySpending[] = budget.categories.map((category: any) => {
      const spent = spendingByCategory.get(category.id) || 0;
      const remaining = Math.max(0, category.allocatedAmount - spent);
      const percentageUsed = category.allocatedAmount > 0 
        ? Math.round((spent / category.allocatedAmount) * 100) 
        : 0;

      return {
        categoryId: category.id,
        categoryName: category.name,
        allocated: category.allocatedAmount,
        spent,
        isUnallocated: false,
        remaining,
        percentageUsed,
        color: category.color,
      };
    });

    // Calculate dashboard stats
    const totalBudget = budget.monthlyIncome;
    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
    const remainingBudget = Math.max(0, totalBudget - totalSpent);
    const percentageUsed = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
    const categoriesOverBudget = categorySpendingData.filter(c => c.percentageUsed > 100).length;

    setCategorySpending(categorySpendingData);
    setCategoryColors(colors);
    setDashboardStats({
      totalBudget,
      totalSpent,
      remainingBudget,
      percentageUsed,
      categoriesOverBudget,
      transactionCount: transactions.length,
    });
  }, [transactions, budget]);

  return {
    categorySpending,
    dashboardStats,
    categoryColors,
  };
}
