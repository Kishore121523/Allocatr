// screens/TransactionsScreen.tsx

import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, isToday, isYesterday, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { useAuth } from '../providers/auth-provider';
import { useMonth } from '../providers/month-provider';
import { useBudget } from '../hooks/use-budget';
import { useTransactions } from '../hooks/use-transactions';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Picker } from '../components/ui/Picker';
import { Modal } from '../components/ui/Modal';
import { formatCurrency, getMonthName, truncateText } from '../lib/utils';
import { Transaction } from '../types';

type FilterPeriod = 'all' | 'today' | 'week' | 'month';
type SortBy = 'date' | 'amount' | 'category';

export default function TransactionsScreen() {
  const { user } = useAuth();
  const { selectedMonth } = useMonth();
  const { budget } = useBudget(selectedMonth);
  const { transactions, loading, deleteTransaction } = useTransactions(selectedMonth);
  
  const [searchText, setSearchText] = useState('');
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortAscending, setSortAscending] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // Filter and sort transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = [...transactions];
    
    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(transaction => 
        transaction.description.toLowerCase().includes(searchText.toLowerCase()) ||
        transaction.categoryName?.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    // Filter by period
    if (filterPeriod !== 'all') {
      const now = new Date();
      filtered = filtered.filter(transaction => {
        const transactionDate = transaction.date;
        switch (filterPeriod) {
          case 'today':
            return isToday(transactionDate);
          case 'week':
            return transactionDate >= startOfWeek(now) && transactionDate <= endOfWeek(now);
          case 'month':
            return transactionDate >= startOfMonth(now) && transactionDate <= endOfMonth(now);
          default:
            return true;
        }
      });
    }
    
    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(transaction => transaction.categoryId === filterCategory);
    }
    
    // Sort transactions
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = a.date.getTime() - b.date.getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'category':
          comparison = (a.categoryName || '').localeCompare(b.categoryName || '');
          break;
      }
      return sortAscending ? comparison : -comparison;
    });
    
    return filtered;
  }, [transactions, searchText, filterPeriod, filterCategory, sortBy, sortAscending]);

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: Transaction[] } = {};
    
    filteredAndSortedTransactions.forEach(transaction => {
      const dateKey = format(transaction.date, 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(transaction);
    });
    
    return Object.entries(groups).map(([date, transactions]) => ({
      date,
      transactions,
      total: transactions.reduce((sum, t) => sum + t.amount, 0)
    })).sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredAndSortedTransactions]);

  const categoryOptions = [
    { label: 'All Categories', value: 'all' },
    ...(budget?.categories || []).map(cat => ({
      label: cat.name,
      value: cat.id,
      color: cat.color
    }))
  ];

  const periodOptions = [
    { label: 'All Time', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
  ];

  const sortOptions = [
    { label: 'Date', value: 'date' },
    { label: 'Amount', value: 'amount' },
    { label: 'Category', value: 'category' },
  ];

  const handleDeleteTransaction = (transaction: Transaction) => {
    Alert.alert(
      'Delete Transaction',
      `Are you sure you want to delete "${transaction.description}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTransaction(transaction.id);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete transaction. Please try again.');
            }
          }
        }
      ]
    );
  };

  const formatTransactionDate = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d, yyyy');
  };

  const getCategoryColor = (categoryId: string) => {
    return budget?.categories.find(cat => cat.id === categoryId)?.color || '#6b6880';
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <Card style={styles.transactionCard}>
      <CardContent>
        <TouchableOpacity
          onLongPress={() => handleDeleteTransaction(item)}
          style={styles.transactionItem}
        >
          <View style={styles.transactionLeft}>
            <View 
              style={[
                styles.categoryIndicator, 
                { backgroundColor: getCategoryColor(item.categoryId) }
              ]} 
            />
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionDescription}>
                {truncateText(item.description, 30)}
              </Text>
              <View style={styles.transactionMeta}>
                <Text style={styles.transactionCategory}>
                  {item.categoryName}
                </Text>
                {item.isAICategorized && (
                  <View style={styles.aiBadge}>
                    <Ionicons name="sparkles" size={12} color="#8b5cf6" />
                    <Text style={styles.aiText}>AI</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          <View style={styles.transactionRight}>
            <Text style={styles.transactionAmount}>
              {formatCurrency(item.amount)}
            </Text>
            <Text style={styles.transactionTime}>
              {format(item.date, 'h:mm a')}
            </Text>
          </View>
        </TouchableOpacity>
      </CardContent>
    </Card>
  );

  const renderDateGroup = ({ item }: { item: { date: string; transactions: Transaction[]; total: number } }) => (
    <View style={styles.dateGroup}>
      <View style={styles.dateHeader}>
        <Text style={styles.dateTitle}>
          {formatTransactionDate(new Date(item.date))}
        </Text>
        <Text style={styles.dateTotal}>
          {formatCurrency(item.total)}
        </Text>
      </View>
      {item.transactions.map((transaction) => (
        <View key={transaction.id}>
          {renderTransactionItem({ item: transaction })}
        </View>
      ))}
    </View>
  );

  const totalAmount = filteredAndSortedTransactions.reduce((sum, t) => sum + t.amount, 0);
  const activeFiltersCount = [
    searchText ? 1 : 0,
    filterPeriod !== 'all' ? 1 : 0,
    filterCategory !== 'all' ? 1 : 0
  ].reduce((sum, count) => sum + count, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
        <Text style={styles.subtitle}>{getMonthName(selectedMonth)}</Text>
      </View>

      {/* Search and Filter Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Input
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search transactions..."
            className="flex-1"
          />
          <TouchableOpacity 
            onPress={() => setIsFilterModalOpen(true)}
            style={styles.filterButton}
          >
            <Ionicons name="options" size={20} color="#ed7105" />
            {activeFiltersCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary */}
      <Card style={styles.summaryCard}>
        <CardContent>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {filteredAndSortedTransactions.length} transactions
            </Text>
            <Text style={styles.summaryAmount}>
              {formatCurrency(totalAmount)}
            </Text>
          </View>
          {activeFiltersCount > 0 && (
            <TouchableOpacity 
              onPress={() => {
                setSearchText('');
                setFilterPeriod('all');
                setFilterCategory('all');
              }}
              style={styles.clearFiltersButton}
            >
              <Text style={styles.clearFiltersText}>Clear all filters</Text>
            </TouchableOpacity>
          )}
        </CardContent>
      </Card>

      {/* Transactions List */}
      {groupedTransactions.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="receipt-outline" size={48} color="#6b6880" />
          <Text style={styles.emptyStateTitle}>
            {activeFiltersCount > 0 ? 'No matching transactions' : 'No transactions yet'}
          </Text>
          <Text style={styles.emptyStateDescription}>
            {activeFiltersCount > 0 
              ? 'Try adjusting your filters or search terms'
              : 'Start adding expenses to track your spending'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={groupedTransactions}
          keyExtractor={(item) => item.date}
          renderItem={renderDateGroup}
          style={styles.transactionsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Filter Modal */}
      <Modal visible={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filter & Sort</Text>
          
          <Picker
            label="Time Period"
            options={periodOptions}
            value={filterPeriod}
            onSelect={(value) => setFilterPeriod(value as FilterPeriod)}
            className="mb-4"
          />

          <Picker
            label="Category"
            options={categoryOptions}
            value={filterCategory}
            onSelect={setFilterCategory}
            className="mb-4"
          />

          <Picker
            label="Sort By"
            options={sortOptions}
            value={sortBy}
            onSelect={(value) => setSortBy(value as SortBy)}
            className="mb-4"
          />

          <TouchableOpacity 
            onPress={() => setSortAscending(!sortAscending)}
            style={styles.sortOrderButton}
          >
            <Text style={styles.sortOrderLabel}>Sort Order:</Text>
            <View style={styles.sortOrderValue}>
              <Text style={styles.sortOrderText}>
                {sortAscending ? 'Ascending' : 'Descending'}
              </Text>
              <Ionicons 
                name={sortAscending ? 'arrow-up' : 'arrow-down'} 
                size={16} 
                color="#ed7105" 
              />
            </View>
          </TouchableOpacity>

          <View style={styles.modalActions}>
            <Button 
              variant="outline" 
              onPress={() => {
                setSearchText('');
                setFilterPeriod('all');
                setFilterCategory('all');
                setSortBy('date');
                setSortAscending(false);
              }}
              className="flex-1 mr-2"
            >
              Reset
            </Button>
            <Button 
              onPress={() => setIsFilterModalOpen(false)}
              className="flex-1"
            >
              Apply
            </Button>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f7fa',
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
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    marginLeft: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d6d3d1',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ed7105',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b6880',
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3d3c4f',
  },
  clearFiltersButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#ed7105',
    textDecorationLine: 'underline',
  },
  transactionsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  dateGroup: {
    marginBottom: 16,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  dateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3d3c4f',
  },
  dateTotal: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b6880',
  },
  transactionCard: {
    marginBottom: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIndicator: {
    width: 4,
    height: 32,
    borderRadius: 2,
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3d3c4f',
    marginBottom: 2,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionCategory: {
    fontSize: 12,
    color: '#6b6880',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 4,
  },
  aiText: {
    fontSize: 10,
    color: '#8b5cf6',
    marginLeft: 2,
    fontWeight: '500',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3d3c4f',
    marginBottom: 2,
  },
  transactionTime: {
    fontSize: 12,
    color: '#6b6880',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3d3c4f',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#6b6880',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalContent: {
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3d3c4f',
    marginBottom: 20,
  },
  sortOrderButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#d6d3d1',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    marginBottom: 20,
  },
  sortOrderLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3d3c4f',
  },
  sortOrderValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortOrderText: {
    fontSize: 14,
    color: '#ed7105',
    marginRight: 4,
  },
  modalActions: {
    flexDirection: 'row',
  },
});