'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BudgetCategory } from '@/types';
import { Check, Edit2, Trash2, X } from 'lucide-react';

interface AllocatedCategoriesCardProps {
  categories: BudgetCategory[];
  editingCategoryId: string | null;
  editingCategoryName: string;
  onSetEditingCategoryName: (value: string) => void;
  onStartEditingCategory: (id: string, name: string) => void;
  onSaveEditingCategory: (id: string) => void;
  onCancelEditingCategory: () => void;
  onCategoryAmountChange: (id: string, value: string) => void;
  onRemoveCategory: (id: string) => void;
}

export function AllocatedCategoriesCard({
  categories,
  editingCategoryId,
  editingCategoryName,
  onSetEditingCategoryName,
  onStartEditingCategory,
  onSaveEditingCategory,
  onCancelEditingCategory,
  onCategoryAmountChange,
  onRemoveCategory,
}: AllocatedCategoriesCardProps) {
  if (categories.length === 0) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Budget Categories
          <Badge variant="secondary">
            {categories.length} {categories.length === 1 ? 'category' : 'categories'}
          </Badge>
        </CardTitle>
        <CardDescription>Your active budget categories with allocations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: category.color }} />
              <div className="flex-1">
                {editingCategoryId === category.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editingCategoryName}
                      onChange={(e) => onSetEditingCategoryName(e.target.value)}
                      className="h-8 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          onSaveEditingCategory(category.id);
                        } else if (e.key === 'Escape') {
                          onCancelEditingCategory();
                        }
                      }}
                      autoFocus
                    />
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onSaveEditingCategory(category.id)}>
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onCancelEditingCategory}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{category.name}</span>
                    {category.isCustom && (
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onStartEditingCategory(category.id, category.name)}>
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
              <div className="w-32">
                <Input
                  type="text"
                  placeholder="$0.00"
                  value={category.allocatedAmount || ''}
                  onChange={(e) => onCategoryAmountChange(category.id, e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <Button variant="ghost" size="icon" onClick={() => onRemoveCategory(category.id)} className="h-8 w-8">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


