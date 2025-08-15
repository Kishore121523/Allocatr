// app/transactions/page.tsx
"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { conditionalPageGsap, shouldAnimatePageTransitions, ANIMATION_CONFIG } from '@/lib/animation-config';
import { ProtectedRoute } from "@/components/layout/protected-route";
import { AppHeader } from "@/components/layout/app-header";
import { useTransactions } from "@/hooks/use-transactions";
import { useBudget } from "@/hooks/use-budget";
import { useMonth } from "@/providers/month-provider";
import { ExpenseModal } from "@/components/expense/expense-modal";
import { Transaction, DEFAULT_CATEGORIES } from "@/types";
import { TransactionsHeader } from "@/components/transactions/header";
import { TransactionsFilters } from "@/components/transactions/filters";
import { TransactionsList } from "@/components/transactions/list";

export default function TransactionsPage() {
  const { currentMonth } = useMonth();
  const { transactions, loading, deleteTransaction } = useTransactions(currentMonth);
  const { budget } = useBudget(currentMonth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');

  // Refs for GSAP animations
  const headerRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const categories = useMemo(
    () => Array.from(new Set(transactions.map(t => t.categoryName || ''))).filter(Boolean),
    [transactions]
  );

  // Create a mapping of category names to colors from budget data
  const categoryColors = useMemo(() => {
    const colorMap = new Map<string, string>();
    
    // First, add default category colors as fallback
    DEFAULT_CATEGORIES.forEach(cat => {
      colorMap.set(cat.name, cat.color);
    });
    
    // Then override with budget-specific colors if available
    if (budget?.categories) {
      budget.categories.forEach(cat => {
        colorMap.set(cat.name, cat.color);
      });
    }
    
    return colorMap;
  }, [budget]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return transactions.filter(t => {
      const matchesSearch =
        !s ||
        t.description.toLowerCase().includes(s) ||
        (t.categoryName || '').toLowerCase().includes(s);
      const matchesCategory = category === 'all' || t.categoryName === category;
      return matchesSearch && matchesCategory;
    });
  }, [transactions, search, category]);

  const total = useMemo(() => filtered.reduce((sum, t) => sum + t.amount, 0), [filtered]);

  const openAdd = () => {
    setEditing(null);
    setIsModalOpen(true);
  };

  const openEdit = (t: Transaction) => {
    setEditing(t);
    setIsModalOpen(true);
  };

  // GSAP animation for page elements (controlled by page transition config - subtle)
  useEffect(() => {
    const elements = [headerRef.current, filtersRef.current, listRef.current].filter(Boolean);
    
    if (elements.length > 0 && shouldAnimatePageTransitions()) {
      const config = ANIMATION_CONFIG.pageTransitions;
      
      // Set initial state - subtle
      conditionalPageGsap.set(elements, {
        x: config.transform.x,
        opacity: config.transform.opacity
      });

      // Animate elements with subtle stagger
      conditionalPageGsap.to(elements, {
        x: 0,
        opacity: 1,
        duration: config.duration,
        ease: config.ease,
        stagger: config.stagger,
        delay: config.delay
      });
    }
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <AppHeader />

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div ref={headerRef}>
            <TransactionsHeader onAdd={openAdd} />
          </div>

          <div ref={filtersRef}>
            <TransactionsFilters
              search={search}
              onSearchChange={setSearch}
              category={category}
              onCategoryChange={setCategory}
              categories={categories}
            />
          </div>

          <div ref={listRef}>
            <TransactionsList
              loading={loading}
              transactions={filtered}
              total={total}
              onEdit={openEdit}
              onDelete={deleteTransaction}
              categoryColors={categoryColors}
            />
          </div>
        </main>

        <ExpenseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          transaction={editing || undefined}
        />
      </div>
    </ProtectedRoute>
  );
}