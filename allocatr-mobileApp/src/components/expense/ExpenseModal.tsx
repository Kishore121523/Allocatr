// components/expense/ExpenseModal.tsx

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useAuth } from '../../providers/auth-provider';
import { useMonth } from '../../providers/month-provider';
import { useBudget } from '../../hooks/use-budget';
import { useTransactions } from '../../hooks/use-transactions';
import { useAICategorization } from '../../hooks/use-ai-categorization';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Picker } from '../ui/Picker';
import { Card, CardContent } from '../ui/Card';
import { formatCurrency, parseCurrencyInput, todayLocalYYYYMMDD, parseYYYYMMDDToLocalDate } from '../../lib/utils';
import { Transaction } from '../../types';

interface ExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
}

export function ExpenseModal({ visible, onClose, transaction }: ExpenseModalProps) {
  const { user } = useAuth();
  const { selectedMonth } = useMonth();
  const { budget } = useBudget(selectedMonth);
  const { addTransaction, updateTransaction } = useTransactions(selectedMonth);
  const { categorizeExpense, isLoading: aiLoading } = useAICategorization();
  
  // Form state
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(todayLocalYYYYMMDD());
  const [naturalInput, setNaturalInput] = useState('');
  const [isAICategorized, setIsAICategorized] = useState(false);
  const [loading, setLoading] = useState(false);

  // AI categorization state
  const [showAISuggestion, setShowAISuggestion] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);

  // Initialize form when editing transaction
  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount.toString());
      setDescription(transaction.description);
      setCategoryId(transaction.categoryId);
      setDate(format(transaction.date, 'yyyy-MM-dd'));
      setIsAICategorized(transaction.isAICategorized || false);
    } else {
      // Reset form for new transaction
      setAmount('');
      setDescription('');
      setCategoryId('');
      setDate(todayLocalYYYYMMDD());
      setNaturalInput('');
      setIsAICategorized(false);
      setShowAISuggestion(false);
      setAiSuggestion(null);
    }
  }, [transaction, visible]);

  const categoryOptions = budget?.categories.map(cat => ({
    label: cat.name,
    value: cat.id,
    color: cat.color
  })) || [];

  const handleAICategorization = async (input: string) => {
    if (!input.trim() || !budget || aiLoading) return;

    try {
      const result = await categorizeExpense(input, budget.categories);
      
      if (result) {
        setAiSuggestion(result);
        setShowAISuggestion(true);
      }
    } catch (error) {
      console.error('AI categorization failed:', error);
    }
  };

  const handleAcceptAISuggestion = () => {
    if (!aiSuggestion) return;

    setAmount(aiSuggestion.amount.toString());
    setDescription(aiSuggestion.description);
    
    // Find matching category
    const matchingCategory = budget?.categories.find(
      cat => cat.name.toLowerCase() === aiSuggestion.suggestedCategory.toLowerCase()
    );
    
    if (matchingCategory) {
      setCategoryId(matchingCategory.id);
    }
    
    if (aiSuggestion.date) {
      setDate(aiSuggestion.date);
    }
    
    setIsAICategorized(true);
    setShowAISuggestion(false);
    setNaturalInput('');
  };

  const handleRejectAISuggestion = () => {
    setShowAISuggestion(false);
    setAiSuggestion(null);
  };

  const validateForm = () => {
    const amountValue = parseCurrencyInput(amount);
    
    if (!amountValue || amountValue <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return false;
    }
    
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return false;
    }
    
    if (!categoryId) {
      Alert.alert('Error', 'Please select a category');
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const amountValue = parseCurrencyInput(amount);
      const expenseDate = parseYYYYMMDDToLocalDate(date);
      const categoryName = budget?.categories.find(cat => cat.id === categoryId)?.name || '';
      
      if (transaction) {
        // Update existing transaction
        await updateTransaction(transaction.id, {
          amount: amountValue,
          description: description.trim(),
          categoryId,
          categoryName,
          date: expenseDate,
          isAICategorized,
        });
        Alert.alert('Success', 'Transaction updated successfully!');
      } else {
        // Add new transaction
        await addTransaction(
          amountValue,
          description.trim(),
          categoryId,
          categoryName,
          expenseDate,
          isAICategorized
        );
        Alert.alert('Success', 'Expense added successfully!');
      }
      
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = budget?.categories.find(cat => cat.id === categoryId);

  return (
    <Modal visible={visible} onClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>
            {transaction ? 'Edit Transaction' : 'Add Expense'}
          </Text>
          
          {/* AI Natural Input (only for new transactions) */}
          {!transaction && (
            <View style={styles.aiSection}>
              <Text style={styles.sectionTitle}>Quick Add with AI</Text>
              <View style={styles.aiInputContainer}>
                <Input
                  value={naturalInput}
                  onChangeText={setNaturalInput}
                  placeholder="e.g., '$25 lunch at Subway today'"
                  className="flex-1"
                  multiline
                />
                <Button
                  onPress={() => handleAICategorization(naturalInput)}
                  loading={aiLoading}
                  disabled={!naturalInput.trim() || !budget}
                  className="ml-2"
                  style={styles.aiButton}
                >
                  <Ionicons name="sparkles" size={16} color="#f8f7fa" />
                </Button>
              </View>
              <Text style={styles.aiHint}>
                Describe your expense naturally and AI will help categorize it
              </Text>
            </View>
          )}

          {/* AI Suggestion Card */}
          {showAISuggestion && aiSuggestion && (
            <Card style={styles.suggestionCard}>
              <CardContent>
                <View style={styles.suggestionHeader}>
                  <View style={styles.suggestionTitleContainer}>
                    <Ionicons name="sparkles" size={16} color="#8b5cf6" />
                    <Text style={styles.suggestionTitle}>AI Suggestion</Text>
                  </View>
                  <Text style={styles.confidenceScore}>
                    {Math.round(aiSuggestion.confidence * 100)}% confident
                  </Text>
                </View>
                
                <View style={styles.suggestionDetails}>
                  <View style={styles.suggestionRow}>
                    <Text style={styles.suggestionLabel}>Amount:</Text>
                    <Text style={styles.suggestionValue}>{formatCurrency(aiSuggestion.amount)}</Text>
                  </View>
                  <View style={styles.suggestionRow}>
                    <Text style={styles.suggestionLabel}>Description:</Text>
                    <Text style={styles.suggestionValue}>{aiSuggestion.description}</Text>
                  </View>
                  <View style={styles.suggestionRow}>
                    <Text style={styles.suggestionLabel}>Category:</Text>
                    <Text style={styles.suggestionValue}>{aiSuggestion.suggestedCategory}</Text>
                  </View>
                  {aiSuggestion.date && (
                    <View style={styles.suggestionRow}>
                      <Text style={styles.suggestionLabel}>Date:</Text>
                      <Text style={styles.suggestionValue}>
                        {format(parseYYYYMMDDToLocalDate(aiSuggestion.date), 'MMM d, yyyy')}
                      </Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.suggestionActions}>
                  <Button
                    variant="outline"
                    onPress={handleRejectAISuggestion}
                    className="flex-1 mr-2"
                  >
                    Reject
                  </Button>
                  <Button
                    onPress={handleAcceptAISuggestion}
                    className="flex-1"
                  >
                    Accept
                  </Button>
                </View>
              </CardContent>
            </Card>
          )}

          {/* Manual Input Form */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Transaction Details</Text>
            
            <Input
              label="Amount"
              value={amount}
              onChangeText={setAmount}
              placeholder="$25.00"
              keyboardType="numeric"
              className="mb-4"
            />

            <Input
              label="Description"
              value={description}
              onChangeText={setDescription}
              placeholder="Lunch at Subway"
              className="mb-4"
            />

            <Picker
              label="Category"
              options={categoryOptions}
              value={categoryId}
              onSelect={setCategoryId}
              placeholder="Select category"
              className="mb-4"
            />

            <Input
              label="Date"
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              className="mb-4"
            />

            {isAICategorized && (
              <View style={styles.aiIndicator}>
                <Ionicons name="sparkles" size={16} color="#8b5cf6" />
                <Text style={styles.aiIndicatorText}>AI Categorized</Text>
              </View>
            )}
          </View>

          {/* Category Preview */}
          {selectedCategory && (
            <Card style={styles.categoryPreview}>
              <CardContent>
                <View style={styles.categoryPreviewContent}>
                  <View style={styles.categoryPreviewLeft}>
                    <View 
                      style={[
                        styles.categoryPreviewColor, 
                        { backgroundColor: selectedCategory.color }
                      ]} 
                    />
                    <Text style={styles.categoryPreviewName}>{selectedCategory.name}</Text>
                  </View>
                  <Text style={styles.categoryPreviewAmount}>
                    {formatCurrency(selectedCategory.allocatedAmount)} allocated
                  </Text>
                </View>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button
              variant="outline"
              onPress={onClose}
              className="flex-1 mr-2"
            >
              Cancel
            </Button>
            <Button
              onPress={handleSave}
              loading={loading}
              disabled={!amount || !description || !categoryId}
              className="flex-1"
            >
              {transaction ? 'Update' : 'Add Expense'}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#3d3c4f',
    marginBottom: 20,
    textAlign: 'center',
  },
  aiSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3d3c4f',
    marginBottom: 12,
  },
  aiInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  aiButton: {
    paddingHorizontal: 12,
    minWidth: 48,
  },
  aiHint: {
    fontSize: 12,
    color: '#6b6880',
    marginTop: 8,
    fontStyle: 'italic',
  },
  suggestionCard: {
    marginBottom: 20,
    borderColor: '#8b5cf6',
    borderWidth: 1,
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  suggestionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8b5cf6',
    marginLeft: 8,
  },
  confidenceScore: {
    fontSize: 12,
    color: '#6b6880',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  suggestionDetails: {
    marginBottom: 16,
  },
  suggestionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  suggestionLabel: {
    fontSize: 14,
    color: '#6b6880',
    fontWeight: '500',
  },
  suggestionValue: {
    fontSize: 14,
    color: '#3d3c4f',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  suggestionActions: {
    flexDirection: 'row',
  },
  formSection: {
    marginBottom: 20,
  },
  aiIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    padding: 8,
    borderRadius: 6,
  },
  aiIndicatorText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#8b5cf6',
    fontWeight: '500',
  },
  categoryPreview: {
    marginBottom: 20,
  },
  categoryPreviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryPreviewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryPreviewColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryPreviewName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3d3c4f',
  },
  categoryPreviewAmount: {
    fontSize: 14,
    color: '#6b6880',
  },
  actions: {
    flexDirection: 'row',
    paddingTop: 20,
    paddingBottom: 40,
  },
});
