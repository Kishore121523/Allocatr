// app/budget/page.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { conditionalPageGsap, shouldAnimatePageTransitions, ANIMATION_CONFIG } from '@/lib/animation-config';
import { ProtectedRoute } from '@/components/layout/protected-route';
import { AppHeader } from '@/components/layout/app-header';
// UI elements now handled by modular components
import { useBudget } from '@/hooks/use-budget';
import { useMonth } from '@/providers/month-provider';
import { DEFAULT_CATEGORIES, BudgetCategory } from '@/types';
import { formatCurrency, parseCurrencyInput } from '@/lib/utils';
// icons handled inside modular components
import { toast } from 'sonner';
import { IncomeCard } from '@/components/budget/income-card';
import { AllocationSummaryCard } from '@/components/budget/allocation-summary-card';
import { AddCategoriesCard } from '@/components/budget/add-categories-card';
import { AllocatedCategoriesCard } from '@/components/budget/allocated-categories-card';
import { QuickAddPopularCard } from '@/components/budget/quick-add-popular-card';
import { ValidationAlert } from '@/components/budget/validation-alert';
import { SaveActions } from '@/components/budget/save-actions';

// Popular categories that most people use
const POPULAR_CATEGORIES = [
  'Housing',
  'Food & Dining',
  'Transportation',
  'Healthcare',
  'Entertainment',
  'Savings'
];

export default function BudgetPage() {
  const router = useRouter();
  const { currentMonth } = useMonth();
  const { budget, loading, createBudget, updateBudget } = useBudget(currentMonth);
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  // Refs for GSAP animations
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (budget) {
      setMonthlyIncome(budget.monthlyIncome.toString());
      setCategories(budget.categories);
    } else {
      // Initialize empty categories array - we'll add them as needed
      setCategories([]);
    }
  }, [budget]);

  const [debouncedSave, setDebouncedSave] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedCategorySave, setDebouncedCategorySave] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Cleanup timeouts on unmount
    return () => {
      if (debouncedSave) clearTimeout(debouncedSave);
      if (debouncedCategorySave) clearTimeout(debouncedCategorySave);
    };
  }, [debouncedSave, debouncedCategorySave]);

  const handleIncomeChange = async (value: string) => {
    setMonthlyIncome(value);
    setShowValidation(false);
    
    // Clear existing timeout
    if (debouncedSave) {
      clearTimeout(debouncedSave);
    }
    
    // Set new timeout to save after 1.5 seconds of no typing
    const income = parseCurrencyInput(value);
    if (budget && income > 0) {
      const timeoutId = setTimeout(async () => {
        try {
          await updateBudget({
            monthlyIncome: income,
            categories: budget.categories,
          });
          toast.success('Income saved');
        } catch (error) {
          console.error('Error updating income:', error);
          toast.error('Failed to save income');
        }
      }, 1500);
      
      setDebouncedSave(timeoutId);
    }
  };



  const handleCategoryAmountChange = async (categoryId: string, value: string) => {
    const amount = parseCurrencyInput(value);
    
    // Update local state immediately for responsiveness
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId ? { ...cat, allocatedAmount: amount } : cat
      )
    );
    setShowValidation(false);

    // Clear existing timeout
    if (debouncedCategorySave) {
      clearTimeout(debouncedCategorySave);
    }

    // Save to database with debouncing if we have an existing budget
    if (budget) {
      const timeoutId = setTimeout(async () => {
        try {
          const updatedCategories = categories.map(cat =>
            cat.id === categoryId ? { ...cat, allocatedAmount: amount } : cat
          );
          
          await updateBudget({
            monthlyIncome: budget.monthlyIncome,
            categories: updatedCategories,
          });
          // Don't show toast for debounced saves to avoid spam
        } catch (error) {
          console.error('Error updating category amount:', error);
          toast.error('Failed to save changes');
        }
      }, 1500);
      
      setDebouncedCategorySave(timeoutId);
    }
  };



  const addCategoryFromDefault = async (categoryName: string) => {
    const defaultCategory = DEFAULT_CATEGORIES.find(cat => cat.name === categoryName);
    if (!defaultCategory) return;

    const newCategory: BudgetCategory = {
      ...defaultCategory,
      id: `cat_${Date.now()}`,
      allocatedAmount: 0,
    };
    
    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);

    // Save to database if we have an existing budget
    if (budget) {
      try {
        await updateBudget({
          monthlyIncome: budget.monthlyIncome,
          categories: updatedCategories,
        });
        toast.success(`Added ${categoryName} category`);
      } catch (error) {
        console.error('Error adding category:', error);
        toast.error('Failed to add category');
        // Revert local state on error
        setCategories(categories);
      }
    }
  };

  const addCustomCategory = async () => {
    const newCategory: BudgetCategory = {
      id: `custom_${Date.now()}`,
      name: 'New Category',
      allocatedAmount: 0,
      color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
      isCustom: true,
    };
    
    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    
    // Start editing the new category immediately
    setEditingCategoryId(newCategory.id);
    setEditingCategoryName(newCategory.name);

    // Save to database if we have an existing budget
    if (budget) {
      try {
        await updateBudget({
          monthlyIncome: budget.monthlyIncome,
          categories: updatedCategories,
        });
        toast.success('Added custom category');
      } catch (error) {
        console.error('Error adding custom category:', error);
        toast.error('Failed to add category');
        // Revert local state on error
        setCategories(categories);
        setEditingCategoryId(null);
      }
    }
  };

  const removeCategory = async (categoryId: string) => {
    const categoryToRemove = categories.find(cat => cat.id === categoryId);
    const updatedCategories = categories.filter(cat => cat.id !== categoryId);
    setCategories(updatedCategories);

    // Save to database if we have an existing budget
    if (budget) {
      try {
        await updateBudget({
          monthlyIncome: budget.monthlyIncome,
          categories: updatedCategories,
        });
        toast.success(`Removed ${categoryToRemove?.name} category`);
      } catch (error) {
        console.error('Error removing category:', error);
        toast.error('Failed to remove category');
        // Revert local state on error
        setCategories(categories);
      }
    }
  };

  const startEditingCategory = (categoryId: string, currentName: string) => {
    setEditingCategoryId(categoryId);
    setEditingCategoryName(currentName);
  };

  const saveEditingCategory = async (categoryId: string) => {
    if (!editingCategoryName.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }

    const updatedCategories = categories.map(cat =>
      cat.id === categoryId ? { ...cat, name: editingCategoryName.trim() } : cat
    );
    
    setCategories(updatedCategories);
    setEditingCategoryId(null);
    setEditingCategoryName('');

    // Save to database if we have an existing budget
    if (budget) {
      try {
        await updateBudget({
          monthlyIncome: budget.monthlyIncome,
          categories: updatedCategories,
        });
        toast.success('Category name updated');
      } catch (error) {
        console.error('Error updating category name:', error);
        toast.error('Failed to update category name');
        // Revert local state on error
        setCategories(categories);
      }
    }
  };

  const cancelEditingCategory = () => {
    setEditingCategoryId(null);
    setEditingCategoryName('');
  };

  const addToSavings = async () => {
    const income = parseCurrencyInput(monthlyIncome);
    const totalAllocated = categories.reduce((sum, cat) => sum + cat.allocatedAmount, 0);
    const remaining = income - totalAllocated;
    
    if (remaining <= 0) return;

    // Find existing savings category or create one
    const savingsCategory = categories.find(cat => 
      cat.name.toLowerCase().includes('saving') || 
      cat.name.toLowerCase().includes('emergency')
    );

    let updatedCategories;
    if (savingsCategory) {
      // Add to existing savings category
      updatedCategories = categories.map(cat =>
        cat.id === savingsCategory.id 
          ? { ...cat, allocatedAmount: cat.allocatedAmount + remaining }
          : cat
      );
    } else {
      // Create new savings category
      const newSavingsCategory: BudgetCategory = {
        id: `savings_${Date.now()}`,
        name: 'Savings',
        allocatedAmount: remaining,
        color: '#10b981', // Green color for savings
        icon: 'PiggyBank',
        isCustom: true,
      };
      updatedCategories = [...categories, newSavingsCategory];
    }

    setCategories(updatedCategories);

    // Save to database if we have an existing budget
    if (budget) {
      try {
        await updateBudget({
          monthlyIncome: budget.monthlyIncome,
          categories: updatedCategories,
        });
        toast.success(`Added ${formatCurrency(remaining)} to savings`);
      } catch (error) {
        console.error('Error adding to savings:', error);
        toast.error('Failed to add to savings');
        // Revert local state on error
        setCategories(categories);
      }
    }
  };

  const handleSubmit = async () => {
    const income = parseCurrencyInput(monthlyIncome);
    
    // Clear any pending debounced saves
    if (debouncedSave) {
      clearTimeout(debouncedSave);
      setDebouncedSave(null);
    }
    if (debouncedCategorySave) {
      clearTimeout(debouncedCategorySave);
      setDebouncedCategorySave(null);
    }
    
    if (income <= 0) {
      setShowValidation(true);
      toast.error('Please enter a valid monthly income');
      return;
    }

    const totalAllocated = categories.reduce((sum, cat) => sum + cat.allocatedAmount, 0);
    
    if (totalAllocated > income) {
      setShowValidation(true);
      toast.error('Your allocations exceed your income');
      return;
    }

    setIsSubmitting(true);

    try {
      if (budget) {
        await updateBudget({
          monthlyIncome: income,
          categories,
        });
        toast.success('Budget saved successfully');
      } else {
        // Create new budget
        await createBudget(income, categories);
        toast.success('Budget created successfully');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error saving budget:', error);
      toast.error('Failed to save budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  const income = parseCurrencyInput(monthlyIncome);
  const totalAllocated = categories.reduce((sum, cat) => sum + cat.allocatedAmount, 0);
  const remaining = income - totalAllocated;
  const allocationPercentage = income > 0 ? (totalAllocated / income) * 100 : 0;
  const isOverBudget = remaining < 0;
  const hasUnallocated = remaining > 0 && income > 0;

  // Filter available categories
  const usedCategoryNames = categories.map(cat => cat.name);
  const availablePopularCategories = POPULAR_CATEGORIES.filter(name => !usedCategoryNames.includes(name));
  
  const filteredAvailableCategories = DEFAULT_CATEGORIES.filter(cat => 
    !usedCategoryNames.includes(cat.name) &&
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // Set initial state immediately to prevent flash
  useEffect(() => {
    const elements = [headerRef.current, ...contentRefs.current].filter(Boolean);
    
    if (elements.length > 0 && shouldAnimatePageTransitions()) {
      const config = ANIMATION_CONFIG.pageTransitions;
      
      // Set initial hidden state immediately
      conditionalPageGsap.set(elements, {
        x: config.transform.x,
        opacity: config.transform.opacity
      });
    }
  }, []); // Run once on mount

  // GSAP animation for page elements (controlled by page transition config - wait for data to load)
  useEffect(() => {
    const elements = [headerRef.current, ...contentRefs.current].filter(Boolean);
    
    // Wait for loading to finish AND budget state to be determined (even if null)
    const isDataReady = !loading && (budget !== undefined);
    
    if (elements.length > 0 && isDataReady && shouldAnimatePageTransitions()) {
      const config = ANIMATION_CONFIG.pageTransitions;

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
  }, [loading, budget]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <AppHeader />
        
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div ref={headerRef} className="mb-8" style={{ opacity: shouldAnimatePageTransitions() ? 0 : 1 }}>
            <h1 className="text-3xl font-bold mb-2">
              {budget ? 'Edit Budget' : 'Set Up Your Budget'}
            </h1>
            <p className="text-muted-foreground">
              Allocate your income across categories. You can leave some unallocated if you prefer.
            </p>
          </div>

          <div ref={(el) => { contentRefs.current[0] = el; }} style={{ opacity: shouldAnimatePageTransitions() ? 0 : 1 }}>
            <IncomeCard
              monthlyIncome={monthlyIncome}
              onChange={handleIncomeChange}
            />
          </div>

          <div ref={(el) => { contentRefs.current[1] = el; }} style={{ opacity: shouldAnimatePageTransitions() ? 0 : 1 }}>
            <AllocationSummaryCard
              allocationPercentage={allocationPercentage}
              totalAllocated={totalAllocated}
              income={income}
              remaining={remaining}
              hasUnallocated={hasUnallocated}
              isOverBudget={isOverBudget}
              onAddToSavings={addToSavings}
            />
          </div>

          {/* Flexible Budgeting Info moved to tooltip in Unallocated Funds section */}

          <div ref={(el) => { contentRefs.current[2] = el; }} style={{ opacity: shouldAnimatePageTransitions() ? 0 : 1 }}>
            <AddCategoriesCard
            showAllCategories={showAllCategories}
            onToggleShowAll={() => setShowAllCategories(!showAllCategories)}
            categorySearch={categorySearch}
            onCategorySearchChange={setCategorySearch}
            filteredAvailableCategories={filteredAvailableCategories}
            onAddCategoryFromDefault={addCategoryFromDefault}
            onAddCustomCategory={addCustomCategory}
            />
          </div>

          <div ref={(el) => { contentRefs.current[3] = el; }} style={{ opacity: shouldAnimatePageTransitions() ? 0 : 1 }}>
            <AllocatedCategoriesCard
            categories={categories}
            editingCategoryId={editingCategoryId}
            editingCategoryName={editingCategoryName}
            onSetEditingCategoryName={setEditingCategoryName}
            onStartEditingCategory={startEditingCategory}
            onSaveEditingCategory={saveEditingCategory}
            onCancelEditingCategory={cancelEditingCategory}
            onCategoryAmountChange={handleCategoryAmountChange}
            onRemoveCategory={removeCategory}
            />
          </div>

          <div ref={(el) => { contentRefs.current[4] = el; }}>
            <QuickAddPopularCard
              availablePopularCategories={availablePopularCategories}
              onAddCategoryFromDefault={addCategoryFromDefault}
            />
          </div>

          {/* Browse All Categories - removed (moved above) */}

          <div ref={(el) => { contentRefs.current[5] = el; }}>
            <ValidationAlert show={showValidation} income={income} isOverBudget={isOverBudget} remaining={remaining} />
          </div>

          <div ref={(el) => { contentRefs.current[6] = el; }}>
            <SaveActions
            onSubmit={handleSubmit}
            disabled={isSubmitting || income <= 0 || isOverBudget}
            isSubmitting={isSubmitting}
            hasExistingBudget={!!budget}
            />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}