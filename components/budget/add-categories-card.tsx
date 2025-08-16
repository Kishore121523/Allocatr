'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronUp, Plus, Search } from 'lucide-react';

interface AddCategoriesCardProps {
  showAllCategories: boolean;
  onToggleShowAll: () => void;
  categorySearch: string;
  onCategorySearchChange: (value: string) => void;
  filteredAvailableCategories: Array<{ name: string; color: string }>;
  onAddCategoryFromDefault: (name: string) => void;
  onAddCustomCategory: () => void;
}

export function AddCategoriesCard({
  showAllCategories,
  onToggleShowAll,
  categorySearch,
  onCategorySearchChange,
  filteredAvailableCategories,
  onAddCategoryFromDefault,
  onAddCustomCategory,
}: AddCategoriesCardProps) {
  const chevronRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const categoryButtonsRef = useRef<HTMLDivElement>(null);

  // Chevron animation
  useEffect(() => {
    if (chevronRef.current) {
      gsap.to(chevronRef.current, {
        rotation: showAllCategories ? 180 : 0,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  }, [showAllCategories]);

  // Content expand/collapse animation
  useEffect(() => {
    if (contentRef.current) {
      if (showAllCategories) {
        gsap.fromTo(contentRef.current, 
          { 
            opacity: 0, 
            y: -20,
            height: 0 
          },
          { 
            opacity: 1, 
            y: 0,
            height: "auto",
            duration: 0.4,
            ease: "power2.out"
          }
        );
      }
    }
  }, [showAllCategories]);

  // Category buttons stagger animation
  useEffect(() => {
    if (showAllCategories && categoryButtonsRef.current) {
      const buttons = categoryButtonsRef.current.querySelectorAll('button');
      gsap.fromTo(buttons, 
        { 
          opacity: 0, 
        },
        { 
          opacity: 1, 
          duration: 0.3,
          stagger: 0.02,
          ease: "power2.out"
        }
      );
    }
  }, [filteredAvailableCategories, showAllCategories]);
  return (
    <Card className="mb-4 sm:mb-6">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
          <div>
            <CardTitle className="text-lg sm:text-xl">Add More Categories</CardTitle>
            <CardDescription className="text-sm">Browse all available categories or create your own</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button onClick={onAddCustomCategory} size="sm" variant="outline" className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-1" />
              Custom Category
            </Button>
            <Button onClick={onToggleShowAll} size="sm" variant="outline" className="w-full sm:w-auto">
              <div ref={chevronRef} className="mr-1">
                <ChevronDown className="h-4 w-4" />
              </div>
              {showAllCategories ? "Hide All" : "Browse All"}
            </Button>
          </div>
        </div>
      </CardHeader>
      {showAllCategories && (
        <CardContent ref={contentRef} className="overflow-y-auto scrollbar-hide">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={categorySearch}
                onChange={(e) => onCategorySearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            <div ref={categoryButtonsRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto scrollbar-hide">
              {filteredAvailableCategories.map((category) => (
                <Button
                  key={category.name}
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddCategoryFromDefault(category.name)}
                  className="justify-start h-auto p-2 text-left transition-transform hover:scale-105"
                  onMouseEnter={(e) => {
                    gsap.to(e.currentTarget, { scale: 1.05, duration: 0.2, ease: "power2.out" });
                  }}
                  onMouseLeave={(e) => {
                    gsap.to(e.currentTarget, { scale: 1, duration: 0.2, ease: "power2.out" });
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: category.color }} />
                    <span className="text-xs truncate">{category.name}</span>
                  </div>
                </Button>
              ))}
            </div>

            {filteredAvailableCategories.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <p>
                  No categories found matching "{categorySearch}"
                </p>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}


