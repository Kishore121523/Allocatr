// app/analytics/page.tsx

'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { ProtectedRoute } from '@/components/layout/protected-route';
import { AppHeader } from '@/components/layout/app-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBudget } from '@/hooks/use-budget';
import { useTransactions } from '@/hooks/use-transactions';
import { useMonth } from '@/providers/month-provider';
import { calculateCategorySpending,calculateBudgetFlexibility } from '@/lib/budget-calculations';
import { EmptyBudget } from '@/components/dashboard/empty-budget';
import { KeyMetricsCards } from '@/components/analytics/key-metrics';
import { TimeRangeSelector } from '@/components/analytics/time-range-selector';
import { MainSpendingChart } from '@/components/analytics/main-spending-chart';
import { PatternsTab } from '@/components/analytics/patterns-tab';
import { CategoriesTab } from '@/components/analytics/categories-tab';
import { InsightsTab } from '@/components/analytics/insights-tab';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale,
} from 'chart.js';
// Chart components are used within modular components
import { formatCurrency, formatLocalDateYYYYMMDD, parseYYYYMMDDToLocalDate } from '@/lib/utils';
import type { Budget, CategorySpending } from '@/types';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale
);

export default function AnalyticsPage() {
  const { currentMonth } = useMonth();
  const { budget, loading: budgetLoading } = useBudget(currentMonth);
  const { transactions, loading: transactionsLoading } = useTransactions(currentMonth);
  const [timeRange, setTimeRange] = useState('7'); // days
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([]);
  const [allocatedCategories, setAllocatedCategories] = useState<CategorySpending[]>([]);

  // Refs for GSAP animations - MUST be declared before any conditional returns
  const headerRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const tabContentRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  const [activeTab, setActiveTab] = useState('patterns');

  const isLoading = budgetLoading || transactionsLoading;

  // GSAP tab animation function
  const animateTabContent = useCallback((newTab: string) => {
    const currentContent = tabContentRefs.current[activeTab];
    const newContent = tabContentRefs.current[newTab];

    if (currentContent && newContent && activeTab !== newTab) {
      // Create a timeline for smooth transition
      const tl = gsap.timeline();
      
      // Exit animation for current content
      tl.to(currentContent, {
        opacity: 0,
        y: -20,
        duration: 0.2,
        ease: "power2.in"
      })
      // Enter animation for new content
      .set(newContent, { opacity: 0, y: 20 })
      .to(newContent, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: "power2.out"
      });
    }
    
    setActiveTab(newTab);
  }, [activeTab]);

  useEffect(() => {
    if (budget && transactions) {
      const allCategorySpending = calculateCategorySpending(budget, transactions);
      const allocated = allCategorySpending.filter(cat => cat.allocated > 0);
      setCategorySpending(allCategorySpending);
      setAllocatedCategories(allocated);
    }
  }, [budget, transactions]);

  // GSAP animation for analytics page elements - MUST be declared before any conditional returns
  useEffect(() => {
    const elements = [headerRef.current, metricsRef.current, tabsRef.current].filter(Boolean);
    
    if (elements.length > 0 && !isLoading && budget) {
      // Set initial state
      gsap.set(elements, {
        x: -30,
        opacity: 0
      });

      // Animate elements with stagger
      gsap.to(elements, {
        x: 0,
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
        stagger: 0.1,
        delay: 0.1
      });
    }
  }, [isLoading, budget]);

  // Initialize tab content opacity
  useEffect(() => {
    Object.values(tabContentRefs.current).forEach((ref, index) => {
      if (ref) {
        // Set initial state - only the active tab should be visible
        gsap.set(ref, {
          opacity: index === 0 ? 1 : 0,
          y: index === 0 ? 0 : 20
        });
      }
    });
  }, [budget, transactions]); // Re-run when data loads

  // Calculate daily spending for the line chart
  const getDailySpending = () => {
    const days = parseInt(timeRange);
    const dailyData: Record<string, number> = {};
    const today = new Date();

    // Initialize all days with 0 using LOCAL date keys
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = formatLocalDateYYYYMMDD(date);
      dailyData[dateKey] = 0;
    }

    // Add transaction amounts to corresponding days using LOCAL date keys
    transactions.forEach(transaction => {
      const dateKey = formatLocalDateYYYYMMDD(transaction.date);
      if (dailyData[dateKey] !== undefined) {
        dailyData[dateKey] += transaction.amount;
      }
    });

    const labels = Object.keys(dailyData).map(dateKey => {
      const d = parseYYYYMMDDToLocalDate(dateKey);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const data = Object.values(dailyData);

    // Calculate cumulative spending
    const cumulative = data.reduce((acc: number[], curr, i) => {
      if (i === 0) return [curr];
      return [...acc, acc[i - 1] + curr];
    }, []);

    return { labels, daily: data, cumulative };
  };

  const getSpendingMomentum = () => {
    const today = new Date();
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);
    const previous7Days = new Date(today);
    previous7Days.setDate(previous7Days.getDate() - 14);
    
    const recentSpending = transactions
      .filter(t => new Date(t.date) >= last7Days)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const previousSpending = transactions
      .filter(t => new Date(t.date) >= previous7Days && new Date(t.date) < last7Days)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const change = previousSpending > 0 ? ((recentSpending - previousSpending) / previousSpending) * 100 : 0;
    
    return { recentSpending, previousSpending, change };
  };

  // Calculate spending velocity (rate of spending)
  const getSpendingVelocity = () => {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysPassed = today.getDate();
    const expectedSpending = (budget?.monthlyIncome || 0) * (daysPassed / daysInMonth);
    const actualSpending = transactions.reduce((sum, t) => sum + t.amount, 0);
    const velocity = actualSpending / expectedSpending;

    return {
      expectedSpending,
      actualSpending,
      velocity,
      daysRemaining: daysInMonth - daysPassed,
      projectedMonthEnd: actualSpending * (daysInMonth / daysPassed)
    };
  };

  // Enhanced insights calculation
  const getEnhancedInsights = (budgetArg: Budget) => {
    const velocity = getSpendingVelocity();
    const momentum = getSpendingMomentum();
    const flexibility = calculateBudgetFlexibility(budgetArg);
    
    // Calculate more detailed metrics
    const avgTransactionSize = transactions.length > 0 ? 
      transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length : 0;
    
    const mostExpensiveDay = transactions.reduce((max, t) => {
      const daySpending = transactions
        .filter(tr => formatLocalDateYYYYMMDD(tr.date) === formatLocalDateYYYYMMDD(t.date))
        .reduce((sum, tr) => sum + tr.amount, 0);
      return daySpending > max.amount ? { date: t.date, amount: daySpending } : max;
    }, { date: new Date(), amount: 0 });

    const categoryEfficiency = allocatedCategories.map(cat => ({
      ...cat,
      efficiency: cat.spent / cat.allocated,
      riskLevel: cat.percentageUsed > 100 ? 'high' : cat.percentageUsed > 80 ? 'medium' : 'low'
    }));

    const spendingHabits = {
      weekdayVsWeekend: {
        weekday: transactions.filter(t => {
          const day = new Date(t.date).getDay();
          return day >= 1 && day <= 5;
        }).reduce((sum, t) => sum + t.amount, 0),
        weekend: transactions.filter(t => {
          const day = new Date(t.date).getDay();
          return day === 0 || day === 6;
        }).reduce((sum, t) => sum + t.amount, 0)
      },
      largeTransactions: transactions.filter(t => t.amount > avgTransactionSize * 2).length,
      frequentCategories: Object.entries(
        transactions.reduce((acc, t) => {
          acc[t.categoryId] = (acc[t.categoryId] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).sort(([,a], [,b]) => b - a).slice(0, 3)
    };

    return {
      velocity,
      momentum,
      flexibility,
      avgTransactionSize,
      mostExpensiveDay,
      categoryEfficiency,
      spendingHabits,
      totalTransactions: transactions.length,
      uniqueCategories: new Set(transactions.map(t => t.categoryId)).size,
      budgetUtilization: (velocity.actualSpending / budgetArg.monthlyIncome) * 100
    };
  };

  // NOW we can do conditional returns AFTER all hooks are declared
  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <AppHeader />
        </div>
      </ProtectedRoute>
    );
  }

  if (!budget) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <AppHeader />
          <main className="container mx-auto px-4 py-8">
            <EmptyBudget />
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  const spendingData = getDailySpending();
  const velocity = getSpendingVelocity();
  const enhancedInsights = getEnhancedInsights(budget);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <AppHeader />
        
        <main className="container mx-auto px-4 py-8">
          <div ref={headerRef} className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Analytics</h1>
            <p className="text-muted-foreground">Deep insights into your spending patterns</p>
          </div>

          <div ref={metricsRef}>
            <KeyMetricsCards
              velocity={{ velocity: velocity.velocity, projectedMonthEnd: velocity.projectedMonthEnd, actualSpending: velocity.actualSpending }}
              allocatedCategories={allocatedCategories as any}
            />

            <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
          </div>

          <div ref={tabsRef}>
            <MainSpendingChart spendingData={spendingData} timeRange={timeRange} />

            {/* Tabs for different views */}
            <Tabs value={activeTab} onValueChange={animateTabContent} className="space-y-4">
              <TabsList className="grid w-full grid-cols-3 bg-muted p-1 rounded-lg">
                <TabsTrigger value="patterns" className="rounded-md">Spending Patterns</TabsTrigger>
                <TabsTrigger value="categories" className="rounded-md">Category Analysis</TabsTrigger>
                <TabsTrigger value="insights" className="rounded-md">Insights</TabsTrigger>
              </TabsList>

              <TabsContent 
                value="patterns" 
                className="space-y-6"
                ref={(el) => { tabContentRefs.current.patterns = el; }}
              >
                <PatternsTab transactions={transactions as any} allocatedCategories={allocatedCategories as any} />
              </TabsContent>

              <TabsContent 
                value="categories" 
                className="space-y-6"
                ref={(el) => { tabContentRefs.current.categories = el; }}
              >
                <CategoriesTab allocatedCategories={allocatedCategories as any} />
              </TabsContent>

              <TabsContent 
                value="insights" 
                className="space-y-6"
                ref={(el) => { tabContentRefs.current.insights = el; }}
              >
                <InsightsTab enhancedInsights={enhancedInsights as any} budget={budget} allocatedCategories={allocatedCategories as any} />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};