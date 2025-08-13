// components/expense/expense-modal.tsx

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
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useAICategorization } from '@/hooks/use-ai-categorization';
import { parseCurrencyInput, todayLocalYYYYMMDD, formatLocalDateYYYYMMDD, parseYYYYMMDDToLocalDate } from '@/lib/utils';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: any; // For editing existing transactions
}

export function ExpenseModal({ isOpen, onClose, transaction }: ExpenseModalProps) {
  const { budget } = useBudget();
  const { addTransaction, updateTransaction } = useTransactions();
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

  useEffect(() => {
    if (transcript) {
      setNaturalInput(transcript);
      handleAICategorization(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount.toString());
      setDescription(transaction.description);
      setCategoryId(transaction.categoryId);
      setDate(formatLocalDateYYYYMMDD(transaction.date));
    }
  }, [transaction]);

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

        // If AI parsed a date, set the date field
        if (result.date) {
          setDate(result.date);
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

    const category = budget.categories.find((c) => c.id === categoryId);
    
    // Check if adding expense to a category with zero or no budget allocation
    if (category && category.allocatedAmount === 0) {
      setPendingSubmission({ category, amount: parsedAmount });
      setShowConfirmDialog(true);
      return;
    }

    // Proceed with normal submission
    await performSubmission();
  };

  const performSubmission = async (skipWarning = false) => {
    const parsedAmount = parseCurrencyInput(amount);
    const category = budget?.categories.find((c) => c.id === categoryId);

    setIsSubmitting(true);

    try {
      const transactionData = {
        amount: parsedAmount,
        description: description.trim(),
        categoryId,
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

  const handleConfirmSubmission = async () => {
    setShowConfirmDialog(false);
    setPendingSubmission(null);
    await performSubmission(false);
  };

  const handleCancelSubmission = () => {
    setShowConfirmDialog(false);
    setPendingSubmission(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] [&>button]:hidden">
        <DialogHeader>
          <DialogTitle>
            {transaction ? 'Edit Expense' : 'Add Expense'}
          </DialogTitle>
          <DialogDescription>
            Enter expense details or use natural language input with AI assistance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Natural Language Input */}
          {!transaction && (
            <div className="space-y-3">
             
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <Textarea
                    placeholder="Type or Speak: 'I bought coffee at Starbucks for $2.50'"
                    value={naturalInput}
                    onChange={(e) => setNaturalInput(e.target.value)}
                    className="resize-none"
                    rows={2}
                  />
                </div>
                {isSpeechSupported && (
                  <Button
                    type="button"
                    variant={isListening ? 'destructive' : 'outline'}
                    size="icon"
                    onClick={isListening ? stopListening : startListening}
                  >
                    {isListening ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAICategorization(naturalInput)}
                disabled={!naturalInput.trim() || isAILoading}
                className="w-full"
              >
                {isAILoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-1" />
                    Extract with AI
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
          <div className="grid gap-4 mb-2">
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="text"
                  placeholder="$0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="h-4 w-4" />
                      {date ? format(parseYYYYMMDDToLocalDate(date), 'PPP') : 'Pick a date'}
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
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="What was this expense for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
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
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {transaction ? 'Update' : 'Add'} Expense
          </Button>
        </div>
      </DialogContent>

      {/* Custom Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              No Budget Allocated
            </DialogTitle>
            <DialogDescription className="text-sm text-foreground pt-2">
              You're adding <span className="font-semibold">
                ${pendingSubmission?.amount.toFixed(2)}
              </span> to "<span className="font-semibold">
                {pendingSubmission?.category?.name}
              </span>" which has no budget allocation.
            </DialogDescription>
            <p className="text-sm text-muted-foreground mt-3">
              This expense will not be tracked in your budget. Consider setting a budget 
              for this category for better expense tracking.
            </p>
          </DialogHeader>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={handleCancelSubmission}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSubmission} className="bg-primary">
              Add Expense
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}