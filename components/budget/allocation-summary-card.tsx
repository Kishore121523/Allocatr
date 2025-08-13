'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatCurrency } from '@/lib/utils';
import { AlertCircle, CheckCircle, Info, PiggyBank } from 'lucide-react';

interface AllocationSummaryCardProps {
  allocationPercentage: number;
  totalAllocated: number;
  income: number;
  remaining: number;
  hasUnallocated: boolean;
  isOverBudget: boolean;
  onAddToSavings: () => void;
}

export function AllocationSummaryCard({
  allocationPercentage,
  totalAllocated,
  income,
  remaining,
  hasUnallocated,
  isOverBudget,
  onAddToSavings,
}: AllocationSummaryCardProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Budget Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Progress value={Math.min(allocationPercentage, 100)} className="h-3" />
          <div className="flex justify-between text-sm">
            <span>Allocated: {formatCurrency(totalAllocated)}</span>
            <span>Income: {formatCurrency(income)}</span>
          </div>

          {hasUnallocated && (
            <div className="bg-accent border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-primary cursor-default" aria-label="Flexible budgeting info" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="w-64">
                        <p className="font-medium text-foreground mb-1">Flexible Budgeting</p>
                        <p className="text-muted-foreground">You can save your budget with unallocated funds. This gives you flexibility while still planning for most of your expenses.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <div>
                    <p className="text-sm font-medium text-foreground">Unallocated Funds: {formatCurrency(remaining)}</p>
                    <p className="text-xs text-muted-foreground">Consider allocating to savings or keep flexible</p>
                  </div>
                </div>
                <Button onClick={onAddToSavings} size="sm" variant="outline">
                  <PiggyBank className="h-4 w-4 mr-1" />
                  Add to Savings
                </Button>
              </div>
            </div>
          )}

          {isOverBudget && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You're over budget by {formatCurrency(Math.abs(remaining))}. Please reduce your allocations.
              </AlertDescription>
            </Alert>
          )}

          {remaining === 0 && income > 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4 text-success" />
              <AlertDescription className="text-success">
                Perfect! Every dollar has been allocated.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


