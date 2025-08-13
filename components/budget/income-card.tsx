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
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Monthly Income
        </CardTitle>
        <CardDescription>
          Enter your total monthly income after taxes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="income">Income Amount</Label>
          <Input
            id="income"
            type="text"
            placeholder="$0.00"
            value={monthlyIncome}
            onChange={(e) => onChange(e.target.value)}
            className="text-lg"
          />
        </div>
      </CardContent>
    </Card>
  );
}


