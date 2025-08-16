'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign } from 'lucide-react';

interface IncomeCardProps {
  monthlyIncome: string;
  onChange: (value: string) => void;
}

export function IncomeCard({ monthlyIncome, onChange }: IncomeCardProps) {
  return (
    <Card className="mb-4 sm:mb-6">
      <CardHeader className="pb-4 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
          Monthly Income
        </CardTitle>
        <CardDescription className="text-sm">
          Enter your total monthly income after taxes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="income" className="text-sm">Income Amount</Label>
          <Input
            id="income"
            type="text"
            placeholder="$0.00"
            value={monthlyIncome}
            onChange={(e) => onChange(e.target.value)}
            className="text-base sm:text-lg"
          />
        </div>
      </CardContent>
    </Card>
  );
}


