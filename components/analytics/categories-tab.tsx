'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { CategorySpending } from '@/types';

type CategoriesTabProps = {
  allocatedCategories: CategorySpending[];
};

export function CategoriesTab({ allocatedCategories }: CategoriesTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Top Spending Categories</CardTitle>
            <CardDescription>Your highest spending categories this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...allocatedCategories]
                .sort((a, b) => b.spent - a.spent)
                .slice(0, 5)
                .map((cat, i) => (
                  <div key={cat.categoryId} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium w-6">#{i + 1}</span>
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-sm">{cat.categoryName}</span>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${cat.spent > cat.allocated ? 'text-destructive' : ''}`}>
                        {formatCurrency(cat.spent)}
                      </p>
                      <p className={`text-xs ${cat.percentageUsed > 100 ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                        {cat.percentageUsed}% of budget
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Most Efficient Categories</CardTitle>
            <CardDescription>Categories staying within budget with funds remaining</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...allocatedCategories]
                .filter(c => c.percentageUsed <= 100 && c.spent > 0)
                .sort((a, b) => b.remaining - a.remaining)
                .slice(0, 5)
                .map(cat => (
                  <div key={cat.categoryId} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-sm">{cat.categoryName}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-success">{formatCurrency(cat.remaining)}</p>
                      <p className="text-xs text-success">remaining</p>
                    </div>
                  </div>
                ))}
              {allocatedCategories.filter(c => c.percentageUsed <= 100 && c.spent > 0).length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">No categories with remaining budget yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>All Categories Overview</CardTitle>
          <CardDescription>Complete budget utilization across all your active categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-hide">
            {[...allocatedCategories]
              .sort((a, b) => b.percentageUsed - a.percentageUsed)
              .map(cat => (
                <div key={cat.categoryId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-sm font-medium">{cat.categoryName}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold">{formatCurrency(cat.spent)}</span>
                      <span className="text-xs text-muted-foreground ml-1">/ {formatCurrency(cat.allocated)}</span>
                    </div>
                  </div>
                  <div className="relative">
                    <Progress value={Math.min(cat.percentageUsed, 100)} className="h-2" />
                    {cat.percentageUsed > 100 && (
                      <div
                        className="absolute right-0 top-0 h-2 bg-destructive rounded-r"
                        style={{ width: `${Math.min((cat.percentageUsed - 100) * 0.5, 20)}%` }}
                      ></div>
                    )}
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className={cat.percentageUsed > 100 ? 'text-destructive' : 'text-muted-foreground'}>
                      {cat.percentageUsed}% used
                    </span>
                    <span className={cat.remaining < 0 ? 'text-destructive' : 'text-success'}>
                      {cat.remaining < 0 ? 'Over by ' : ''}
                      {formatCurrency(Math.abs(cat.remaining))}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


