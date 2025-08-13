'use client';

import { Button } from '@/components/ui/button';
import { LayoutDashboard, Save } from 'lucide-react';

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
        <Save className="h-4 w-4" />
        {isSubmitting ? 'Saving...' : hasExistingBudget ? 'Save Budget' : 'Create Budget & Continue'}
      </Button>
    </div>
  );
}


