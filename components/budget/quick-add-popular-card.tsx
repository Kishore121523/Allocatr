'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Grid3X3 } from 'lucide-react';
import { DEFAULT_CATEGORIES } from '@/types';

interface QuickAddPopularCardProps {
  availablePopularCategories: string[];
  onAddCategoryFromDefault: (name: string) => void;
}

export function QuickAddPopularCard({ availablePopularCategories, onAddCategoryFromDefault }: QuickAddPopularCardProps) {
  if (availablePopularCategories.length === 0) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Grid3X3 className="h-5 w-5" />
          Quick Add Popular Categories
        </CardTitle>
        <CardDescription>Common categories that most people use</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {availablePopularCategories.map((categoryName) => {
            const defaultCategory = DEFAULT_CATEGORIES.find((cat) => cat.name === categoryName);
            return (
              <Button
                key={categoryName}
                variant="outline"
                size="sm"
                onClick={() => onAddCategoryFromDefault(categoryName)}
                className="justify-start h-auto p-3"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: defaultCategory?.color }} />
                  <span className="text-sm">{categoryName}</span>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}


