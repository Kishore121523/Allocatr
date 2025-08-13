// hooks/use-ai-categorization.ts

'use client';

import { useState } from 'react';
import { AICategorizationResult, BudgetCategory } from '@/types';
import { toast } from 'sonner';

export function useAICategorization() {
  const [isLoading, setIsLoading] = useState(false);

  const categorizeExpense = async (
    input: string,
    categories: BudgetCategory[]
  ): Promise<AICategorizationResult | null> => {
    if (!input.trim()) return null;

    setIsLoading(true);

    try {
      // Call the API route that will handle Azure OpenAI
      const response = await fetch('/api/categorize', {
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
      
      // Show user-friendly error message
      toast.error('AI categorization unavailable', {
        description: error.message === 'Azure OpenAI not configured' 
          ? 'AI service is not configured. Please enter details manually.'
          : 'Could not process your input. Please enter details manually.',
      });
      
      return null;
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

    // Last/Next weekday
    const weekdays = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const lastNextMatch = lower.match(/\b(last|next)\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/);
    if (lastNextMatch) {
      const [, dir, dayName] = lastNextMatch;
      const target = weekdays.indexOf(dayName);
      const d = new Date(today);
      const diff = target - d.getDay();
      let delta = diff;
      if (dir === 'last') {
        delta = diff - 7 * (diff >= 0 ? 1 : 0);
      } else if (dir === 'next') {
        delta = diff + 7 * (diff <= 0 ? 1 : 0);
      }
      d.setDate(d.getDate() + delta);
      return setAndReturn(d);
    }

    // ISO format (2024-08-03)
    const isoMatch = text.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
    if (isoMatch) {
      const y = Number(isoMatch[1]);
      const m = Number(isoMatch[2]);
      const dd = Number(isoMatch[3]);
      const date = new Date(y, m - 1, dd);
      if (!isNaN(date.getTime())) return setAndReturn(date);
    }

    // MM/DD or MM/DD/YYYY format
    const slash = text.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
    if (slash) {
      let y = today.getFullYear();
      const m = Number(slash[1]);
      const dd = Number(slash[2]);
      if (slash[3]) {
        const yy = Number(slash[3]);
        y = yy < 100 ? 2000 + yy : yy;
      }
      const date = new Date(y, m - 1, dd);
      if (!isNaN(date.getTime())) return setAndReturn(date);
    }

    // Month name format (August 3, Aug 3rd, etc.)
    const months = ['january','february','march','april','may','june','july','august','september','october','november','december'];
    const monthName = lower.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s*(\d{4}))?\b/);
    if (monthName) {
      let monthStr = monthName[1];
      // Convert short month names to full names
      const shortMonths: Record<string, string> = {
        'jan': 'january', 'feb': 'february', 'mar': 'march', 'apr': 'april',
        'may': 'may', 'jun': 'june', 'jul': 'july', 'aug': 'august',
        'sep': 'september', 'oct': 'october', 'nov': 'november', 'dec': 'december'
      };
      if (shortMonths[monthStr]) {
        monthStr = shortMonths[monthStr];
      }
      const m = months.indexOf(monthStr);
      if (m !== -1) {
        const dd = Number(monthName[2]);
        const y = monthName[3] ? Number(monthName[3]) : today.getFullYear();
        const date = new Date(y, m, dd);
        if (!isNaN(date.getTime())) return setAndReturn(date);
      }
    }

    return null;
  }

  return {
    categorizeExpense,
    isLoading,
  };
}