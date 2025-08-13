// hooks/use-transactions.ts

'use client';

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
import { db, COLLECTIONS } from '@/lib/firebase';
import { useAuth } from '@/providers/auth-provider';
import { Transaction } from '@/types';
import { getMonthKey } from '@/lib/utils';
import { toast } from 'sonner';

export function useTransactions(monthKey?: string) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentMonth = monthKey || getMonthKey();

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    // Get start and end of month
    const [year, month] = currentMonth.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const transactionsQuery = query(
      collection(db, COLLECTIONS.TRANSACTIONS),
      where('userId', '==', user.id),
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate)),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(
      transactionsQuery,
      (snapshot) => {
        const transactionsList: Transaction[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          transactionsList.push({
            id: doc.id,
            ...data,
            date: data.date?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as Transaction);
        });
        setTransactions(transactionsList);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching transactions:', err);
        setError(err.message);
        setLoading(false);
        toast.error('Error loading transactions', {
          description: 'Please try refreshing the page.',
        });
      }
    );

    return () => unsubscribe();
  }, [user, currentMonth]);

  const addTransaction = async (
    transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const transactionData = {
        ...transaction,
        userId: user.id,
        // Ensure we preserve the local day by converting to a Timestamp at local time
        date: Timestamp.fromDate(new Date(
          transaction.date.getFullYear(),
          transaction.date.getMonth(),
          transaction.date.getDate(),
          transaction.date.getHours(),
          transaction.date.getMinutes(),
          transaction.date.getSeconds(),
          transaction.date.getMilliseconds(),
        )),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(
        collection(db, COLLECTIONS.TRANSACTIONS),
        transactionData
      );

      toast.success('Expense added', {
        description: `$${transaction.amount.toFixed(2)} added to ${transaction.categoryName || 'category'}.`,
      });

      return docRef.id;
    } catch (err) {
      console.error('Error adding transaction:', err);
      toast.error('Error adding expense', {
        description: 'Please try again.',
      });
      throw err;
    }
  };

  const updateTransaction = async (
    transactionId: string,
    updates: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>
  ): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      if (updates.date) {
        const d = updates.date;
        updateData.date = Timestamp.fromDate(new Date(
          d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()
        ));
      }

      await updateDoc(
        doc(db, COLLECTIONS.TRANSACTIONS, transactionId),
        updateData
      );

      toast.success('Transaction updated', {
        description: 'Your changes have been saved.',
      });
    } catch (err) {
      console.error('Error updating transaction:', err);
      toast.error('Error updating transaction', {
        description: 'Please try again.',
      });
      throw err;
    }
  };

  const deleteTransaction = async (transactionId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    try {
      await deleteDoc(doc(db, COLLECTIONS.TRANSACTIONS, transactionId));

      toast.success('Transaction deleted', {
        description: 'The expense has been removed.',
      });
    } catch (err) {
      console.error('Error deleting transaction:', err);
      toast.error('Error deleting transaction', {
        description: 'Please try again.',
      });
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