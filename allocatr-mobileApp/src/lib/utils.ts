// lib/utils.ts

import { format, parse, startOfMonth, endOfMonth } from 'date-fns';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function getMonthKey(date?: Date): string {
  const targetDate = date || new Date();
  return format(targetDate, 'yyyy-MM');
}

export function getProgressColor(percentage: number): string {
  if (percentage >= 100) return '#ef4444'; // red
  if (percentage >= 80) return '#f59e0b'; // yellow
  if (percentage >= 60) return '#3b82f6'; // blue
  return '#10b981'; // green
}

export function getProgressColorClass(percentage: number): string {
  if (percentage >= 100) return 'text-destructive';
  if (percentage >= 80) return 'text-warning';
  if (percentage >= 60) return 'text-blue-500';
  return 'text-success';
}

export function parseCurrencyInput(input: string): number {
  // Remove currency symbols, commas, and spaces
  const cleaned = input.replace(/[$,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function todayLocalYYYYMMDD(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatLocalDateYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseYYYYMMDDToLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getMonthName(monthKey: string): string {
  const date = parse(monthKey, 'yyyy-MM', new Date());
  return format(date, 'MMMM yyyy');
}

export function isCurrentMonth(monthKey: string): boolean {
  return monthKey === getMonthKey();
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
