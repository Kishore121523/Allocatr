// app/dashboard/page.tsx

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { conditionalPageGsap, shouldAnimatePageTransitions, ANIMATION_CONFIG } from '@/lib/animation-config';
import { ProtectedRoute } from '@/components/layout/protected-route';
import { AppHeader } from '@/components/layout/app-header';
import { CategoryCards } from '@/components/dashboard/category-cards';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';


import { useBudget } from '@/hooks/use-budget';
import { useTransactions } from '@/hooks/use-transactions';
import { useMonth } from '@/providers/month-provider';
import { EmptyBudget } from '@/components/dashboard/empty-budget';
import { calculateDashboardStats, calculateCategorySpending } from '@/lib/budget-calculations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { formatCurrency } from '@/lib/utils';
import { 
  ChevronDown, 
  ChevronUp, 
  BarChart3, 
  CreditCard, 
  Target,
  Wallet,
  Settings,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowRight,
  DollarSign,
  PiggyBank,
  Calendar
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardPage() {
  const router = useRouter();
  const { currentMonth, isCurrentMonth } = useMonth();
  const { budget, loading: budgetLoading } = useBudget(currentMonth);
  const { transactions, loading: transactionsLoading } = useTransactions(currentMonth);
  const [stats, setStats] = useState(calculateDashboardStats(null, []));
  const [categorySpending, setCategorySpending] = useState<any[]>([]);
  const [categoryColors, setCategoryColors] = useState<Map<string, string>>(new Map());
  
  // Collapsible states
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isTransactionsOpen, setIsTransactionsOpen] = useState(false);

  // Refs for GSAP animations
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const quickActionsRef = useRef<HTMLDivElement>(null);

  const isLoading = budgetLoading || transactionsLoading;

  useEffect(() => {
    if (budget && transactions) {
      setStats(calculateDashboardStats(budget, transactions));
      setCategorySpending(calculateCategorySpending(budget, transactions));
      
      // Create category colors map
      const colorsMap = new Map<string, string>();
      budget.categories.forEach(category => {
        colorsMap.set(category.name, category.color);
      });
      setCategoryColors(colorsMap);
    }
  }, [budget, transactions]);

  // Set initial state immediately to prevent flash
  useEffect(() => {
    const elements = cardRefs.current.filter(Boolean);
    
    if (elements.length > 0 && shouldAnimatePageTransitions()) {
      const config = ANIMATION_CONFIG.pageTransitions;
      
      // Set initial hidden state immediately
      conditionalPageGsap.set(elements, {
        x: config.transform.x,
        opacity: config.transform.opacity
      });
    }
  }, []); // Run once on mount

  // GSAP animation for page elements (controlled by page transition config - wait for data to load)
  useEffect(() => {
    const elements = cardRefs.current.filter(Boolean);
    
    // Wait for loading to finish AND budget state to be determined (even if null)
    const isDataReady = !isLoading && (budget !== undefined);
    
    if (elements.length > 0 && isDataReady && shouldAnimatePageTransitions()) {
      const config = ANIMATION_CONFIG.pageTransitions;

      // Animate elements with subtle stagger
      conditionalPageGsap.to(elements, {
        x: 0,
        opacity: 1,
        duration: config.duration,
        ease: config.ease,
        stagger: config.stagger,
        delay: config.delay
      });
    }
  }, [isLoading, budget]);
  const filteredCategorySpending = categorySpending.filter(
    (category) => category.allocated > 0
  );

  // Calculate unallocated funds
  const totalAllocated = budget ? budget.categories.reduce((sum, cat) => sum + cat.allocatedAmount, 0) : 0;
  const unallocatedFunds = budget ? budget.monthlyIncome - totalAllocated : 0;
  const hasUnallocatedFunds = unallocatedFunds > 0;
  const remainingBudget = budget ? budget.monthlyIncome - stats.totalSpent : 0;
  const savingsRate = budget && budget.monthlyIncome > 0 
    ? ((remainingBudget / budget.monthlyIncome) * 100).toFixed(1)
    : '0';
  const spendingRate = budget && budget.monthlyIncome > 0
    ? ((stats.totalSpent / budget.monthlyIncome) * 100).toFixed(1)
    : '0';

  // Enhanced category spending data including unallocated funds
  const enhancedCategorySpending = budget && hasUnallocatedFunds ? [
    ...filteredCategorySpending,
    {
      categoryId: 'unallocated',
      categoryName: 'Unallocated',
      allocated: unallocatedFunds,
      spent: 0,
      remaining: unallocatedFunds,
      percentageUsed: 0,
      color: '#6b7280',
      isUnallocated: true,
    }
  ] : filteredCategorySpending;

  // Simplified bar chart data without labels
  const barChartData = {
    labels: ['Income', 'Spent', 'Remaining'],
    datasets: [
      {
        data: budget ? [budget.monthlyIncome, stats.totalSpent, Math.max(0, remainingBudget)] : [0, 0, 0],
        backgroundColor: [
          'rgba(74, 222, 128, 0.8)',  // Bright green for income
          'rgba(248, 113, 113, 0.8)',  // Bright red for spent  
          'rgba(168, 85, 247, 0.8)',  // Bright purple for remaining
        ],
        borderColor: [
          'rgba(74, 222, 128, 1)',
          'rgba(248, 113, 113, 1)', 
          'rgba(168, 85, 247, 1)',
        ],
        borderWidth: 2,
        borderRadius: 12,
        maxBarThickness: 80,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 20,
        bottom: 10,
        left: 20,
        right: 20,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        padding: 12,
        position: 'average' as const,
        xAlign: 'left' as const,
        yAlign: 'center' as const,
        caretPadding: 10,
        titleFont: {
          size: 14,
          weight: 600,
        },
        bodyFont: {
          size: 16,
          weight: 700,
        },
        callbacks: {
          title: function(context: any) {
            return context[0].label;
          },
          label: function(context: any) {
            return formatCurrency(context.raw);
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        display: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
          drawBorder: false,
        },
        ticks: {
          display: false,
        },
        border: {
          display: false,
        },
      },
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgb(107, 114, 128)',
          font: {
            size: 13,
            weight: 500,
          },
          padding: 8,
        },
        border: {
          display: false,
        },
      },
    },
  };

  // Spending distribution chart for breakdown section
  const distributionData = {
    labels: enhancedCategorySpending.map(cat => cat.categoryName),
    datasets: [
      {
        data: enhancedCategorySpending.map(cat => cat.allocated),
        backgroundColor: enhancedCategorySpending.map(cat => cat.color),
        borderWidth: 0,
        cutout: '60%',
      },
    ],
  };

  const distributionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = formatCurrency(context.raw);
            const percentage = budget ? ((context.raw / budget.monthlyIncome) * 100).toFixed(1) : '0';
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <AppHeader />
        
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          {isLoading ? (
            <div className="space-y-8">
            
            </div>
          ) : !budget ? (
            <EmptyBudget />
          ) : (
            <div className="space-y-6">
              {/* Hero Visual Section with Bar Chart */}
              <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-card/95 animate-fade-in-up">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                        Budget Overview
                      </CardTitle>
                      <CardDescription>
                        {isCurrentMonth 
                          ? (new Date().getDate() <= 3 
                              ? 'Welcome to a new month! Your budget is ready for fresh tracking.' 
                              : 'Your current month\'s financial snapshot')
                          : `Historical data for ${new Date(currentMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
                        }
                      </CardDescription>
                    </div>
                    {!isCurrentMonth ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                        <Calendar className="h-4 w-4" />
                        Historical View
                      </div>
                    ) : (new Date().getDate() <= 3 && (
                      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950/20 px-3 py-1 rounded-full">
                        <Calendar className="h-4 w-4" />
                        New Month
                      </div>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Bar Chart */}
                    <div className="h-80 bg-gradient-to-b from-background/50 to-background/30 backdrop-blur-sm rounded-xl p-6 border border-border/50">
                      <Bar data={barChartData} options={barChartOptions} />
                    </div>

                    {/* Key Metrics Display */}
                    <div className="grid grid-cols-3 gap-4">
                      {/* Income Card */}
                      <div className="bg-gradient-to-br from-green-50/50 to-green-100/30 dark:from-green-950/20 dark:to-green-900/10 rounded-xl p-4 border border-green-200/50 dark:border-green-800/30">
                        <div className="flex items-center justify-between mb-2">
                          <div className="p-2 bg-green-500/20 rounded-lg">
                            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-xs font-medium text-green-600 dark:text-green-400">Monthly Income</span>
                        </div>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(budget.monthlyIncome)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Total budget
                        </p>
                      </div>

                      {/* Spent Card */}
                      <div className="bg-gradient-to-br from-red-50/50 to-red-100/30 dark:from-red-950/20 dark:to-red-900/10 rounded-xl p-4 border border-red-200/50 dark:border-red-800/30">
                        <div className="flex items-center justify-between mb-2">
                          <div className="p-2 bg-red-500/20 rounded-lg">
                            <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                          </div>
                          <span className="text-xs font-medium text-red-600 dark:text-red-400">Total Spent</span>
                        </div>
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                          {formatCurrency(stats.totalSpent)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {spendingRate}% of income
                        </p>
                      </div>

                      {/* Remaining Card */}
                      <div className="bg-gradient-to-br from-purple-50/50 to-purple-100/30 dark:from-purple-950/20 dark:to-purple-900/10 rounded-xl p-4 border border-purple-200/50 dark:border-purple-800/30">
                        <div className="flex items-center justify-between mb-2">
                          <div className="p-2 bg-purple-500/20 rounded-lg">
                            <PiggyBank className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Remaining</span>
                        </div>
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {formatCurrency(Math.max(0, remainingBudget))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {savingsRate}% savings rate
                        </p>
                      </div>
                    </div>

                    {/* Additional Quick Stats */}
                    <div className="flex items-center justify-between px-4 py-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="text-sm text-muted-foreground">Allocated:</span>
                          <span className="text-sm font-medium">{formatCurrency(totalAllocated)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                          <span className="text-sm text-muted-foreground">Unallocated:</span>
                          <span className="text-sm font-medium">{formatCurrency(unallocatedFunds)}</span>
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Transactions:</span>
                        <span className="font-medium ml-2">{transactions.length}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions Grid - Improved Layout */}
              <div ref={quickActionsRef} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Recent Transactions Card */}
                <Card 
                  ref={(el) => { cardRefs.current[0] = el; }}
                  className="group relative overflow-hidden border-0 shadow-md card-hover bg-gradient-to-br from-purple-500/10 to-purple-600/5 hover:from-purple-500/15 hover:to-purple-600/10"
                  style={{ opacity: shouldAnimatePageTransitions() ? 0 : 1 }}
                >
                  <CardContent className="p-6">
                    <button 
                      onClick={() => router.push('/transactions')}
                      className="w-full h-full flex flex-col items-center justify-center space-y-3 group"
                    >
                      <div className="p-4 bg-purple-500/20 rounded-full group-hover:bg-purple-500/30 transition-colors">
                        <CreditCard className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="text-center">
                        <h3 className="font-semibold text-foreground">Recent Transactions</h3>
                        <p className="text-sm text-muted-foreground mt-1">View all spending</p>
                      </div>
                      <ArrowRight className="absolute bottom-6 right-6 h-4 w-4 text-purple-600/50 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </CardContent>
                </Card>

                {/* Adjust Budget Card */}
                <Card 
                  ref={(el) => { cardRefs.current[1] = el; }}
                  className="group relative overflow-hidden border-0 shadow-md card-hover bg-gradient-to-br from-green-500/10 to-green-600/5 hover:from-green-500/15 hover:to-green-600/10"
                  style={{ opacity: shouldAnimatePageTransitions() ? 0 : 1 }}
                >
                  <CardContent className="p-6">
                    <button 
                      onClick={() => router.push('/budget')}
                      className="w-full h-full flex flex-col items-center justify-center space-y-3 group"
                    >
                      <div className="p-4 bg-green-500/20 rounded-full group-hover:bg-green-500/30 transition-colors">
                        <Settings className="h-8 w-8 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="text-center">
                        <h3 className="font-semibold text-foreground">Adjust Budget</h3>
                        <p className="text-sm text-muted-foreground mt-1">Modify categories</p>
                      </div>
                      <ArrowRight className="absolute bottom-6 right-6 h-4 w-4 text-green-600/50 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </CardContent>
                </Card>
                
                {/* View Analytics Card */}
                <Card 
                  ref={(el) => { cardRefs.current[2] = el; }}
                  className="group relative overflow-hidden border-0 shadow-md card-hover bg-gradient-to-br from-blue-500/10 to-blue-600/5 hover:from-blue-500/15 hover:to-blue-600/10"
                  style={{ opacity: shouldAnimatePageTransitions() ? 0 : 1 }}
                >
                  <CardContent className="p-6">
                    <button 
                      onClick={() => router.push('/analytics')}
                      className="w-full h-full flex flex-col items-center justify-center space-y-3 group"
                    >
                      <div className="p-4 bg-blue-500/20 rounded-full group-hover:bg-blue-500/30 transition-colors">
                        <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-center">
                        <h3 className="font-semibold text-foreground">View Analytics</h3>
                        <p className="text-sm text-muted-foreground mt-1">Deep spending insights</p>
                      </div>
                      <ArrowRight className="absolute bottom-6 right-6 h-4 w-4 text-blue-600/50 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </CardContent>
                </Card>
                
                
              </div>

              {/* Collapsible Budget Breakdown */}
              <Collapsible open={isBreakdownOpen} onOpenChange={setIsBreakdownOpen}>
                <Card className="border-0 shadow-md overflow-hidden animate-fade-in-up animate-delay-400">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Wallet className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <CardTitle>Budget Breakdown</CardTitle>
                            <CardDescription className="mt-1">
                              Detailed view of your monthly income distribution
                            </CardDescription>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          {isBreakdownOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-6">
                        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                          <div className="text-2xl font-bold text-blue-600">
                            {formatCurrency(budget.monthlyIncome)}
                          </div>
                          <div className="text-sm text-muted-foreground">Total Income</div>
                        </div>
                        <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200/50 dark:border-green-800/50">
                          <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(totalAllocated)}
                          </div>
                          <div className="text-sm text-muted-foreground">Allocated</div>
                        </div>
                        <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200/50 dark:border-red-800/50">
                          <div className="text-2xl font-bold text-red-600">
                            {formatCurrency(stats.totalSpent)}
                          </div>
                          <div className="text-sm text-muted-foreground">Spent</div>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-950/20 rounded-lg border border-gray-200/50 dark:border-gray-800/50">
                          <div className="text-2xl font-bold text-gray-600">
                            {formatCurrency(unallocatedFunds)}
                          </div>
                          <div className="text-sm text-muted-foreground">Unallocated</div>
                        </div>
                      </div>
                      
                      {/* Spending Distribution Chart */}
                      <div className="bg-gradient-to-b from-background/50 to-background/30 rounded-xl p-6 border border-border/50">
                        <h3 className="text-lg font-semibold mb-4 text-center">Budget Distribution</h3>
                        <div className="h-80 flex justify-center">
                          <Doughnut data={distributionData} options={distributionOptions} />
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
              
              {/* Collapsible Category Breakdown */}
              <Collapsible open={isCategoriesOpen} onOpenChange={setIsCategoriesOpen}>
                <Card className="border-0 shadow-md overflow-hidden animate-fade-in-up animate-delay-500">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-500/10 rounded-lg">
                            <Target className="h-5 w-5 text-green-500" />
                          </div>
                          <div>
                            <CardTitle>Category Breakdown</CardTitle>
                            <CardDescription className="mt-1">
                              Detailed spending by category with progress tracking
                            </CardDescription>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          {isCategoriesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <CategoryCards 
                        categorySpending={filteredCategorySpending} 
                        showUnallocatedInfo={hasUnallocatedFunds}
                        unallocatedAmount={unallocatedFunds}
                      />
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
              
              {/* Collapsible Recent Transactions */}
              <Collapsible open={isTransactionsOpen} onOpenChange={setIsTransactionsOpen}>
                <Card className="border-0 shadow-md overflow-hidden animate-fade-in-up animate-delay-500">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-500/10 rounded-lg">
                            <CreditCard className="h-5 w-5 text-purple-500" />
                          </div>
                          <div>
                            <CardTitle>Recent Transactions</CardTitle>
                            <CardDescription className="mt-1">
                              Your latest {transactions.length > 5 ? 5 : transactions.length} transactions this month
                            </CardDescription>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          {isTransactionsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <RecentTransactions 
                        transactions={transactions.slice(0, 5)} 
                        categoryColors={categoryColors}
                      />
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}