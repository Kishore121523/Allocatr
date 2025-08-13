'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Calendar, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { CategorySpending } from '@/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type VelocitySummary = {
  velocity: number;
  projectedMonthEnd: number;
  actualSpending: number;
};

type KeyMetricsCardsProps = {
  velocity: VelocitySummary;
  allocatedCategories: CategorySpending[];
};

export function KeyMetricsCards({ velocity, allocatedCategories }: KeyMetricsCardsProps) {
  const overBudgetCategories = allocatedCategories.filter(c => c.percentageUsed > 100);
  const overBudgetCount = overBudgetCategories.length;

  return (
    <div className="grid gap-4 md:grid-cols-4 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-1">
            Spending Velocity
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" aria-label="What is spending velocity?" className="cursor-help text-muted-foreground">
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-lg text-xs">
                  Stay near 100% to be on track. Above = Overspending and Below = Saving
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          {velocity.velocity > 1.1 ? (
            <TrendingUp className="h-4 w-4 text-destructive" />
          ) : (
            <TrendingDown className="h-4 w-4 text-success" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{(velocity.velocity * 100).toFixed(0)}%</div>
          <p className="text-xs text-muted-foreground">
            {velocity.velocity > 1 ? 'Above' : 'Below'} expected pace
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Projected Month End</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(velocity.projectedMonthEnd)}</div>
          <p className="text-xs text-muted-foreground">Based on current rate</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(velocity.actualSpending / new Date().getDate())}
          </div>
          <p className="text-xs text-muted-foreground">Per day this month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Categories Over Budget</CardTitle>
          {overBudgetCount > 0 ? (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" aria-label="View overspent categories" className="cursor-help">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-sm">
                  <div className="text-xs">
                    <div className="font-medium mb-1">Overspent Categories:</div>
                    {overBudgetCategories.map((category, index) => (
                      <div key={category.categoryName} className="flex justify-between items-center">
                        <span>{category.categoryName}</span>
                        <span className="ml-2 text-warning">
                          {(category.percentageUsed).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <CheckCircle className="h-4 w-4 text-success" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overBudgetCount}</div>
          <p className="text-xs text-muted-foreground">Out of {allocatedCategories.length} active categories</p>
        </CardContent>
      </Card>
    </div>
  );
}


