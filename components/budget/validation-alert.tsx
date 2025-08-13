'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface ValidationAlertProps {
  show: boolean;
  income: number;
  isOverBudget: boolean;
  remaining: number;
}

export function ValidationAlert({ show, income, isOverBudget, remaining }: ValidationAlertProps) {
  if (!show) return null;
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        {income <= 0
          ? 'Please enter a valid monthly income'
          : isOverBudget
          ? `You're over budget by ${formatCurrency(Math.abs(remaining))}. Please reduce your allocations.`
          : 'Please fix the errors above'}
      </AlertDescription>
    </Alert>
  );
}


