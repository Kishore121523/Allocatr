'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  PiggyBank,
  Target,
  DollarSign,
  Clock,
  BarChart3,
  Lightbulb,
  Shield
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Budget, CategorySpending } from '@/types';

type EnhancedInsights = {
  velocity: {
    velocity: number;
    expectedSpending: number;
    actualSpending: number;
    daysRemaining: number;
    projectedMonthEnd: number;
  };
  momentum: { change: number; previousSpending: number; recentSpending: number };
  flexibility: { totalAllocated: number; hasUnallocatedFunds: boolean; unallocatedAmount: number; flexibilityPercentage: number };
  avgTransactionSize: number;
  mostExpensiveDay: { amount: number };
  categoryEfficiency: { riskLevel: 'high' | 'medium' | 'low'; categoryName: string }[];
  spendingHabits: { weekdayVsWeekend: { weekday: number; weekend: number }; largeTransactions: number };
  totalTransactions: number;
  uniqueCategories: number;
  budgetUtilization: number;
};

type InsightsTabProps = {
  enhancedInsights: EnhancedInsights;
  budget: Budget;
  allocatedCategories: CategorySpending[];
};

export function InsightsTab({ enhancedInsights, budget, allocatedCategories }: InsightsTabProps) {
  // Calculate budget pulse based on spending patterns
  const getBudgetPulse = () => {
    const velocity = enhancedInsights.velocity.velocity;
    const momentum = enhancedInsights.momentum.change;
    const highRiskCount = enhancedInsights.categoryEfficiency.filter(c => c.riskLevel === 'high').length;
    
    // Determine pulse type based on spending patterns
    if (velocity > 1.15 || momentum > 25 || highRiskCount > 2) {
      return {
        type: 'irregular',
        status: 'Irregular Pulse',
        description: 'Erratic spending patterns detected',
        variant: 'destructive' as const,
        pulseSpeed: 'animate-pulse',
        intensity: 'High'
      };
    } else if (velocity > 1.05 || momentum > 10 || highRiskCount > 0) {
      return {
        type: 'elevated',
        status: 'Elevated Pulse',
        description: 'Spending slightly above normal rhythm',
        variant: 'outline' as const,
        className: 'text-warning border-warning bg-warning/10',
        pulseSpeed: 'animate-pulse',
        intensity: 'Medium'
      };
    } else if (velocity < 0.8 && momentum < -5) {
      return {
        type: 'slow',
        status: 'Calm Pulse',
        description: 'Very controlled spending rhythm',
        variant: 'default' as const,
        pulseSpeed: 'animate-pulse',
        intensity: 'Low'
      };
    } else {
      return {
        type: 'steady',
        status: 'Steady Pulse',
        description: 'Healthy spending rhythm maintained',
        variant: 'outline' as const,
        className: 'text-success border-success bg-success/10',
        pulseSpeed: 'animate-pulse',
        intensity: 'Normal'
      };
    }
  };

  const budgetPulse = getBudgetPulse();
  
  const getPulseVisualization = (pulseType: string) => {
    const baseStyle = "w-5 h-5 rounded-full mx-1 transition-all duration-300";
    const pulseConfigs = {
      irregular: {
        color: "bg-destructive",
        animation: "pulse-irregular"
      },
      elevated: {
        color: "bg-warning",
        animation: "pulse-elevated" 
      },
      steady: {
        color: "bg-success",
        animation: "pulse-steady"
      },
      slow: {
        color: "bg-primary",
        animation: "pulse-smooth"
      }
    };
    
    const config = pulseConfigs[pulseType as keyof typeof pulseConfigs] || pulseConfigs.steady;
    
    return (
      <div className="flex items-center justify-center gap-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`${baseStyle} ${config.color} ${config.animation}`}
            style={{
              animationDelay: `${i * 0.15}s`
            }}
          />
        ))}
      </div>
    );
  };

  // Get spending trend
  const getSpendingTrend = () => {
    if (enhancedInsights.velocity.velocity > 1.1) return {
      icon: TrendingUp,
      text: 'Spending Above Plan',
      color: 'text-destructive',
      bgColor: 'border'
    };
    if (enhancedInsights.velocity.velocity < 0.8) return {
      icon: TrendingDown,
      text: 'Spending Below Plan',
      color: 'text-success',
      bgColor: 'border'
    };
    return {
      icon: BarChart3,
      text: 'Spending On Track',
      color: 'text-primary',
      bgColor: 'border'
    };
  };

  const spendingTrend = getSpendingTrend();

  // Get top insights
  const getTopInsights = () => {
    const insights = [];

    // Budget velocity insight
    if (enhancedInsights.velocity.velocity > 1.1) {
      insights.push({
        icon: AlertTriangle,
        title: 'High Spending Rate',
        description: `You're spending ${((enhancedInsights.velocity.velocity - 1) * 100).toFixed(0)}% faster than planned`,
        action: 'Consider slowing down discretionary spending',
        priority: 'high'
      });
    } else if (enhancedInsights.velocity.velocity < 0.8) {
      insights.push({
        icon: CheckCircle,
        title: 'Great Budget Control',
        description: `You're ${((1 - enhancedInsights.velocity.velocity) * 100).toFixed(0)}% under budget`,
        action: 'Consider investing surplus or increasing savings',
        priority: 'positive'
      });
    }

    // Weekend spending pattern
    if (enhancedInsights.spendingHabits.weekdayVsWeekend.weekend > enhancedInsights.spendingHabits.weekdayVsWeekend.weekday * 1.5) {
      insights.push({
        icon: Calendar,
        title: 'Weekend Spending Spike',
        description: 'You spend significantly more on weekends',
        action: 'Set weekend budgets or plan free activities',
        priority: 'medium'
      });
    }

    // Category overruns
    const highRiskCategories = enhancedInsights.categoryEfficiency.filter(c => c.riskLevel === 'high');
    if (highRiskCategories.length > 0) {
      insights.push({
        icon: Target,
        title: 'Budget Overruns',
        description: `${highRiskCategories.length} categories are over budget`,
        action: `Review ${highRiskCategories.map(c => c.categoryName).slice(0, 2).join(', ')}`,
        priority: 'high'
      });
    }

    // Unallocated funds opportunity
    if (enhancedInsights.flexibility.hasUnallocatedFunds && enhancedInsights.flexibility.unallocatedAmount > 100) {
      insights.push({
        icon: PiggyBank,
        title: 'Optimization Opportunity',
        description: `${formatCurrency(enhancedInsights.flexibility.unallocatedAmount)} unallocated`,
        action: 'Assign to savings or emergency fund',
        priority: 'medium'
      });
    }

    return insights.slice(0, 4); // Show top 4 insights
  };

  const topInsights = getTopInsights();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
          case 'high': return 'border-destructive';
    case 'medium': return 'border-warning/30';
    case 'positive': return 'border-success/30';
    default: return 'border-border';
    }
  };

  const getPriorityIconColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-warning';
      case 'positive': return 'text-success';
      default: return 'text-primary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Financial Health Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-0 shadow-sm col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Budget Pulse
            </CardTitle>
            <CardDescription>Your spending rhythm and tempo this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-4xl font-bold text-foreground">
                  {budgetPulse.intensity}
                </div>
                <div>
                  <Badge 
                    variant={budgetPulse.variant} 
                    className={budgetPulse.className}
                  >
                    {budgetPulse.status}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">{budgetPulse.description}</p>
                </div>
              </div>
              <div className={`p-3 rounded-full ${spendingTrend.bgColor}`}>
                <spendingTrend.icon className={`h-6 w-6 ${spendingTrend.color}`} />
              </div>
            </div>
            
            {/* Pulse rhythm visualization */}
            <div className="mb-4">
              <div className="flex items-center justify-center py-6 bg-muted/50 rounded-lg border-2 border-border/50">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wide font-medium">Spending Rhythm</p>
                  {getPulseVisualization(budgetPulse.type)}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <p className="font-semibold">{((enhancedInsights.velocity.velocity) * 100).toFixed(0)}%</p>
                <p className="text-muted-foreground">Spending Rate</p>
              </div>
              <div>
                <p className="font-semibold">{enhancedInsights.velocity.daysRemaining}</p>
                <p className="text-muted-foreground">Days Left</p>
              </div>
              <div>
                <p className="font-semibold">{enhancedInsights.uniqueCategories}/{allocatedCategories.length}</p>
                <p className="text-muted-foreground">Active Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-1">
              <Clock className="h-5 w-5 text-primary" />
              This Month
            </CardTitle>
            <CardDescription>Key numbers at a glance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Spent so far</span>
              <span className="font-semibold">{formatCurrency(enhancedInsights.velocity.actualSpending)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Daily average</span>
              <span className="font-semibold">{formatCurrency(enhancedInsights.avgTransactionSize)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Transactions</span>
              <span className="font-semibold">{enhancedInsights.totalTransactions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Categories used</span>
              <span className="font-semibold">{enhancedInsights.uniqueCategories}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Insights */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-1">
            <Lightbulb className="h-5 w-5 text-warning" />
            Key Insights & Recommendations
          </CardTitle>
          <CardDescription>
            {topInsights.length > 0 ? 'Areas that need your attention' : 'Your spending looks healthy!'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topInsights.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {topInsights.map((insight, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border-1 ${getPriorityColor(insight.priority)}`}
                >
                  <div className="flex items-start gap-2">
                    <insight.icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${getPriorityIconColor(insight.priority)}`} />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                      <p className="text-xs font-medium text-muted-foreground">
                        💡 {insight.action}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-2">You're doing great!</h3>
              <p className="text-muted-foreground">Your spending is well-controlled and on track with your budget.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Projection */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-1">
            <DollarSign className="h-5 w-5 text-success" />
            Month-End Projection
          </CardTitle>
          <CardDescription>Where you're headed based on current spending</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Projected spending</p>
              <p className={`text-2xl font-bold ${enhancedInsights.velocity.projectedMonthEnd > budget.monthlyIncome ? 'text-destructive' : 'text-success'}`}>
                {formatCurrency(enhancedInsights.velocity.projectedMonthEnd)}
              </p>
            </div>
            <div className="text-center p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Monthly budget</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(budget.monthlyIncome)}
              </p>
            </div>
            <div className="text-center p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">
                {enhancedInsights.velocity.projectedMonthEnd > budget.monthlyIncome ? 'Over budget' : 'Under budget'}
              </p>
              <p className={`text-2xl font-bold ${enhancedInsights.velocity.projectedMonthEnd > budget.monthlyIncome ? 'text-destructive' : 'text-success'}`}>
                {formatCurrency(Math.abs(budget.monthlyIncome - enhancedInsights.velocity.projectedMonthEnd))}
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Budget progress</span>
              <span>{((enhancedInsights.velocity.actualSpending / budget.monthlyIncome) * 100).toFixed(0)}%</span>
            </div>
            <Progress value={(enhancedInsights.velocity.actualSpending / budget.monthlyIncome) * 100} className="mb-2" />
            <p className="text-xs text-muted-foreground">
              {enhancedInsights.velocity.daysRemaining} days remaining in the month
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Hidden data for LLM processing - not displayed to user */}
      <div className="hidden">
        <div data-llm-velocity={enhancedInsights.velocity.velocity}></div>
        <div data-llm-momentum={enhancedInsights.momentum.change}></div>
        <div data-llm-risk-categories={enhancedInsights.categoryEfficiency.filter(c => c.riskLevel === 'high').length}></div>
        <div data-llm-weekend-ratio={enhancedInsights.spendingHabits.weekdayVsWeekend.weekday > 0 ? 
          (enhancedInsights.spendingHabits.weekdayVsWeekend.weekend / enhancedInsights.spendingHabits.weekdayVsWeekend.weekday) : 0}></div>
        <div data-llm-budget-utilization={enhancedInsights.budgetUtilization}></div>
        <div data-llm-flexibility-score={enhancedInsights.flexibility.flexibilityPercentage}></div>
        <div data-llm-pulse-type={budgetPulse.type}></div>
        <div data-llm-pulse-intensity={budgetPulse.intensity}></div>
        <div data-llm-large-transactions={enhancedInsights.spendingHabits.largeTransactions}></div>
      </div>
    </div>
  );
}