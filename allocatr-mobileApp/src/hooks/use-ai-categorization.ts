// hooks/use-ai-categorization.ts

import { useState } from 'react';
import { AICategorizationResult, BudgetCategory } from '../types';
import Constants from 'expo-constants';

export function useAICategorization() {
  const [isLoading, setIsLoading] = useState(false);

  const categorizeExpense = async (
    input: string,
    categories: BudgetCategory[]
  ): Promise<AICategorizationResult | null> => {
    if (!input.trim()) return null;

    setIsLoading(true);

    try {
      // Get the API URL from the web app configuration
      const apiUrl = Constants.expoConfig?.extra?.webAppApiUrl || 'http://localhost:3000';
      
      // Call the API route that will handle Azure OpenAI
      const response = await fetch(`${apiUrl}/api/categorize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input,
          categories: categories.map(c => c.name),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to categorize expense');
      }

      const result: AICategorizationResult = await response.json();
      
      // If API didn't include a date, attempt a lightweight client parse
      if (!result.date) {
        const parsed = tryParseDateFromText(input);
        if (parsed) result.date = parsed;
      }
      
      return result;
    } catch (error: any) {
      console.error('AI categorization error:', error);
      
      // Fallback to manual parsing for basic scenarios
      return parseBasicExpense(input, categories);
    } finally {
      setIsLoading(false);
    }
  };

  // Lightweight date parser (kept for client-side date enhancement)
  function tryParseDateFromText(text: string): string | null {
    const lower = text.toLowerCase();
    const today = new Date();

    const setAndReturn = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${dd}`;
    };

    // Today/Yesterday/Tomorrow
    if (/(today)/i.test(text)) return setAndReturn(today);
    if (/(yesterday)/i.test(text)) {
      const d = new Date(today);
      d.setDate(d.getDate() - 1);
      return setAndReturn(d);
    }
    if (/(tomorrow)/i.test(text)) {
      const d = new Date(today);
      d.setDate(d.getDate() + 1);
      return setAndReturn(d);
    }

    // Days of the week
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for (let i = 0; i < days.length; i++) {
      if (lower.includes(days[i])) {
        const targetDay = i;
        const currentDay = today.getDay();
        const diff = targetDay - currentDay;
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + diff);
        return setAndReturn(targetDate);
      }
    }

    return null;
  }

  // Basic expense parsing fallback
  function parseBasicExpense(
    input: string,
    categories: BudgetCategory[]
  ): AICategorizationResult | null {
    // Extract amount using regex
    const amountMatch = input.match(/\$?(\d+(?:\.\d{2})?)/);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;

    if (amount === 0) return null;

    // Simple keyword matching for categories
    const lowerInput = input.toLowerCase();
    let suggestedCategory = 'Other';
    let confidence = 0.3;

    // Basic category matching
    const categoryKeywords: { [key: string]: string[] } = {
      'Food & Dining': ['food', 'restaurant', 'lunch', 'dinner', 'eating', 'meal'],
      'Groceries': ['grocery', 'groceries', 'supermarket', 'walmart', 'target'],
      'Transportation': ['gas', 'fuel', 'uber', 'lyft', 'taxi', 'bus', 'train'],
      'Shopping': ['shopping', 'store', 'amazon', 'purchase', 'buy'],
      'Entertainment': ['movie', 'netflix', 'spotify', 'game', 'entertainment'],
      'Utilities': ['electric', 'water', 'internet', 'phone', 'utility'],
      'Healthcare': ['doctor', 'medicine', 'hospital', 'pharmacy', 'health'],
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (categories.some(c => c.name === category)) {
        for (const keyword of keywords) {
          if (lowerInput.includes(keyword)) {
            suggestedCategory = category;
            confidence = 0.7;
            break;
          }
        }
        if (confidence > 0.5) break;
      }
    }

    // Create a basic description
    let description = input.replace(/\$?\d+(?:\.\d{2})?/, '').trim();
    if (!description) {
      description = `${suggestedCategory} expense`;
    }

    return {
      amount,
      description,
      suggestedCategory,
      confidence,
      date: tryParseDateFromText(input) || new Date().toISOString().split('T')[0],
    };
  }

  return {
    categorizeExpense,
    isLoading,
  };
}
