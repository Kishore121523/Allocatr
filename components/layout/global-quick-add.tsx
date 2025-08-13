// components/layout/global-quick-add.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ExpenseModal } from '@/components/expense/expense-modal';

export function GlobalQuickAdd() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Global Floating Action Button */}
      <div className="fixed bottom-10 right-10 z-50">
        <Button
          size="lg"
          className="rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 ease-out h-14 w-14 p-0 hover:scale-110 hover:-translate-y-1 active:scale-95 group bg-primary hover:bg-primary/90"
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
