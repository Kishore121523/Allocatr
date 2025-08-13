"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

type TransactionsFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
};

export function TransactionsFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  categories,
}: TransactionsFiltersProps) {
  return (
    <Card className="mb-6 border-0 shadow-sm">
      <CardContent className="py-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search and category filters */}
          <div className="flex flex-1 flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 md:flex-initial">
              <label className="text-xs text-muted-foreground mb-1 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  className="pl-9 pr-9 md:w-[250px]"
                  placeholder="Search transactions..."
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
                {search && (
                  <button
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    onClick={() => onSearchChange("")}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex-1 md:flex-initial">
              <label className="text-xs text-muted-foreground mb-1 block">Category</label>
              <Select value={category} onValueChange={onCategoryChange}>
                <SelectTrigger className="md:w-[180px]">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}