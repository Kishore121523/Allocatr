// app/api/summary-report/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { AzureOpenAI } from "openai";
import { calculateDashboardStats, calculateCategorySpending, getTopCategories, calculateOverBudgetInsights, getMonthProgress, getRemainingDaysInMonth, getDailyBudgetRemaining } from '@/lib/budget-calculations';
import { formatCurrency } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { budget, transactions, currentMonth } = await request.json();

    if (!budget || !transactions) {
      return NextResponse.json(
        { error: 'Missing budget or transactions data' },
        { status: 400 }
      );
    }

    // Check if Azure OpenAI is configured
    const endpoint = process.env.AZURE_O3_MINI_ENDPOINT;
    const apiKey = process.env.AZURE_O3_MINI_KEY;
    const deployment = process.env.AZURE_O3_MINI_DEPLOYMENT_NAME;
    const apiVersion = process.env.AZURE_O3_MINI_API_VERSION || "2024-12-01-preview";

    if (!endpoint || !apiKey || !deployment) {
      return NextResponse.json(
        { error: 'Azure OpenAI not configured' },
        { status: 500 }
      );
    }

    // Calculate all the statistics
    const stats = calculateDashboardStats(budget, transactions);
    const categorySpending = calculateCategorySpending(budget, transactions);
    const topCategories = getTopCategories(categorySpending, 5);
    const overBudgetInsights = calculateOverBudgetInsights(budget, transactions);
    const monthProgress = getMonthProgress(currentMonth);
    const daysRemaining = getRemainingDaysInMonth(currentMonth);
    const dailyBudgetRemaining = getDailyBudgetRemaining(stats.remainingBudget, currentMonth);

    // Calculate additional insights
    const totalAllocated = budget.categories.reduce((sum: number, cat: any) => sum + cat.allocatedAmount, 0);
    const unallocatedFunds = budget.monthlyIncome - totalAllocated;
    const savingsRate = budget.monthlyIncome > 0 
      ? ((stats.remainingBudget / budget.monthlyIncome) * 100).toFixed(1)
      : '0';
    const spendingRate = budget.monthlyIncome > 0
      ? ((stats.totalSpent / budget.monthlyIncome) * 100).toFixed(1)
      : '0';
    
    // Calculate daily spending average based on month progress
    const [year, month] = currentMonth.split('-').map(Number);
    const targetDate = new Date(year, month - 1, 1);
    const today = new Date();
    let daysInMonth = new Date(year, month, 0).getDate();
    let daysPassed = daysInMonth; // Default for past months
    
    // If it's the current month, calculate actual days passed
    if (targetDate.getFullYear() === today.getFullYear() && targetDate.getMonth() === today.getMonth()) {
      daysPassed = today.getDate();
    } else if (targetDate.getFullYear() > today.getFullYear() || 
               (targetDate.getFullYear() === today.getFullYear() && targetDate.getMonth() > today.getMonth())) {
      // Future month
      daysPassed = 0;
    }
    
    const dailySpendingAverage = daysPassed > 0 ? stats.totalSpent / daysPassed : 0;

    // Prepare data for AI analysis
    const analysisData = {
      month: currentMonth,
      monthProgress: `${monthProgress}%`,
      daysRemaining,
      income: budget.monthlyIncome,
      totalSpent: stats.totalSpent,
      remainingBudget: stats.remainingBudget,
      savingsRate: `${savingsRate}%`,
      spendingRate: `${spendingRate}%`,
      transactionCount: stats.transactionCount,
      categoriesOverBudget: stats.categoriesOverBudget,
      totalAllocated,
      unallocatedFunds,
      dailyBudgetRemaining,
      dailySpendingAverage,
      topCategories: topCategories.map(cat => ({
        name: cat.categoryName,
        spent: cat.spent,
        allocated: cat.allocated,
        percentageUsed: cat.percentageUsed
      })),
      overBudgetCategories: overBudgetInsights.overBudgetCategories.map(cat => ({
        name: cat.categoryName,
        overage: Math.abs(cat.remaining),
        allocated: cat.allocated,
        spent: cat.spent
      })),
      totalOverage: overBudgetInsights.totalOverage,
      canCoverWithUnallocated: overBudgetInsights.canCoverWithUnallocated,
      coveragePercentage: overBudgetInsights.coveragePercentage
    };

    // Initialize client
    const client = new AzureOpenAI({
      endpoint,
      apiKey,
      apiVersion,
      deployment,
    });

    const prompt = `You are a financial advisor analyzing monthly financial data to provide key insights. Based on the following financial data, identify 4-5 most important insights that would be valuable for the user to know.

            Financial Data:
            ${JSON.stringify(analysisData, null, 2)}

            Instructions:
            1. Start with a positive acknowledgment of their financial progress (e.g., "You did great this month by saving X% of your income" or "You're making excellent progress with your budget management" or "You have to work on your spending habits" etc.)
            2. Identify 4-5 most important insights from the data that would be worth highlighting
            3. Each insight should be actionable, specific, and based on the actual data
            4. Include specific numbers, percentages, and amounts from the data
            5. Mix positive achievements with constructive suggestions for improvement
            6. Focus on patterns, trends, and opportunities for better financial management
            7. Keep the tone encouraging and motivational

            Return ONLY a valid JSON object with this exact structure:
            {
              "summary": "A 2-3 sentence positive summary of their overall financial performance",
              "insights": [
                {
                  "title": "Short, catchy title for the insight",
                  "text": "Detailed explanation of the insight with specific numbers and actionable advice"
                }
              ]
            }

            Example insights to look for:
            - Savings rate and progress toward goals
            - Top spending categories and potential optimization
            - Budget adherence and areas for improvement
            - Income vs spending trends
            - Unusual spending patterns or opportunities
            - Progress compared to previous periods (if data available)

            Make sure the JSON is properly formatted and valid. Focus on the most impactful insights that would help the user make better financial decisions.`;

    try {
      const completion = await client.chat.completions.create({
        model: deployment, 
        messages: [
          {
            role: 'system',
            content: 'You are a professional financial advisor who creates personalized, encouraging budget summary reports. You analyze financial data and provide insights in a warm, motivational tone that helps users understand their financial situation and make better decisions at the end of the month.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_completion_tokens: 3000,
      });

      const contentText = completion.choices?.[0]?.message?.content;
      
      if (contentText) {
        try {
          // Try to parse the JSON response from the AI
          const parsedResponse = JSON.parse(contentText);
          
          // Validate the structure
          if (parsedResponse.summary && Array.isArray(parsedResponse.insights)) {
            return NextResponse.json({
              summary: parsedResponse.summary,
              insights: parsedResponse.insights,
              stats: analysisData
            });
          } else {
            // Fallback: if the AI didn't return proper JSON, create a basic structure
            return NextResponse.json({
              summary: "Great job managing your finances this month! Here are some key insights to help you continue your financial success.",
              insights: [
                {
                  title: "Financial Overview",
                  text: contentText
                }
              ],
              stats: analysisData
            });
          }
        } catch (parseError) {
          console.error('Failed to parse AI response as JSON:', parseError);
          // Fallback: if JSON parsing fails, create a basic structure
          return NextResponse.json({
            summary: "Great job managing your finances this month! Here are some key insights to help you continue your financial success.",
            insights: [
              {
                title: "Financial Analysis",
                text: contentText
              }
            ],
            stats: analysisData
          });
        }
      }
    } catch (azureError: any) {
      console.error('Azure OpenAI error:', azureError);
      return NextResponse.json(
        { 
          error: 'AI report generation failed',
          details: azureError.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );

  } catch (error) {
    console.error('Summary report error:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary report' },
      { status: 500 }
    );
  }
}
