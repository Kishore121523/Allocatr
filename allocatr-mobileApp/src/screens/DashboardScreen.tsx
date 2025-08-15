// screens/DashboardScreen.tsx

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../providers/auth-provider';
import { useMonth } from '../providers/month-provider';
import { useBudget } from '../hooks/use-budget';
import { useTransactions, useCategorySpending } from '../hooks/use-transactions';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Progress } from '../components/ui/Progress';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { formatCurrency, getMonthName } from '../lib/utils';
import { getDailyBudgetRemaining, getRemainingDaysInMonth } from '../lib/budget-calculations';
import { ExpenseModal } from '../components/expense/ExpenseModal';

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const { selectedMonth } = useMonth();
  const { budget, loading: budgetLoading } = useBudget(selectedMonth);
  const { transactions, loading: transactionsLoading } = useTransactions(selectedMonth);
  const { categorySpending, dashboardStats } = useCategorySpending(transactions, budget);
  
  const [refreshing, setRefreshing] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Refresh logic here - data will automatically refresh due to Firestore listeners
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const dailyBudget = getDailyBudgetRemaining(dashboardStats.remainingBudget);
  const daysRemaining = getRemainingDaysInMonth();

  if (!budget && !budgetLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back!</Text>
            <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
          </View>
          <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
            <Ionicons name="log-out-outline" size={24} color="#6b6880" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.emptyStateContainer}>
          <Card style={styles.emptyStateCard}>
            <CardContent>
              <View style={styles.emptyStateIcon}>
                <Ionicons name="calculator-outline" size={48} color="#ed7105" />
              </View>
              <Text style={styles.emptyStateTitle}>Welcome to Allocatr!</Text>
              <Text style={styles.emptyStateDescription}>
                Let's set up your first budget using zero-based budgeting principles.
                Every dollar will be assigned a purpose.
              </Text>
              <Button className="mt-4">
                Create Your Budget
              </Button>
            </CardContent>
          </Card>
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
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back!</Text>
            <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
          </View>
          <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
            <Ionicons name="log-out-outline" size={24} color="#6b6880" />
          </TouchableOpacity>
        </View>

        {/* Month Selector */}
        <View style={styles.monthSelector}>
          <Text style={styles.monthText}>{getMonthName(selectedMonth)}</Text>
        </View>

        {/* Budget Overview */}
        <Card style={styles.budgetCard}>
          <CardHeader>
            <View style={styles.budgetHeader}>
              <Text style={styles.budgetTitle}>Monthly Budget</Text>
              <Badge 
                variant={dashboardStats.percentageUsed > 100 ? 'destructive' : 'default'}
              >
                {dashboardStats.percentageUsed}% Used
              </Badge>
            </View>
          </CardHeader>
          <CardContent>
            <View style={styles.budgetProgress}>
              <View style={styles.budgetStats}>
                <Text style={styles.spentLabel}>Spent</Text>
                <Text style={styles.spentAmount}>
                  {formatCurrency(dashboardStats.totalSpent)}
                </Text>
              </View>
              <Progress 
                value={Math.min(dashboardStats.percentageUsed, 100)} 
                color={dashboardStats.percentageUsed > 100 ? '#dc2626' : '#ed7105'}
                height={12}
                style={{ marginVertical: 8 }}
              />
              <View style={styles.budgetStats}>
                <Text style={styles.totalLabel}>Total Budget</Text>
                <Text style={styles.totalAmount}>
                  {formatCurrency(dashboardStats.totalBudget)}
                </Text>
              </View>
            </View>

            {dashboardStats.categoriesOverBudget > 0 && (
              <View style={styles.warningContainer}>
                <Ionicons name="warning" size={16} color="#ea580c" />
                <Text style={styles.warningText}>
                  {dashboardStats.categoriesOverBudget} categories over budget
                </Text>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <CardContent>
              <View style={styles.statHeader}>
                <Ionicons name="wallet" size={20} color="#10b981" />
                <Text style={styles.statValue}>
                  {formatCurrency(dashboardStats.remainingBudget)}
                </Text>
              </View>
              <Text style={styles.statLabel}>Remaining</Text>
            </CardContent>
          </Card>

          <Card style={styles.statCard}>
            <CardContent>
              <View style={styles.statHeader}>
                <Ionicons name="calendar" size={20} color="#3b82f6" />
                <Text style={styles.statValue}>
                  {formatCurrency(dailyBudget)}
                </Text>
              </View>
              <Text style={styles.statLabel}>Daily Budget</Text>
            </CardContent>
          </Card>

          <Card style={styles.statCard}>
            <CardContent>
              <View style={styles.statHeader}>
                <Ionicons name="receipt" size={20} color="#8b5cf6" />
                <Text style={styles.statValue}>
                  {dashboardStats.transactionCount}
                </Text>
              </View>
              <Text style={styles.statLabel}>Transactions</Text>
            </CardContent>
          </Card>

          <Card style={styles.statCard}>
            <CardContent>
              <View style={styles.statHeader}>
                <Ionicons name="time" size={20} color="#f59e0b" />
                <Text style={styles.statValue}>
                  {daysRemaining}
                </Text>
              </View>
              <Text style={styles.statLabel}>Days Left</Text>
            </CardContent>
          </Card>
        </View>

        {/* Category Cards */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Categories</Text>
          {categorySpending.slice(0, 6).map((category) => (
            <Card key={category.categoryId} style={styles.categoryCard}>
              <CardContent>
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryInfo}>
                    <View 
                      style={[
                        styles.categoryColor, 
                        { backgroundColor: category.color }
                      ]} 
                    />
                    <Text style={styles.categoryName}>{category.categoryName}</Text>
                  </View>
                  <Badge 
                    variant={category.percentageUsed > 100 ? 'destructive' : 'secondary'}
                  >
                    {category.percentageUsed}%
                  </Badge>
                </View>
                
                <Progress 
                  value={Math.min(category.percentageUsed, 100)}
                  color={category.percentageUsed > 100 ? '#dc2626' : category.color}
                  height={8}
                  style={{ marginVertical: 8 }}
                />
                
                <View style={styles.categoryStats}>
                  <Text style={styles.categorySpent}>
                    {formatCurrency(category.spent)} spent
                  </Text>
                  <Text style={styles.categoryAllocated}>
                    of {formatCurrency(category.allocated)}
                  </Text>
                </View>
              </CardContent>
            </Card>
          ))}
        </View>

        {/* Quick Add Button */}
        <View style={styles.quickAddContainer}>
          <Button 
            className="w-full" 
            size="lg"
            onPress={() => setIsExpenseModalOpen(true)}
          >
            <View style={styles.quickAddContent}>
              <Ionicons name="add" size={24} color="#f8f7fa" />
              <Text style={styles.quickAddText}>Add Expense</Text>
            </View>
          </Button>
        </View>
      </ScrollView>

      {/* Expense Modal */}
      <ExpenseModal
        visible={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
      />
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
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  greeting: {
    fontSize: 16,
    color: '#6b6880',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#3d3c4f',
  },
  signOutButton: {
    padding: 8,
  },
  monthSelector: {
    alignItems: 'center',
    marginBottom: 20,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#3d3c4f',
  },
  budgetCard: {
    marginBottom: 16,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3d3c4f',
  },
  budgetProgress: {
    marginTop: 8,
  },
  budgetStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  spentLabel: {
    fontSize: 14,
    color: '#6b6880',
  },
  spentAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3d3c4f',
  },
  totalLabel: {
    fontSize: 14,
    color: '#6b6880',
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3d3c4f',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 8,
    borderRadius: 6,
    marginTop: 12,
  },
  warningText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#ea580c',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    marginBottom: 8,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3d3c4f',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b6880',
  },
  categoriesSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3d3c4f',
    marginBottom: 12,
  },
  categoryCard: {
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryColor: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3d3c4f',
  },
  categoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categorySpent: {
    fontSize: 14,
    color: '#3d3c4f',
  },
  categoryAllocated: {
    fontSize: 14,
    color: '#6b6880',
  },
  quickAddContainer: {
    paddingVertical: 20,
  },
  quickAddContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickAddText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#f8f7fa',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyStateCard: {
    width: '100%',
    maxWidth: 400,
  },
  emptyStateIcon: {
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#3d3c4f',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 16,
    color: '#6b6880',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
});
