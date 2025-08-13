'use client';

import { Button } from '@/components/ui/button';
import { LayoutDashboard } from 'lucide-react';

interface SaveActionsProps {
  onSubmit: () => void;
  disabled: boolean;
  isSubmitting: boolean;
  hasExistingBudget: boolean;
}

export function SaveActions({ onSubmit, disabled, isSubmitting, hasExistingBudget }: SaveActionsProps) {
  return (
    <div className="flex justify-end">
      <Button onClick={onSubmit} disabled={disabled}>
        <LayoutDashboard className="h-4 w-4" />
        {isSubmitting ? 'Saving...' : hasExistingBudget ? 'Back to Dashboard' : 'Create Budget & Continue'}
      </Button>
    </div>
  );
}


