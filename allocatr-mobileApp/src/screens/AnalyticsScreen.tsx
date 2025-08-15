// screens/AnalyticsScreen.tsx

import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  Dimensions,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  VictoryChart, 
  VictoryLine, 
  VictoryArea,
  VictoryPie, 
  VictoryBar,
  VictoryAxis,
  VictoryTheme,
  VictoryLabel
} from 'victory';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  startOfWeek,
  endOfWeek,
  subMonths,
  subWeeks,
  subDays
} from 'date-fns';
import { useAuth } from '../providers/auth-provider';
import { useMonth } from '../providers/month-provider';
import { useBudget } from '../hooks/use-budget';
import { useTransactions, useCategorySpending } from '../hooks/use-transactions';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { formatCurrency, getMonthName } from '../lib/utils';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 32;

type TimeRange = '7d' | '30d' | '90d';

export default function AnalyticsScreen() {
  const { user } = useAuth();
  const { selectedMonth } = useMonth();
  const { budget } = useBudget(selectedMonth);
  const { transactions } = useTransactions(selectedMonth);
  const { categorySpending, dashboardStats } = useCategorySpending(transactions, budget);
  
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // Calculate spending over time data
  const spendingOverTime = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case '7d':
        startDate = subDays(now, 7);
        break;
      case '30d':
        startDate = subDays(now, 30);
        break;
      case '90d':
        startDate = subDays(now, 90);
        break;
      default:
        startDate = subDays(now, 30);
    }
    
    const days = eachDayOfInterval({ start: startDate, end: now });
    const dailySpending = new Map<string, number>();
    
    // Initialize all days with 0
    days.forEach(day => {
      dailySpending.set(format(day, 'yyyy-MM-dd'), 0);
    });
    
    // Sum spending by day
    transactions.forEach(transaction => {
      const dateKey = format(transaction.date, 'yyyy-MM-dd');
      if (dailySpending.has(dateKey)) {
        dailySpending.set(dateKey, (dailySpending.get(dateKey) || 0) + transaction.amount);
      }
    });
    
    // Convert to chart data
    const chartData = days.map((day, index) => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const spent = dailySpending.get(dateKey) || 0;
      return {
        x: index,
        y: spent,
        date: day,
        label: format(day, timeRange === '7d' ? 'EEE' : 'M/d')
      };
    });
    
    // Calculate cumulative spending
    let cumulative = 0;
    const cumulativeData = chartData.map(point => {
      cumulative += point.y;
      return {
        ...point,
        cumulative
      };
    });
    
    return {
      daily: chartData,
      cumulative: cumulativeData.map(point => ({
        x: point.x,
        y: point.cumulative,
        label: point.label
      }))
    };
  }, [transactions, timeRange]);

  // Category pie chart data
  const categoryChartData = useMemo(() => {
    const spendingCategories = categorySpending.filter(cat => cat.spent > 0);
    const total = spendingCategories.reduce((sum, cat) => sum + cat.spent, 0);
    
    return spendingCategories.map(cat => ({
      x: cat.categoryName,
      y: cat.spent,
      color: cat.color,
      percentage: total > 0 ? (cat.spent / total) * 100 : 0
    })).sort((a, b) => b.y - a.y);
  }, [categorySpending]);

  // Top categories bar chart data
  const topCategoriesData = useMemo(() => {
    return categorySpending
      .filter(cat => cat.spent > 0)
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 6)
      .map((cat, index) => ({
        x: index + 1,
        y: cat.spent,
        label: cat.categoryName.length > 10 
          ? cat.categoryName.substring(0, 10) + '...' 
          : cat.categoryName,
        color: cat.color,
        full: cat.categoryName
      }));
  }, [categorySpending]);

  // Budget vs actual data
  const budgetVsActualData = useMemo(() => {
    return categorySpending
      .filter(cat => cat.allocated > 0)
      .slice(0, 8)
      .map((cat, index) => ({
        category: cat.categoryName.length > 8 
          ? cat.categoryName.substring(0, 8) + '...' 
          : cat.categoryName,
        allocated: cat.allocated,
        spent: cat.spent,
        x: index + 1
      }));
  }, [categorySpending]);

  if (!budget || transactions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>{getMonthName(selectedMonth)}</Text>
        </View>
        
        <View style={styles.emptyStateContainer}>
          <Ionicons name="analytics-outline" size={64} color="#6b6880" />
          <Text style={styles.emptyStateTitle}>No Data Available</Text>
          <Text style={styles.emptyStateDescription}>
            {!budget 
              ? 'Create a budget and add some transactions to see analytics'
              : 'Add some transactions to see your spending analytics'
            }
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>{getMonthName(selectedMonth)}</Text>
        </View>

        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          {(['7d', '30d', '90d'] as TimeRange[]).map((range) => (
            <TouchableOpacity
              key={range}
              onPress={() => setTimeRange(range)}
              style={[
                styles.timeRangeButton,
                timeRange === range && styles.timeRangeButtonActive
              ]}
            >
              <Text style={[
                styles.timeRangeText,
                timeRange === range && styles.timeRangeTextActive
              ]}>
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <Card style={styles.metricCard}>
            <CardContent>
              <Text style={styles.metricValue}>
                {formatCurrency(dashboardStats.totalSpent)}
              </Text>
              <Text style={styles.metricLabel}>Total Spent</Text>
            </CardContent>
          </Card>
          
          <Card style={styles.metricCard}>
            <CardContent>
              <Text style={styles.metricValue}>
                {dashboardStats.percentageUsed}%
              </Text>
              <Text style={styles.metricLabel}>Budget Used</Text>
            </CardContent>
          </Card>
          
          <Card style={styles.metricCard}>
            <CardContent>
              <Text style={styles.metricValue}>
                {categorySpending.filter(c => c.spent > 0).length}
              </Text>
              <Text style={styles.metricLabel}>Active Categories</Text>
            </CardContent>
          </Card>
          
          <Card style={styles.metricCard}>
            <CardContent>
              <Text style={styles.metricValue}>
                {transactions.length}
              </Text>
              <Text style={styles.metricLabel}>Transactions</Text>
            </CardContent>
          </Card>
        </View>

        {/* Spending Over Time */}
        <Card style={styles.chartCard}>
          <CardHeader>
            <Text style={styles.chartTitle}>Spending Trend</Text>
          </CardHeader>
          <CardContent>
            <VictoryChart
              theme={VictoryTheme.material}
              width={chartWidth}
              height={200}
              padding={{ left: 60, top: 20, right: 20, bottom: 40 }}
            >
              <VictoryAxis dependentAxis tickFormat={(t: number) => `$${t}`} />
              <VictoryAxis 
                tickFormat={(t: number) => spendingOverTime.daily[t]?.label || ''}
                tickCount={timeRange === '7d' ? 7 : 6}
              />
              <VictoryArea
                data={spendingOverTime.daily}
                style={{
                  data: { fill: '#ed7105', fillOpacity: 0.3, stroke: '#ed7105', strokeWidth: 2 }
                }}
              />
            </VictoryChart>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        {categoryChartData.length > 0 && (
          <Card style={styles.chartCard}>
            <CardHeader>
              <Text style={styles.chartTitle}>Spending by Category</Text>
            </CardHeader>
            <CardContent>
              <VictoryPie
                data={categoryChartData}
                width={chartWidth}
                height={250}
                innerRadius={60}
                padAngle={2}
                colorScale={categoryChartData.map(d => d.color)}
                labelComponent={
                  <VictoryLabel 
                    style={{ fontSize: 12, fill: '#3d3c4f' }}
                  />
                }
                labelRadius={100}
              />
              
              {/* Legend */}
              <View style={styles.chartLegend}>
                {categoryChartData.slice(0, 6).map((item, index) => (
                  <View key={index} style={styles.legendItem}>
                    <View 
                      style={[styles.legendColor, { backgroundColor: item.color }]} 
                    />
                    <Text style={styles.legendText}>{item.x}</Text>
                    <Text style={styles.legendAmount}>{formatCurrency(item.y)}</Text>
                  </View>
                ))}
              </View>
            </CardContent>
          </Card>
        )}

        {/* Budget vs Actual */}
        {budgetVsActualData.length > 0 && (
          <Card style={styles.chartCard}>
            <CardHeader>
              <Text style={styles.chartTitle}>Budget vs Actual</Text>
            </CardHeader>
            <CardContent>
              <VictoryChart
                theme={VictoryTheme.material}
                width={chartWidth}
                height={220}
                padding={{ left: 60, top: 20, right: 20, bottom: 60 }}
                domainPadding={20}
              >
                <VictoryAxis dependentAxis tickFormat={(t: number) => `$${t}`} />
                <VictoryAxis 
                  tickFormat={(x: number) => budgetVsActualData[x - 1]?.category || ''}
                  style={{
                    tickLabels: { fontSize: 10, angle: -45, textAnchor: 'end' }
                  }}
                />
                <VictoryBar
                  data={budgetVsActualData.map(d => ({ x: d.x, y: d.allocated }))}
                  style={{ data: { fill: '#e8e7e9' } }}
                />
                <VictoryBar
                  data={budgetVsActualData.map(d => ({ x: d.x, y: d.spent }))}
                  style={{ data: { fill: '#ed7105' } }}
                />
              </VictoryChart>
              
              {/* Legend */}
              <View style={styles.chartLegendHorizontal}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#e8e7e9' }]} />
                  <Text style={styles.legendText}>Allocated</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#ed7105' }]} />
                  <Text style={styles.legendText}>Spent</Text>
                </View>
              </View>
            </CardContent>
          </Card>
        )}

        {/* Top Spending Categories */}
        {topCategoriesData.length > 0 && (
          <Card style={styles.chartCard}>
            <CardHeader>
              <Text style={styles.chartTitle}>Top Spending Categories</Text>
            </CardHeader>
            <CardContent>
              <View style={styles.topCategoriesList}>
                {topCategoriesData.slice(0, 5).map((item, index) => (
                  <View key={index} style={styles.topCategoryItem}>
                    <View style={styles.topCategoryRank}>
                      <Text style={styles.topCategoryRankText}>{index + 1}</Text>
                    </View>
                    <View style={styles.topCategoryDetails}>
                      <View style={styles.topCategoryHeader}>
                        <View 
                          style={[styles.topCategoryColor, { backgroundColor: item.color }]} 
                        />
                        <Text style={styles.topCategoryName}>{item.full}</Text>
                      </View>
                      <Text style={styles.topCategoryAmount}>
                        {formatCurrency(item.y)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </CardContent>
          </Card>
        )}

        {/* Insights Card */}
        <Card style={StyleSheet.flatten([styles.chartCard, { marginBottom: 20 }])}>
          <CardHeader>
            <Text style={styles.chartTitle}>Insights</Text>
          </CardHeader>
          <CardContent>
            <View style={styles.insightsList}>
              {dashboardStats.percentageUsed > 100 && (
                <View style={styles.insightItem}>
                  <View style={styles.insightIcon}>
                    <Ionicons name="warning" size={16} color="#ea580c" />
                  </View>
                  <Text style={styles.insightText}>
                    You've exceeded your budget by {formatCurrency(dashboardStats.totalSpent - dashboardStats.totalBudget)}
                  </Text>
                </View>
              )}
              
              {categorySpending.filter(c => c.percentageUsed > 100).length > 0 && (
                <View style={styles.insightItem}>
                  <View style={styles.insightIcon}>
                    <Ionicons name="alert-circle" size={16} color="#f59e0b" />
                  </View>
                  <Text style={styles.insightText}>
                    {categorySpending.filter(c => c.percentageUsed > 100).length} categories are over budget
                  </Text>
                </View>
              )}
              
              {dashboardStats.percentageUsed < 50 && (
                <View style={styles.insightItem}>
                  <View style={styles.insightIcon}>
                    <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                  </View>
                  <Text style={styles.insightText}>
                    Great job! You're only using {dashboardStats.percentageUsed}% of your budget
                  </Text>
                </View>
              )}
              
              {categoryChartData.length > 0 && (
                <View style={styles.insightItem}>
                  <View style={styles.insightIcon}>
                    <Ionicons name="trending-up" size={16} color="#3b82f6" />
                  </View>
                  <Text style={styles.insightText}>
                    Your top spending category is {categoryChartData[0].x} ({categoryChartData[0].percentage.toFixed(0)}% of total)
                  </Text>
                </View>
              )}
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f7fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#3d3c4f',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b6880',
    marginTop: 4,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#e8e7e9',
    borderRadius: 8,
    padding: 4,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: '#ed7105',
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b6880',
  },
  timeRangeTextActive: {
    color: '#f8f7fa',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  metricCard: {
    width: '48%',
    marginRight: '2%',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3d3c4f',
    textAlign: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b6880',
    textAlign: 'center',
    marginTop: 4,
  },
  chartCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3d3c4f',
  },
  chartLegend: {
    marginTop: 16,
  },
  chartLegendHorizontal: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginRight: 16,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#3d3c4f',
    flex: 1,
  },
  legendAmount: {
    fontSize: 12,
    color: '#6b6880',
    fontWeight: '500',
  },
  topCategoriesList: {
    marginTop: 8,
  },
  topCategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  topCategoryRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ed7105',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  topCategoryRankText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f8f7fa',
  },
  topCategoryDetails: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  topCategoryColor: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  topCategoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3d3c4f',
    flex: 1,
  },
  topCategoryAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3d3c4f',
  },
  insightsList: {
    marginTop: 8,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  insightIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  insightText: {
    fontSize: 14,
    color: '#3d3c4f',
    flex: 1,
    lineHeight: 20,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3d3c4f',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 16,
    color: '#6b6880',
    textAlign: 'center',
    lineHeight: 24,
  },
});