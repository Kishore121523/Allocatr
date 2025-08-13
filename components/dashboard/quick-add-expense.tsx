// components/dashboard/quick-add-expense.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ExpenseModal } from '@/components/expense/expense-modal';

export function QuickAddExpense() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 animate-fade-in-scale animate-delay-500">
        <Button
          size="lg"
          className="rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 ease-out h-14 w-14 p-0 hover:scale-110 hover:-translate-y-1 active:scale-95 group"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="h-6 w-6 transition-transform duration-200 group-hover:rotate-90" />
          <span className="sr-only">Add Expense</span>
        </Button>
      </div>

      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}