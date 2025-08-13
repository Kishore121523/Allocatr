// components/dashboard/recent-transactions.tsx

'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowRight, Receipt, Sparkles } from 'lucide-react';

interface RecentTransactionsProps {
  transactions: Transaction[];
  categoryColors: Map<string, string>;
}

export function RecentTransactions({ transactions, categoryColors }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No transactions yet this month.</p>
            <p className="text-sm text-muted-foreground">
              Add your first expense to start tracking your budget.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Transactions</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/transactions" className="flex items-center gap-1">
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">
                    {transaction.description}
                  </p>
                  {transaction.isAICategorized && (
                    <Sparkles className="h-3 w-3 text-primary" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {!!transaction.categoryName && (
                    <Badge 
                      variant="outline" 
                      className="text-xs font-medium"
                      style={{ 
                        borderColor: categoryColors.get(transaction.categoryName) || '#6B7280',
                        backgroundColor: `${categoryColors.get(transaction.categoryName) || '#6B7280'}15`,
                        color: categoryColors.get(transaction.categoryName) || '#6B7280',
                      }}
                    >
                      {transaction.categoryName}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatDate(transaction.date)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}