// hooks/use-budget.ts

'use client';

import { useEffect, useState } from 'react';
import { 
  doc, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  setDoc, 
  updateDoc,
  deleteDoc 
} from 'firebase/firestore';
import { db, COLLECTIONS } from '@/lib/firebase';
import { useAuth } from '@/providers/auth-provider';
import { Budget, BudgetCategory } from '@/types';
import { getMonthKey } from '@/lib/utils';
import { toast } from 'sonner';

export function useBudget(monthKey?: string) {
  const { user } = useAuth();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentMonth = monthKey || getMonthKey();

  useEffect(() => {
    if (!user) {
      setBudget(null);
      setLoading(false);
      return;
    }

    const budgetQuery = query(
      collection(db, COLLECTIONS.BUDGETS),
      where('userId', '==', user.id),
      where('month', '==', currentMonth)
    );

    const unsubscribe = onSnapshot(
      budgetQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const budgetDoc = snapshot.docs[0];
          setBudget({
            id: budgetDoc.id,
            ...budgetDoc.data(),
            createdAt: budgetDoc.data().createdAt?.toDate(),
            updatedAt: budgetDoc.data().updatedAt?.toDate(),
          } as Budget);
        } else {
          setBudget(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching budget:', err);
        setError(err.message);
        setLoading(false);
        toast.error('Error loading budget', {
          description: 'Please try refreshing the page.',
        });
      }
    );

    return () => unsubscribe();
  }, [user, currentMonth]);

  const createBudget = async (
    monthlyIncome: number,
    categories: BudgetCategory[]
  ): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const budgetId = `${user.id}_${currentMonth}`;
      const budgetData: Omit<Budget, 'id'> = {
        userId: user.id,
        monthlyIncome,
        categories,
        month: currentMonth,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, COLLECTIONS.BUDGETS, budgetId), budgetData);
      
      toast.success('Budget created', {
        description: 'Your budget has been set up successfully.',
      });
    } catch (err) {
      console.error('Error creating budget:', err);
      toast.error('Error creating budget', {
        description: 'Please try again.',
      });
      throw err;
    }
  };

  const updateBudget = async (
    updates: Partial<Omit<Budget, 'id' | 'userId' | 'createdAt'>>
  ): Promise<void> => {
    if (!user || !budget) throw new Error('No budget to update');

    try {
      await updateDoc(doc(db, COLLECTIONS.BUDGETS, budget.id), {
        ...updates,
        updatedAt: new Date(),
      });
      
      toast.success('Budget updated', {
        description: 'Your changes have been saved.',
      });
    } catch (err) {
      console.error('Error updating budget:', err);
      toast.error('Error updating budget', {
        description: 'Please try again.',
      });
      throw err;
    }
  };

  const deleteBudget = async (): Promise<void> => {
    if (!budget) throw new Error('No budget to delete');

    try {
      await deleteDoc(doc(db, COLLECTIONS.BUDGETS, budget.id));
      
      toast.success('Budget deleted', {
        description: 'Your budget has been removed.',
      });
    } catch (err) {
      console.error('Error deleting budget:', err);
      toast.error('Error deleting budget', {
        description: 'Please try again.',
      });
      throw err;
    }
  };

  return {
    budget,
    loading,
    error,
    createBudget,
    updateBudget,
    deleteBudget,
  };
}