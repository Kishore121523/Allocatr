// components/dashboard/category-cards.tsx

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CategorySpending } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { PiggyBank, Info } from 'lucide-react';

interface CategoryCardsProps {
  categorySpending: CategorySpending[];
  showUnallocatedInfo?: boolean;
  unallocatedAmount?: number;
}

export function CategoryCards({ 
  categorySpending, 
  showUnallocatedInfo = false, 
  unallocatedAmount = 0 
}: CategoryCardsProps) {
  if (categorySpending.length === 0) {
    return (
      <Card className="p-4 sm:p-8 text-center">
        <p className="text-sm sm:text-base text-muted-foreground">No budget categories set up yet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Unallocated Funds Info Card */}
      {showUnallocatedInfo && unallocatedAmount > 0 && (
        <Alert className="border-border bg-accent p-3 sm:p-4">
          <PiggyBank className="h-4 w-4 text-primary!" />
          <AlertDescription className='ml-[-4px]'>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-accent-foreground gap-2 sm:gap-0">
              <div className="text-sm sm:text-base">
                <strong className="font-normal text-accent-foreground">Flexible Funds Available:</strong>{' '}
                <span className="block sm:inline mt-1 sm:mt-0">
                  You have{' '}
                  <span className="text-primary font-semibold">
                    {formatCurrency(unallocatedAmount)}
                  </span>{' '}
                  unallocated that can be used for any category or saved for future needs.
                </span>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Category Cards Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {categorySpending.map((category) => {
          const isOverBudget = category.percentageUsed > 100;
          
          return (
            <Card key={category.categoryId} className="relative border-[0.75px] overflow-hidden">
              <CardHeader className="py-2 px-4 sm:px-6">
                <div className="flex flex-row items-center justify-between gap-2 sm:gap-0">
                  <CardTitle className="text-base sm:text-lg font-medium flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="truncate">{category.categoryName}</span>
                  </CardTitle>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs sm:text-sm flex-shrink-0 ${isOverBudget ? 'bg-destructive/10 text-destructive' : ''}`}
                  >
                    {category.percentageUsed}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 px-4 sm:px-6 pb-1 sm:pb-2">
                <Progress 
                  value={Math.min(category.percentageUsed, 100)} 
                  className="h-2"
                  style={{
                    '--progress-color': isOverBudget ? '#ef4444' : category.color,
                  } as React.CSSProperties}
                />
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">Spent</span>
                    <span className={`font-medium ${isOverBudget ? 'text-destructive' : ''}`}>
                      {formatCurrency(category.spent)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">Allocated</span>
                    <span className="font-medium">
                      {formatCurrency(category.allocated)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">Remaining</span>
                    <span className={`font-medium ${category.remaining < 0 ? 'text-destructive' : 'text-success'}`}>
                      {formatCurrency(Math.abs(category.remaining))}
                      {category.remaining < 0 && ' over'}
                    </span>
                  </div>
                </div>

                {/* Flexible Budget Tip for Over-Budget Categories */}
                {isOverBudget && showUnallocatedInfo && unallocatedAmount > 0 && (
                  <div className="mt-2 sm:mt-3 p-2 bg-accent rounded-md border border-border">
                    <div className="flex items-start gap-[5px]">
                      <Info className="h-3 w-3 sm:h-4 sm:w-4 text-primary mt-0.5 sm:mt-0.4 flex-shrink-0" />
                      <div className="text-xs sm:text-xs text-muted-foreground leading-relaxed">
                        Tip: You can use your {formatCurrency(unallocatedAmount)} flexible funds 
                        to cover this overage if needed.
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>      
    </div>
  );
}