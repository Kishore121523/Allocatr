// app/transactions/page.tsx
"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ProtectedRoute } from "@/components/layout/protected-route";
import { AppHeader } from "@/components/layout/app-header";
import { getMonthKey } from "@/lib/utils";
import { useTransactions } from "@/hooks/use-transactions";
import { useBudget } from "@/hooks/use-budget";
import { ExpenseModal } from "@/components/expense/expense-modal";
import { Transaction, DEFAULT_CATEGORIES } from "@/types";
import { TransactionsHeader } from "@/components/transactions/header";
import { TransactionsFilters } from "@/components/transactions/filters";
import { TransactionsList } from "@/components/transactions/list";

export default function TransactionsPage() {
  const [month, setMonth] = useState(getMonthKey());
  const { transactions, loading, deleteTransaction } = useTransactions(month);
  const { budget } = useBudget(month);
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

  // GSAP animation for page elements
  useEffect(() => {
    const elements = [headerRef.current, filtersRef.current, listRef.current].filter(Boolean);
    
    if (elements.length > 0) {
      // Set initial state
      gsap.set(elements, {
        x: -30
      });

      // Animate elements with stagger
      gsap.to(elements, {
        x: 0,
        duration: 0.4,
        ease: "power2.out",
        stagger: 0.1,
        delay: 0.1
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
              month={month}
              onMonthChange={setMonth}
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