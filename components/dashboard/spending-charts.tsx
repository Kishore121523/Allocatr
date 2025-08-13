// components/dashboard/spending-charts.tsx

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CategorySpending } from '@/types';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { PiggyBank } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

interface SpendingChartsProps {
  categorySpending: CategorySpending[];
  totalBudget: number;
  totalSpent: number;
  hasUnallocatedFunds?: boolean;
  unallocatedAmount?: number;
}

export function SpendingCharts({ 
  categorySpending, 
  totalBudget, 
  totalSpent,
  hasUnallocatedFunds = false,
  unallocatedAmount = 0
}: SpendingChartsProps) {
  
  // Calculate allocated vs unallocated for proper visualization
  const totalAllocated = categorySpending
    .filter(cat => !cat.isUnallocated)
    .reduce((sum, cat) => sum + cat.allocated, 0);
  
  const spentFromAllocated = categorySpending
    .filter(cat => !cat.isUnallocated)
    .reduce((sum, cat) => sum + cat.spent, 0);
  
  const remainingAllocated = Math.max(0, totalAllocated - spentFromAllocated);

  // Enhanced doughnut chart data with unallocated funds
  const doughnutData = {
    labels: hasUnallocatedFunds 
      ? ['Spent', 'Remaining', 'Unallocated']
      : ['Spent', 'Remaining'],
    datasets: [
      {
        data: hasUnallocatedFunds
          ? [spentFromAllocated, remainingAllocated, unallocatedAmount]
          : [totalSpent, Math.max(0, totalBudget - totalSpent)],
        backgroundColor: hasUnallocatedFunds
          ? [
              'rgba(239, 68, 68, 0.8)', // red for spent
              'rgba(34, 197, 94, 0.8)', // green for remaining allocated
              'rgba(107, 114, 128, 0.8)' // gray for unallocated
            ]
          : [
              'rgba(239, 68, 68, 0.8)', // red for spent
              'rgba(34, 197, 94, 0.8)', // green for remaining
            ],
        borderColor: hasUnallocatedFunds
          ? [
              'rgba(239, 68, 68, 1)',
              'rgba(34, 197, 94, 1)',
              'rgba(107, 114, 128, 1)'
            ]
          : [
              'rgba(239, 68, 68, 1)',
              'rgba(34, 197, 94, 1)',
            ],
        borderWidth: 1,
      },
    ],
  };

  // Filter out unallocated "category" for bar chart and category pie
  const allocatedCategories = categorySpending.filter(cat => !cat.isUnallocated);
  
  // Prepare data for the bar chart (top spending categories)
  const topCategories = [...allocatedCategories]
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 6); // Show top 6 categories

  const barData = {
    labels: topCategories.map(cat => cat.categoryName),
    datasets: [
      {
        label: 'Spent',
        data: topCategories.map(cat => cat.spent),
        backgroundColor: topCategories.map(cat => cat.color + '99'), // Add transparency
        borderColor: topCategories.map(cat => cat.color),
        borderWidth: 1,
      },
      {
        label: 'Allocated',
        data: topCategories.map(cat => cat.allocated),
        backgroundColor: 'rgba(156, 163, 175, 0.3)', // Gray with transparency
        borderColor: 'rgba(156, 163, 175, 1)',
        borderWidth: 1,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(context.raw);
            const percentage = ((context.raw / totalBudget) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(context.raw);
            return `${context.dataset.label}: ${value}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
            }).format(value);
          },
        },
      },
    },
  };

  // Category distribution pie chart data (only categories with spending)
  const spendingCategories = allocatedCategories.filter(cat => cat.spent > 0);
  const categoryPieData = {
    labels: spendingCategories.map(cat => cat.categoryName),
    datasets: [
      {
        data: spendingCategories.map(cat => cat.spent),
        backgroundColor: spendingCategories.map(cat => cat.color + 'CC'),
        borderColor: spendingCategories.map(cat => cat.color),
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Budget Overview Doughnut Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Budget Overview
            {hasUnallocatedFunds && (
              <Badge variant="outline" className="bg-accent text-foreground border-border">
                <PiggyBank className="h-3 w-3" />
                Flexible
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Income:</span>
              <span className="font-semibold">
                ${totalBudget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            {hasUnallocatedFunds && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Allocated:</span>
                  <span className="font-semibold">
                    ${totalAllocated.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unallocated:</span>
                  <span className="font-semibold text-muted-foreground">
                    ${unallocatedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Percentage Used:</span>
              <span className="font-semibold">
                {totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Spending Categories Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Spending Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {topCategories.length > 0 ? (
            <div className="h-[250px]">
              <Bar data={barData} options={barOptions} />
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p>No spending data yet</p>
                <p className="text-sm">Add some expenses to see your top categories</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Distribution Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Spending Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {spendingCategories.length > 0 ? (
            <div className="h-[250px]">
              <Doughnut data={categoryPieData} options={doughnutOptions} />
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p>No spending to show</p>
                <p className="text-sm">Start tracking expenses to see distribution</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Flexible Budget Insights Card */}
      {hasUnallocatedFunds && (
        <Card className="border-border md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <PiggyBank className="h-5 w-5" />
              Flexible Budget Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {Math.round((unallocatedAmount / totalBudget) * 100)}%
                </div>
                <div className="text-sm text-primary">Flexibility Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  ${(totalAllocated - spentFromAllocated).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </div>
                <div className="text-sm text-muted-foreground">Available (Allocated)</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  ${unallocatedAmount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </div>
                <div className="text-sm text-muted-foreground">Available (Flexible)</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  ${(totalBudget - totalSpent).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </div>
                <div className="text-sm text-muted-foreground">Total Available</div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Your flexible approach provides a {Math.round((unallocatedAmount / totalBudget) * 100)}% buffer 
                for unexpected expenses while maintaining structured spending for {allocatedCategories.length} categories.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}