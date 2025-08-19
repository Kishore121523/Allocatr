// lib/utils.ts

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d);
}

export function getMonthKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

// Local-date helpers to avoid UTC off-by-one issues
export function formatLocalDateYYYYMMDD(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  // If passed a YYYY-MM-DD string, new Date(string) is parsed as UTC per spec.
  // We want a local date string, so read components via local getters.
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseYYYYMMDDToLocalDate(value: string): Date {
  // Parse a YYYY-MM-DD string into a Date at local midnight
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
}

export function todayLocalYYYYMMDD(): string {
  // Use Intl API for reliable timezone-aware date formatting
  // This works correctly regardless of server timezone
  const now = new Date();
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  const formatter = new Intl.DateTimeFormat('en-CA', { 
    timeZone: userTimezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  // en-CA format gives us YYYY-MM-DD directly
  return formatter.format(now);
}

export function calculatePercentage(spent: number, allocated: number): number {
  if (allocated === 0) return 0;
  return Math.round((spent / allocated) * 100);
}

export function getProgressColor(percentage: number): string {
  if (percentage <= 50) return 'bg-green-500';
  if (percentage <= 75) return 'bg-yellow-500';
  if (percentage <= 90) return 'bg-orange-500';
  return 'bg-red-500';
}

export function getProgressColorClass(percentage: number): string {
  if (percentage <= 50) return 'text-green-600 bg-green-100';
  if (percentage <= 75) return 'text-yellow-600 bg-yellow-100';
  if (percentage <= 90) return 'text-orange-600 bg-orange-100';
  return 'text-red-600 bg-red-100';
}

export function validateBudgetAllocation(
  income: number,
  allocations: { amount: number }[]
): { isValid: boolean; difference: number } {
  const totalAllocated = allocations.reduce((sum, cat) => sum + cat.amount, 0);
  const difference = income - totalAllocated;
  return {
    isValid: Math.abs(difference) < 0.01, // Account for floating point precision
    difference,
  };
}

export function parseCurrencyInput(input: string): number {
  // Remove currency symbols and commas
  const cleaned = input.replace(/[$,]/g, '');
  const amount = parseFloat(cleaned);
  return isNaN(amount) ? 0 : amount;
}

export function isLastDayOfMonth(date: Date = new Date()): boolean {
  const year = date.getFullYear();
  const month = date.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  // return (date.getDate() === lastDay);
  return !(date.getDate() === lastDay);
}