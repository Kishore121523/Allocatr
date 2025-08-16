// app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/providers/auth-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { MonthProvider } from '@/providers/month-provider';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Allocatr - Zero-Based Budget Tracker',
  description: 'A privacy-first finance tracker with AI-powered categorization',
  keywords: ['budget', 'finance', 'expense tracker', 'zero-based budgeting'],
  authors: [{ name: 'Allocatr Team' }],
  openGraph: {
    title: 'Allocatr - Zero-Based Budget Tracker',
    description: 'Track your expenses with AI-powered categorization',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <MonthProvider>
                {children}
              <Toaster />
            </MonthProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}