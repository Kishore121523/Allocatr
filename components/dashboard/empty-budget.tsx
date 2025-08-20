// components/dashboard/empty-budget.tsx

'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, ArrowRight, PiggyBank } from 'lucide-react';

export function EmptyBudget() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-accent rounded-full">
              <PiggyBank className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to Allocatr</CardTitle>
          <CardDescription className="text-base mt-2">
            Let's set up your first budget using zero-based budgeting principles.
            Every dollar will be assigned a purpose.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-4">
            <div className="text-left space-y-2 bg-accent p-4 rounded-lg">
              <h3 className="font-semibold text-sm">What you'll do:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Enter your monthly income</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Allocate funds to spending categories</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Ensure every dollar is assigned</span>
                </li>
              </ul>
            </div>
            
            <Button
              size="lg"
              className="w-full"
              onClick={() => router.push('/budget')}
            >
              Set Up Your Budget
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}