// components/dashboard/summary-report-modal.tsx

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSummaryReport } from '@/hooks/use-summary-report';
import { Budget, Transaction, SummaryReportData } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { 
  FileText, 
  TrendingUp, 
  DollarSign, 
  Clock,
  Target,
  AlertCircle,
  CheckCircle,
  Loader2,
  Sparkles,
  ArrowUp,
  ArrowDown,
  PiggyBank,
  CalendarDays,
  Receipt,
  Lightbulb,
  Zap,
  Shield,
  Info
} from 'lucide-react';

interface SummaryReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget: Budget;
  transactions: Transaction[];
  currentMonth: string;
}

export function SummaryReportModal({
  open,
  onOpenChange,
  budget,
  transactions,
  currentMonth
}: SummaryReportModalProps) {
  const { loading, error, reportData, generateReport, clearReport } = useSummaryReport();
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      clearReport();
      setHasGenerated(false);
    }
    onOpenChange(newOpen);
  };

  const handleGenerateReport = async () => {
    setHasGenerated(true);
    await generateReport(budget, transactions, currentMonth);
  };

  const renderSummaryReport = (data: SummaryReportData) => {
    // Handle cases where data might not have the expected structure
    const summary = data.summary || "Great job managing your finances this month! Here are some key insights to help you continue your financial success.";
    const insights = data.insights || [];
    
    return (
      <div className="space-y-6">
        {/* Summary Section */}
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 gap-2">
          <CardHeader >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-gray-900 rounded-xl shadow-sm">
                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-lg">Financial Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-md">
              {summary}
            </p>
          </CardContent>
        </Card>

        {/* Key Insights */}
        {insights.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-amber-500" />
              Key Insights
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              {insights.map((insight, index) => (
                <InsightCard key={index} insight={insight} index={index} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };


  const InsightCard = ({ insight, index }: { insight: { title: string; text: string }; index: number }) => {
    const colors = [
      
      // Minimal Solid Colors - Subtle Blues
      'bg-blue-50 dark:bg-blue-950/20 border border-blue-500 dark:border-blue-500/50',
      'bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-500 dark:border-indigo-500/50',
      'bg-sky-50 dark:bg-sky-950/20 border border-sky-500 dark:border-sky-500/50',
      'bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-500 dark:border-cyan-500/50',
      'bg-slate-100 dark:bg-slate-800/30 border border-slate-500 dark:border-slate-500/50',
      
    ];
    
    const icons = [
      <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />,
      <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
      <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />,
      <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
      <Lightbulb className="h-4 w-4 text-teal-600 dark:text-teal-400" />
    ];

    return (
      <Card className={`border-0 ${colors[index % colors.length]} transition-all duration-200 hover:scale-[1.002]`}>
        <CardContent className="p-4 py-0">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm">
              {icons[index % icons.length]}
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                {insight.title}
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {insight.text}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };



  const getMonthDisplayName = (monthString: string) => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="min-w-5xl max-h-[92vh] p-0 overflow-hidden no-scrollbar [&>button]:hidden">
        <DialogTitle className="sr-only">
          Monthly Financial Report for {getMonthDisplayName(currentMonth)}
        </DialogTitle>
        {/* Header */}
        <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-white dark:bg-gray-900 rounded-xl shadow-sm">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Monthly Financial Report
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  {getMonthDisplayName(currentMonth)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(92vh-80px)] scrollbar-hide">
          <div className="p-6 space-y-6">
            {/* Quick Stats - Only show after report generation */}
            {reportData && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <ArrowUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                    {formatCurrency(reportData.stats.income)}
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    Monthly Income
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Receipt className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <ArrowDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                    {formatCurrency(reportData.stats.totalSpent)}
                  </div>
                  <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                    Total Spent
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <PiggyBank className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <Badge className="text-[10px] px-1.5 py-0.5" variant="secondary">
                      {reportData.stats.savingsRate}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {formatCurrency(reportData.stats.remainingBudget)}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Available to Save
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <CalendarDays className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                      {reportData.stats.daysRemaining} days
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {reportData.stats.monthProgress}
                  </div>
                  <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    Month Progress
                  </div>
                </div>
              </div>
            )}

            {/* Generate Report CTA */}
            {!hasGenerated && (
              <Card className="border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
                <CardContent className="p-12 text-center">
                  <div className="inline-flex p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg mb-6">
                    <Sparkles className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">
                    Generate Your AI Financial Report
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto leading-relaxed">
                    Get personalized insights, spending analysis, and tailored recommendations 
                    to optimize your budget and achieve your financial goals.
                  </p>
                  <Button 
                    onClick={handleGenerateReport}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate AI Report
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Loading State */}
            {loading && (
              <div className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-12">
                    <div className="text-center">
                      <div className="inline-flex p-4 bg-blue-100 dark:bg-blue-950/30 rounded-2xl mb-6">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">
                        Analyzing Your Finances
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                        Our AI is reviewing your transactions and creating personalized insights...
                      </p>
                    </div>
                    
                    <div className="mt-8 space-y-4">
                      {['Analyzing spending patterns...', 'Identifying savings opportunities...', 'Creating personalized recommendations...'].map((text, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{text}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Error State */}
            {error && (
              <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg h-fit">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                        Unable to Generate Report
                      </h3>
                      <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                        {error}
                      </p>
                      <Button 
                        onClick={handleGenerateReport}
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30"
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Report Content */}
            {reportData && !loading && (
              <>
                {/* Report Timestamp */}
                <div className="flex items-center gap-3 px-1">
                  <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
                    <Clock className="h-3 w-3" />
                    Generated just now
                  </Badge>
                  <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
                    <Receipt className="h-3 w-3" />
                    {reportData.stats.transactionCount} transactions analyzed
                  </Badge>
                  <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
                    <Shield className="h-3 w-3" />
                    {reportData.stats.categoriesOverBudget} categories need attention
                  </Badge>
                </div>

                {/* Main Report Sections */}
                {renderSummaryReport(reportData)}

                 {/* Daily Budget Tracker */}
                 <Card className="border-0 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-950/30 dark:to-gray-950/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        Daily Budget Tracker
                      </span>
                      <span className="text-sm font-normal text-gray-500">
                        {reportData.stats.daysRemaining} days left
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Recommended daily spend</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {formatCurrency(reportData.stats.dailyBudgetRemaining)}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Start of month</span>
                          <span>Today</span>
                          <span>End of month</span>
                        </div>
                        <Progress 
                          value={parseInt(reportData.stats.monthProgress)} 
                          className="h-3" 
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4 pt-2">
                        <div className="text-center">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Spent/day avg</div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {formatCurrency(reportData.stats.totalSpent / (30 - reportData.stats.daysRemaining))}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Target/day</div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {formatCurrency(reportData.stats.income / 30)}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Variance</div>
                          <div className={`text-sm font-semibold ${
                            reportData.stats.remainingBudget > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {reportData.stats.remainingBudget > 0 ? '+' : ''}{formatCurrency(reportData.stats.remainingBudget / reportData.stats.daysRemaining - reportData.stats.income / 30)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                  {/* Key Metrics Summary */}
                  <Card className="bg-muted/30 gap-3 py-4">
                        <CardHeader>
                        <CardTitle className="text-lg">Key Metrics Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm w-full text-center">
                            <div>
                            <span className="text-muted-foreground">Savings Rate:</span>
                            <div className="font-semibold text-green-600">{reportData.stats.savingsRate}</div>
                            </div>
                            <div>
                            <span className="text-muted-foreground">Spending Rate:</span>
                            <div className="font-semibold text-red-600">{reportData.stats.spendingRate}</div>
                            </div>
                            <div>
                            <span className="text-muted-foreground">Transactions:</span>
                            <div className="font-semibold">{reportData.stats.transactionCount}</div>
                            </div>
                            <div>
                            <span className="text-muted-foreground">Days Remaining:</span>
                            <div className="font-semibold">{reportData.stats.daysRemaining}</div>
                            </div>
                            <div>
                            <span className="text-muted-foreground">Daily Budget:</span>
                            <div className="font-semibold">{formatCurrency(reportData.stats.dailyBudgetRemaining)}</div>
                            </div>
                            <div>
                            <span className="text-muted-foreground">Over Budget Categories:</span>
                            <div className="font-semibold text-orange-600">{reportData.stats.categoriesOverBudget}</div>
                            </div>
                        </div>
                        </CardContent>
                    </Card>
                    
                    {/* Footer with additional actions */}
                    <div className="mt-2 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="gap-1.5">
                            <Info className="h-3 w-3" />
                            AI Generated
                          </Badge>
                          <Badge variant="outline" className="gap-1.5">
                            <Shield className="h-3 w-3" />
                            Secure Analysis
                          </Badge>
                        </div>
                        <Button variant="outline" size="sm" className="gap-2">
                          <FileText className="h-4 w-4" />
                          Export Report
                        </Button>
                      </div>
                    </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}