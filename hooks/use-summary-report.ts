// hooks/use-summary-report.ts

import { useState } from 'react';
import { Budget, Transaction, SummaryReportData } from '@/types';

export function useSummaryReport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<SummaryReportData | null>(null);

  const generateReport = async (
    budget: Budget, 
    transactions: Transaction[], 
    currentMonth: string
  ) => {
    setLoading(true);
    setError(null);
    setReportData(null);

    try {
      const response = await fetch('/api/summary-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          budget,
          transactions,
          currentMonth,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate report');
      }

      setReportData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Summary report generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearReport = () => {
    setReportData(null);
    setError(null);
  };

  return {
    loading,
    error,
    reportData,
    generateReport,
    clearReport,
  };
}
