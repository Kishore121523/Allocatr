'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Mic, MicOff, Sparkles, Loader2, Wand2, CalendarIcon, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { useBudget } from '@/hooks/use-budget';
import { useTransactions } from '@/hooks/use-transactions';
import { useMonth } from '@/providers/month-provider';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useAICategorization } from '@/hooks/use-ai-categorization';
import { parseCurrencyInput, todayLocalYYYYMMDD, formatLocalDateYYYYMMDD, parseYYYYMMDDToLocalDate } from '@/lib/utils';
import { calculateBudgetFlexibility } from '@/lib/budget-calculations';
import { DEFAULT_CATEGORIES } from '@/types';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: any; // For editing existing transactions
}

export function ExpenseModal({ isOpen, onClose, transaction }: ExpenseModalProps) {
  const { currentMonth } = useMonth();
  const { budget, updateBudget } = useBudget(currentMonth);
  const { addTransaction, updateTransaction } = useTransactions(currentMonth);
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported: isSpeechSupported,
  } = useSpeechRecognition();
  const { categorizeExpense, isLoading: isAILoading } = useAICategorization();

  const [naturalInput, setNaturalInput] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(todayLocalYYYYMMDD());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAISuggestion, setIsAISuggestion] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState<{
    category: any;
    amount: number;
  } | null>(null);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [shouldSetBudget, setShouldSetBudget] = useState(false);

  useEffect(() => {
    if (transcript) {
      setNaturalInput(transcript);
      // Don't automatically call AI categorization - let user decide when to extract with AI
    }
  }, [transcript]);

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount.toString());
      setDescription(transaction.description);
      
      // Check if the category ID is valid (exists in budget categories)
      const isValidCategory = budget?.categories.some(cat => cat.id === transaction.categoryId);
      if (isValidCategory) {
        setCategoryId(transaction.categoryId);
      } else {
        // If category ID is invalid (e.g., 'new-entertainment'), clear it
        // This will show the category as unselected in the dropdown
        setCategoryId('');
        console.warn(`Transaction has invalid category ID: ${transaction.categoryId}`);
      }
      
      setDate(formatLocalDateYYYYMMDD(transaction.date));
    }
  }, [transaction, budget]);

  // Helper function to safely parse AI date to local format
  const parseAIDateToLocal = (aiDate: string): string => {
    try {
      // If the AI date is already in YYYY-MM-DD format, validate and return it
      if (/^\d{4}-\d{2}-\d{2}$/.test(aiDate)) {
        const testDate = parseYYYYMMDDToLocalDate(aiDate);
        // Make sure it's a valid date and not in the future
        if (testDate && testDate <= new Date()) {
          return aiDate;
        }
      }
      
      // Try to parse other date formats and convert to local YYYY-MM-DD
      const parsedDate = new Date(aiDate);
      if (!isNaN(parsedDate.getTime()) && parsedDate <= new Date()) {
        return formatLocalDateYYYYMMDD(parsedDate);
      }
      
      // If parsing fails or date is invalid, return today's date
      return todayLocalYYYYMMDD();
    } catch (error) {
      console.warn('Failed to parse AI date:', aiDate, error);
      return todayLocalYYYYMMDD();
    }
  };

  const handleAICategorization = async (input: string) => {
    if (!input.trim() || !budget) return;

    try {
      const result = await categorizeExpense(input, budget.categories);
      
      if (result) {
        setAmount(result.amount.toString());
        setDescription(result.description);
        
        // Find matching category
        const matchingCategory = budget.categories.find(
          (cat) => cat.name.toLowerCase() === result.suggestedCategory.toLowerCase()
        );
        
        if (matchingCategory) {
          setCategoryId(matchingCategory.id);
          setIsAISuggestion(true);
        }

        // If AI parsed a date, safely convert it to local format
        if (result.date) {
          const localDate = parseAIDateToLocal(result.date);
          setDate(localDate);
        }

        toast.success('AI Categorization', {
          description: `Suggested: ${result.description} - $${result.amount} in ${result.suggestedCategory}${result.date ? ` on ${result.date}` : ''}`,
        });
      }
    } catch (error) {
      console.error('AI categorization error:', error);
    }
  };

  const handleSubmit = async () => {
    if (!budget) {
      toast.error('No budget found', {
        description: 'Please set up your budget first.',
      });
      return;
    }

    const parsedAmount = parseCurrencyInput(amount);
    
    if (parsedAmount <= 0) {
      toast.error('Invalid amount', {
        description: 'Please enter a valid amount.',
      });
      return;
    }

    if (!description.trim()) {
      toast.error('Missing description', {
        description: 'Please enter a description.',
      });
      return;
    }

    if (!categoryId) {
      toast.error('Missing category', {
        description: 'Please select a category.',
      });
      return;
    }

    // Check if it's a new category that needs to be added to budget
    if (categoryId.startsWith('new-')) {
      const categoryName = categoryId.replace('new-', '');
      const defaultCategory = DEFAULT_CATEGORIES.find(cat => cat.name === categoryName);
      
      if (defaultCategory) {
        // Create a temporary category object for the confirmation dialog
        const newCategory = {
          id: 'temp-' + Date.now(),
          name: defaultCategory.name,
          color: defaultCategory.color,
          icon: defaultCategory.icon,
          allocatedAmount: 0,
          isCustom: false,
        };
        
        setPendingSubmission({ category: newCategory, amount: parsedAmount });
        setBudgetAmount(parsedAmount.toString()); // Default to expense amount
        setShouldSetBudget(true); // Default to true for new categories
        setShowConfirmDialog(true);
        return;
      }
    }

    const category = budget.categories.find((c) => c.id === categoryId);
    
    // Check if adding expense to a category with zero or no budget allocation
    if (category && category.allocatedAmount === 0) {
      setPendingSubmission({ category, amount: parsedAmount });
      setBudgetAmount(parsedAmount.toString()); // Default to expense amount
      setShouldSetBudget(true); // Default to true for better UX
      setShowConfirmDialog(true);
      return;
    }

    // Proceed with normal submission
    await saveTransactionWithCategory(categoryId, '', 0, false);
  };

  const handleConfirmSubmission = async () => {
    let newCategoryId = categoryId;
    let newCategoryName = '';
    let newCategoryAllocatedAmount = 0;
    
    if (shouldSetBudget && pendingSubmission && budgetAmount.trim()) {
      const parsedBudgetAmount = parseCurrencyInput(budgetAmount);
      
      if (parsedBudgetAmount > 0) {
        try {
          // Check if this is a new category that needs to be added to the budget
          if (pendingSubmission.category.id.startsWith('temp-')) {
            newCategoryId = await addNewCategoryToBudget(pendingSubmission.category, parsedBudgetAmount);
            newCategoryName = pendingSubmission.category.name;
            newCategoryAllocatedAmount = parsedBudgetAmount;
          } else {
            // Update existing category budget
            await updateCategoryBudget(pendingSubmission.category.id, parsedBudgetAmount);
            newCategoryName = pendingSubmission.category.name;
            newCategoryAllocatedAmount = parsedBudgetAmount;
          }
          
          toast.success('Budget allocated', {
            description: `Set $${parsedBudgetAmount.toFixed(2)} budget for "${pendingSubmission.category.name}".`,
          });
        } catch (error) {
          console.error('Error updating budget:', error);
          toast.error('Failed to update budget', {
            description: 'Please try again.',
          });
          return;
        }
      }
    } else if (pendingSubmission?.category.id.startsWith('temp-')) {
      // Add new category with zero budget
      try {
        newCategoryId = await addNewCategoryToBudget(pendingSubmission.category, 0);
        newCategoryName = pendingSubmission.category.name;
        newCategoryAllocatedAmount = 0;
      } catch (error) {
        console.error('Error adding new category:', error);
        toast.error('Failed to add category', {
          description: 'Please try again.',
        });
        return;
      }
    }

    setShowConfirmDialog(false);
    setPendingSubmission(null);
    setBudgetAmount('');
    setShouldSetBudget(false);
    
    // Now save the transaction with the correct category ID and info
    await saveTransactionWithCategory(newCategoryId, newCategoryName, newCategoryAllocatedAmount, true);
  };

  const handleCancelSubmission = () => {
    setShowConfirmDialog(false);
    setPendingSubmission(null);
    setBudgetAmount('');
    setShouldSetBudget(false);
  };

  const updateCategoryBudget = async (categoryId: string, newBudgetAmount: number) => {
    if (!budget) return;

    const updatedCategories = budget.categories.map(cat => 
      cat.id === categoryId 
        ? { ...cat, allocatedAmount: newBudgetAmount }
        : cat
    );

    await updateBudget({ categories: updatedCategories });
  };

  const addNewCategoryToBudget = async (newCategory: any, budgetAmount: number): Promise<string> => {
    if (!budget) return '';

    // Generate a proper ID for the new category
    const categoryId = `${newCategory.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    
    const categoryToAdd = {
      id: categoryId,
      name: newCategory.name,
      color: newCategory.color,
      icon: newCategory.icon,
      allocatedAmount: budgetAmount,
      isCustom: false,
    };

    const updatedCategories = [...budget.categories, categoryToAdd];
    await updateBudget({ categories: updatedCategories });
    
    return categoryId;
  };

  const saveTransactionWithCategory = async (
    categoryIdToUse: string, 
    categoryName: string = '', 
    categoryAllocatedAmount: number = 0,
    skipWarning = false
  ) => {
    const parsedAmount = parseCurrencyInput(amount);
    
    // Use the provided category info if available, otherwise try to find it in budget
    let category = null;
    if (categoryName) {
      category = {
        id: categoryIdToUse,
        name: categoryName,
        allocatedAmount: categoryAllocatedAmount
      };
    } else {
      category = budget?.categories.find((c) => c.id === categoryIdToUse);
    }
    
    // If category still not found and we have pending submission, use that category info
    if (!category && pendingSubmission?.category) {
      category = {
        ...pendingSubmission.category,
        id: categoryIdToUse
      };
    }

    setIsSubmitting(true);

    try {
      const transactionData = {
        amount: parsedAmount,
        description: description.trim(),
        categoryId: categoryIdToUse,
        categoryName: category?.name || '',
        date: parseYYYYMMDDToLocalDate(date),
        isAICategorized: isAISuggestion,
      };

      if (transaction) {
        await updateTransaction(transaction.id, transactionData);
      } else {
        await addTransaction(transactionData);
      }

      // Show helpful toast about budget allocation for zero-budget categories
      if (!skipWarning && category && category.allocatedAmount === 0) {
        toast.warning('Expense added to unallocated funds', {
          description: `Consider allocating budget to "${category.name}" for better tracking.`,
          action: {
            label: 'Set Budget',
            onClick: () => {
              window.location.href = '/budget';
            },
          },
        });
      }

      // Reset form
      setNaturalInput('');
      setAmount('');
      setDescription('');
      setCategoryId('');
      setDate(todayLocalYYYYMMDD());
      setIsAISuggestion(false);
      setDatePickerOpen(false);
      setShowConfirmDialog(false);
      setPendingSubmission(null);
      
      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast.error('Error', {
        description: 'Failed to save transaction. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-[500px] max-h-[90vh] overflow-y-auto p-4 sm:p-6 [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-xl">
            {transaction ? 'Edit Expense' : 'Add Expense'}
          </DialogTitle>
          <DialogDescription className="hidden sm:block text-sm">
            Enter expense details or use natural language input with AI assistance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4">
          {/* Natural Language Input */}
          {!transaction && (
            <div className="space-y-3">
             
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <Textarea
                    placeholder='Grabbed a Coffee at Starbucks for $2.50...'
                    value={naturalInput}
                    onChange={(e) => setNaturalInput(e.target.value)}
                    className="resize-none text-sm"
                    rows={2}
                  />
                </div>
                {/* {isSpeechSupported && (
                  <Button
                    type="button"
                    variant={isListening ? 'destructive' : 'outline'}
                    size="icon"
                    onClick={isListening ? stopListening : startListening}
                    className="flex-shrink-0"
                  >
                    {isListening ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                )} */}
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => handleAICategorization(naturalInput)}
                disabled={!naturalInput.trim() || isAILoading}
                className="w-full relative bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white overflow-hidden group transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none text-sm
"
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                
                {isAILoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1 relative z-10" />
                    <span className="hidden sm:inline">Processing...</span>
                    <span className="sm:hidden">Processing</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-1 relative z-10" />
                    <span className="sm:inline">Extract with AI</span>
                  </>
                )}
              </Button>
              {isAISuggestion && (
                <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="h-3 w-3" />
                    Smart Extract Applied
                </div>
              )}
            </div>
          )}
          <div className="border-b border-primary/30"></div>
          {/* Manual Input Fields */}
          <div className="grid gap-3 sm:gap-4 mb-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-1">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm">Amount</Label>
                <Input
                  id="amount"
                  type="text"
                  placeholder="$0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm">Date</Label>
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant="outline"
                      className="w-full justify-start text-left font-normal text-sm"
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">
                        {date ? format(parseYYYYMMDDToLocalDate(date), 'PPP') : 'Pick a date'}
                      </span>
                      <span className="sm:hidden">
                        {date ? format(parseYYYYMMDDToLocalDate(date), 'MM/dd/yyyy') : 'Pick date'}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={parseYYYYMMDDToLocalDate(date)}
                      onSelect={(selectedDate) => {
                        if (selectedDate) {
                          setDate(formatLocalDateYYYYMMDD(selectedDate));
                          setDatePickerOpen(false);
                        }
                      }}
                      disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm">Description</Label>
              <Input
                id="description"
                placeholder="What was this expense for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder={transaction && !categoryId && transaction.categoryName ? `Previously: ${transaction.categoryName}` : "Select a category"} />
                </SelectTrigger>
                <SelectContent className="max-h-[400px]" position="popper" side="bottom" align="start" sideOffset={4}>
                  {/* Existing budget categories */}
                  {budget?.categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2 w-full">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="flex-1">{category.name}</span>
                        <div className="flex items-center gap-1">
                          {category.allocatedAmount === 0 && (
                            <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                              No Budget
                            </Badge>
                          )}
                          {category.isCustom && (
                            <Badge variant="secondary" className="text-xs">
                              Custom
                            </Badge>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                  
                  {/* Separator if there are categories not in budget */}
                  {(() => {
                    const existingCategoryNames = budget?.categories.map(cat => cat.name.toLowerCase()) || [];
                    const availableCategories = DEFAULT_CATEGORIES.filter(
                      defaultCat => !existingCategoryNames.includes(defaultCat.name.toLowerCase())
                    );
                    
                    if (availableCategories.length > 0) {
                      return (
                        <>
                          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground bg-muted/50">
                            Add to Budget
                          </div>
                          {availableCategories.map((category) => (
                            <SelectItem key={`new-${category.name}`} value={`new-${category.name}`}>
                              <div className="flex items-center gap-2 w-full">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: category.color }}
                                />
                                <span className="flex-1">{category.name}</span>
                                <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-300">
                                  Add to Budget
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </>
                      );
                    }
                    return null;
                  })()}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto order-2 sm:order-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full sm:w-auto order-1 sm:order-2">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {transaction ? 'Update' : 'Add'} Expense
          </Button>
        </div>
      </DialogContent>

      {/* Custom Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="w-[90vw] max-w-[450px] p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600 text-base sm:text-lg">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
              {pendingSubmission?.category?.id.startsWith('temp-') ? 'Add New Category' : 'No Budget Allocated'}
            </DialogTitle>
            <DialogDescription className="text-sm text-foreground pt-2">
              {pendingSubmission?.category?.id.startsWith('temp-') ? (
                <>
                  You're adding <span className="font-semibold">
                    ${pendingSubmission?.amount.toFixed(2)}
                  </span> to "<span className="font-semibold">
                    {pendingSubmission?.category?.name}
                  </span>" which is not in your budget yet. Would you like to add it?
                </>
              ) : (
                <>
                  You're adding <span className="font-semibold">
                    ${pendingSubmission?.amount.toFixed(2)}
                  </span> to "<span className="font-semibold">
                    {pendingSubmission?.category?.name}
                  </span>" which has no budget allocation.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 sm:space-y-4">
            {budget && (() => {
              const { unallocatedAmount } = calculateBudgetFlexibility(budget);
              return (
                <>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground">Available unallocated funds</div>
                    <div className="text-base sm:text-lg font-semibold text-emerald-600">
                      ${unallocatedAmount.toFixed(2)}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        id="setBudget"
                        checked={shouldSetBudget}
                        onChange={(e) => setShouldSetBudget(e.target.checked)}
                        className="rounded mt-1"
                      />
                      <Label htmlFor="setBudget" className="text-sm font-medium leading-relaxed">
                        {pendingSubmission?.category?.id.startsWith('temp-') 
                          ? 'Add category with budget allocation' 
                          : 'Set budget for this category'}
                      </Label>
                    </div>

                    {shouldSetBudget && (
                      <div className="space-y-2">
                        <Label htmlFor="budgetAmount" className="text-sm">
                          Budget amount
                        </Label>
                        <Input
                          id="budgetAmount"
                          type="text"
                          placeholder="$0.00"
                          value={budgetAmount}
                          onChange={(e) => setBudgetAmount(e.target.value)}
                          className="text-sm"
                        />
                        {budgetAmount && (() => {
                          const parsedAmount = parseCurrencyInput(budgetAmount);
                          if (parsedAmount > unallocatedAmount) {
                            return (
                              <p className="text-xs text-red-600">
                                Insufficient unallocated funds (${unallocatedAmount.toFixed(2)} available)
                              </p>
                            );
                          }
                          return (
                            <p className="text-xs text-muted-foreground">
                              Remaining unallocated: ${(unallocatedAmount - parsedAmount).toFixed(2)}
                            </p>
                          );
                        })()}
                      </div>
                    )}

                    {!shouldSetBudget && (
                      <p className="text-sm text-muted-foreground">
                        {pendingSubmission?.category?.id.startsWith('temp-') 
                          ? 'The category will be added with no budget allocation. This expense will be tracked as unallocated spending.'
                          : 'This expense will be tracked as unallocated spending.'}
                      </p>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
          
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
            <Button variant="outline" onClick={handleCancelSubmission} className="w-full sm:w-auto order-2 sm:order-1">
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmSubmission} 
              className="bg-primary w-full sm:w-auto order-1 sm:order-2"
              disabled={shouldSetBudget && budget ? (() => {
                const { unallocatedAmount } = calculateBudgetFlexibility(budget);
                const parsedAmount = parseCurrencyInput(budgetAmount);
                return parsedAmount > unallocatedAmount || parsedAmount <= 0;
              })() : false}
            >
              <span className="hidden sm:inline">
                {pendingSubmission?.category?.id.startsWith('temp-') 
                  ? (shouldSetBudget ? 'Add Category & Expense' : 'Add Category & Expense')
                  : (shouldSetBudget ? 'Set Budget & Add Expense' : 'Add Expense')}
              </span>
              <span className="sm:hidden">
                {pendingSubmission?.category?.id.startsWith('temp-') 
                  ? 'Add Category'
                  : (shouldSetBudget ? 'Set Budget' : 'Add Expense')}
              </span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}