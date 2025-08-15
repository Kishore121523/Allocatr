// screens/BudgetScreen.tsx

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../providers/auth-provider';
import { useMonth } from '../providers/month-provider';
import { useBudget } from '../hooks/use-budget';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Picker } from '../components/ui/Picker';
import { formatCurrency, getMonthName, parseCurrencyInput } from '../lib/utils';
import { BudgetCategory, DEFAULT_CATEGORIES } from '../types';
import { calculateBudgetFlexibility } from '../lib/budget-calculations';

export default function BudgetScreen() {
  const { user } = useAuth();
  const { selectedMonth } = useMonth();
  const { budget, loading, createBudget, updateBudget } = useBudget(selectedMonth);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<BudgetCategory[]>([]);
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newCategoryAmount, setNewCategoryAmount] = useState('');

  // Initialize form when budget exists
  useEffect(() => {
    if (budget) {
      setMonthlyIncome(budget.monthlyIncome.toString());
      setSelectedCategories(budget.categories);
    }
  }, [budget]);

  const availableCategories = DEFAULT_CATEGORIES.filter(
    defaultCat => !selectedCategories.some(selected => selected.name === defaultCat.name)
  ).map(cat => ({
    label: cat.name,
    value: cat.name,
    color: cat.color
  }));

  const totalAllocated = selectedCategories.reduce((sum, cat) => sum + cat.allocatedAmount, 0);
  const incomeValue = parseCurrencyInput(monthlyIncome);
  const { unallocatedAmount, flexibilityPercentage, hasUnallocatedFunds } = 
    calculateBudgetFlexibility(incomeValue, totalAllocated);

  const handleCreateBudget = async () => {
    if (!incomeValue || incomeValue <= 0) {
      Alert.alert('Error', 'Please enter a valid monthly income');
      return;
    }

    if (selectedCategories.length === 0) {
      Alert.alert('Error', 'Please add at least one category');
      return;
    }

    try {
      await createBudget(incomeValue, selectedCategories);
      setIsCreateModalOpen(false);
      Alert.alert('Success', 'Budget created successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create budget. Please try again.');
    }
  };

  const handleUpdateBudget = async () => {
    if (!budget || !incomeValue || incomeValue <= 0) {
      Alert.alert('Error', 'Please enter a valid monthly income');
      return;
    }

    try {
      await updateBudget({
        monthlyIncome: incomeValue,
        categories: selectedCategories,
      });
      Alert.alert('Success', 'Budget updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update budget. Please try again.');
    }
  };

  const handleAddCategory = () => {
    if (!newCategoryId || !newCategoryAmount) {
      Alert.alert('Error', 'Please select a category and enter an amount');
      return;
    }

    const amount = parseCurrencyInput(newCategoryAmount);
    if (amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const defaultCategory = DEFAULT_CATEGORIES.find(cat => cat.name === newCategoryId);
    if (!defaultCategory) return;

    const newCategory: BudgetCategory = {
      id: `${Date.now()}`,
      name: defaultCategory.name,
      allocatedAmount: amount,
      color: defaultCategory.color,
      icon: defaultCategory.icon,
    };

    setSelectedCategories([...selectedCategories, newCategory]);
    setNewCategoryId('');
    setNewCategoryAmount('');
    setIsAddCategoryModalOpen(false);
  };

  const handleRemoveCategory = (categoryId: string) => {
    Alert.alert(
      'Remove Category',
      'Are you sure you want to remove this category?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setSelectedCategories(selectedCategories.filter(cat => cat.id !== categoryId));
          }
        }
      ]
    );
  };

  const handleUpdateCategoryAmount = (categoryId: string, newAmount: string) => {
    const amount = parseCurrencyInput(newAmount);
    setSelectedCategories(selectedCategories.map(cat => 
      cat.id === categoryId 
        ? { ...cat, allocatedAmount: amount }
        : cat
    ));
  };

  if (!budget && !isCreateModalOpen) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Budget</Text>
          <Text style={styles.subtitle}>{getMonthName(selectedMonth)}</Text>
        </View>
        
        <View style={styles.emptyStateContainer}>
          <Card style={styles.emptyStateCard}>
            <CardContent>
              <View style={styles.emptyStateIcon}>
                <Ionicons name="calculator-outline" size={48} color="#ed7105" />
              </View>
              <Text style={styles.emptyStateTitle}>No Budget Set</Text>
              <Text style={styles.emptyStateDescription}>
                Create your budget for {getMonthName(selectedMonth)} using zero-based budgeting principles.
              </Text>
              <Button 
                className="mt-4"
                onPress={() => setIsCreateModalOpen(true)}
              >
                Create Budget
              </Button>
            </CardContent>
          </Card>
        </View>

        {/* Create Budget Modal */}
        <Modal visible={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalTitle}>Create Budget</Text>
              <Text style={styles.modalSubtitle}>
                Set up your budget for {getMonthName(selectedMonth)}
              </Text>

              <Input
                label="Monthly Income"
                value={monthlyIncome}
                onChangeText={setMonthlyIncome}
                placeholder="$5,000"
                keyboardType="numeric"
                className="mb-4"
              />

              <View style={styles.categoriesSection}>
                <View style={styles.categoriesHeader}>
                  <Text style={styles.categoriesTitle}>Categories</Text>
                  <TouchableOpacity 
                    onPress={() => setIsAddCategoryModalOpen(true)}
                    style={styles.addCategoryButton}
                  >
                    <Ionicons name="add" size={20} color="#ed7105" />
                  </TouchableOpacity>
                </View>

                {selectedCategories.map((category) => (
                  <Card key={category.id} style={styles.categoryCard}>
                    <CardContent>
                      <View style={styles.categoryItem}>
                        <View style={styles.categoryInfo}>
                          <View 
                            style={[styles.categoryColor, { backgroundColor: category.color }]}
                          />
                          <Text style={styles.categoryName}>{category.name}</Text>
                        </View>
                        <View style={styles.categoryActions}>
                          <Input
                            value={category.allocatedAmount.toString()}
                            onChangeText={(text) => handleUpdateCategoryAmount(category.id, text)}
                            placeholder="$0"
                            keyboardType="numeric"
                            style={styles.categoryAmountInput}
                          />
                          <TouchableOpacity 
                            onPress={() => handleRemoveCategory(category.id)}
                            style={styles.removeButton}
                          >
                            <Ionicons name="trash-outline" size={20} color="#dc2626" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </CardContent>
                  </Card>
                ))}
              </View>

              <Card style={styles.summaryCard}>
                <CardContent>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Monthly Income:</Text>
                    <Text style={styles.summaryValue}>{formatCurrency(incomeValue)}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Allocated:</Text>
                    <Text style={styles.summaryValue}>{formatCurrency(totalAllocated)}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Unallocated:</Text>
                    <Text style={[
                      styles.summaryValue,
                      { color: hasUnallocatedFunds ? '#6b6880' : '#dc2626' }
                    ]}>
                      {formatCurrency(unallocatedAmount)}
                    </Text>
                  </View>
                </CardContent>
              </Card>

              <Button 
                onPress={handleCreateBudget}
                className="mt-6 mb-4"
                disabled={!incomeValue || selectedCategories.length === 0}
              >
                Create Budget
              </Button>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>

        {/* Add Category Modal */}
        <Modal visible={isAddCategoryModalOpen} onClose={() => setIsAddCategoryModalOpen(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Category</Text>
            
            <Picker
              label="Category"
              options={availableCategories}
              value={newCategoryId}
              onSelect={setNewCategoryId}
              placeholder="Select category"
              className="mb-4"
            />

            <Input
              label="Allocated Amount"
              value={newCategoryAmount}
              onChangeText={setNewCategoryAmount}
              placeholder="$500"
              keyboardType="numeric"
              className="mb-6"
            />

            <Button onPress={handleAddCategory}>
              Add Category
            </Button>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Budget</Text>
          <Text style={styles.subtitle}>{getMonthName(selectedMonth)}</Text>
        </View>

        {/* Budget Summary */}
        <Card style={styles.summaryCard}>
          <CardHeader>
            <Text style={styles.summaryTitle}>Budget Summary</Text>
          </CardHeader>
          <CardContent>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Monthly Income:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(incomeValue)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Allocated:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totalAllocated)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Unallocated:</Text>
              <Text style={[
                styles.summaryValue,
                { color: hasUnallocatedFunds ? '#16a34a' : '#dc2626' }
              ]}>
                {formatCurrency(unallocatedAmount)}
              </Text>
            </View>
            {hasUnallocatedFunds && (
              <View style={styles.flexibilityInfo}>
                <Text style={styles.flexibilityText}>
                  {flexibilityPercentage.toFixed(1)}% flexibility buffer
                </Text>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Income Section */}
        <Card style={styles.incomeCard}>
          <CardHeader>
            <Text style={styles.sectionTitle}>Monthly Income</Text>
          </CardHeader>
          <CardContent>
            <Input
              value={monthlyIncome}
              onChangeText={setMonthlyIncome}
              placeholder="$5,000"
              keyboardType="numeric"
            />
          </CardContent>
        </Card>

        {/* Categories Section */}
        <View style={styles.categoriesSection}>
          <View style={styles.categoriesHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity 
              onPress={() => setIsAddCategoryModalOpen(true)}
              style={styles.addCategoryButton}
            >
              <Ionicons name="add" size={20} color="#ed7105" />
              <Text style={styles.addCategoryText}>Add</Text>
            </TouchableOpacity>
          </View>

          {selectedCategories.map((category) => (
            <Card key={category.id} style={styles.categoryCard}>
              <CardContent>
                <View style={styles.categoryItem}>
                  <View style={styles.categoryInfo}>
                    <View 
                      style={[styles.categoryColor, { backgroundColor: category.color }]}
                    />
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </View>
                  <View style={styles.categoryActions}>
                    <Input
                      value={category.allocatedAmount.toString()}
                      onChangeText={(text) => handleUpdateCategoryAmount(category.id, text)}
                      placeholder="$0"
                      keyboardType="numeric"
                      className="flex-1 mr-2"
                    />
                    <TouchableOpacity 
                      onPress={() => handleRemoveCategory(category.id)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="trash-outline" size={20} color="#dc2626" />
                    </TouchableOpacity>
                  </View>
                </View>
              </CardContent>
            </Card>
          ))}
        </View>

        <Button 
          onPress={handleUpdateBudget}
          className="mx-4 mb-6"
          disabled={!incomeValue || selectedCategories.length === 0}
        >
          Save Changes
        </Button>
      </ScrollView>

      {/* Add Category Modal */}
      <Modal visible={isAddCategoryModalOpen} onClose={() => setIsAddCategoryModalOpen(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Category</Text>
          
          <Picker
            label="Category"
            options={availableCategories}
            value={newCategoryId}
            onSelect={setNewCategoryId}
            placeholder="Select category"
            className="mb-4"
          />

          <Input
            label="Allocated Amount"
            value={newCategoryAmount}
            onChangeText={setNewCategoryAmount}
            placeholder="$500"
            keyboardType="numeric"
            className="mb-6"
          />

          <Button onPress={handleAddCategory}>
            Add Category
          </Button>
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
    fontSize: 20,
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
  modalContainer: {
    flex: 1,
  },
  modalContent: {
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3d3c4f',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6b6880',
    marginBottom: 20,
  },
  summaryCard: {
    margin: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3d3c4f',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b6880',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3d3c4f',
  },
  flexibilityInfo: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f0fdf4',
    borderRadius: 6,
  },
  flexibilityText: {
    fontSize: 12,
    color: '#16a34a',
    textAlign: 'center',
  },
  incomeCard: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3d3c4f',
  },
  categoriesSection: {
    margin: 16,
  },
  categoriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoriesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3d3c4f',
  },
  addCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  addCategoryText: {
    marginLeft: 4,
    color: '#ed7105',
    fontWeight: '500',
  },
  categoryCard: {
    marginBottom: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3d3c4f',
    flex: 1,
  },
  categoryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryAmountInput: {
    flex: 1,
    marginRight: 8,
  },
  removeButton: {
    padding: 8,
  },
});