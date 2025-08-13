// components/dashboard/overview-stats.tsx

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingDown, 
  PiggyBank, 
  AlertTriangle,
  Calendar,
  Target
} from 'lucide-react';
import { DashboardStats } from '@/types';
import { formatCurrency, getProgressColor } from '@/lib/utils';
import { getDailyBudgetRemaining, getRemainingDaysInMonth } from '@/lib/budget-calculations';

interface OverviewStatsProps {
  stats: DashboardStats;
}

export function OverviewStats({ stats }: OverviewStatsProps) {
  const dailyBudget = getDailyBudgetRemaining(stats.remainingBudget);
  const daysRemaining = getRemainingDaysInMonth();
  const progressColor = getProgressColor(stats.percentageUsed);

  return (
    <div className="space-y-4">
      {/* Main Budget Progress */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">Monthly Budget</CardTitle>
            <Badge variant={stats.percentageUsed > 100 ? 'destructive' : 'default'}>
              {stats.percentageUsed}% Used
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Spent</span>
              <span className="font-medium">{formatCurrency(stats.totalSpent)}</span>
            </div>
            <Progress value={Math.min(stats.percentageUsed, 100)} className="h-3" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Budget</span>
              <span className="font-medium">{formatCurrency(stats.totalBudget)}</span>
            </div>
          </div>
          
          {stats.categoriesOverBudget > 0 && (
            <div className="flex items-center gap-2 text-sm text-warning bg-accent p-2 rounded-md">
              <AlertTriangle className="h-4 w-4 text-accent-foreground" />
              <span className='text-accent-foreground'>{stats.categoriesOverBudget} categories over budget</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(Math.max(0, stats.remainingBudget))}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.remainingBudget < 0 ? 'Over budget' : 'Available to spend'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Budget</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(Math.max(0, dailyBudget))}
            </div>
            <p className="text-xs text-muted-foreground">
              For the next {daysRemaining} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalSpent)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.transactionCount} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Days Left</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{daysRemaining}</div>
            <p className="text-xs text-muted-foreground">
              Days in current month
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}