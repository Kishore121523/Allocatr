"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, X, CalendarIcon } from "lucide-react";
import { format } from "date-fns";

type TransactionsFiltersProps = {
  month: string;
  onMonthChange: (value: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
};

export function TransactionsFilters({
  month,
  onMonthChange,
  search,
  onSearchChange,
  category,
  onCategoryChange,
  categories,
}: TransactionsFiltersProps) {
  const [open, setOpen] = React.useState(false);
  
  // Convert month string (YYYY-MM) to Date object for the calendar
  const selectedDate = month 
    ? (() => {
        const [year, monthNum] = month.split('-').map(Number);
        return new Date(year, monthNum - 1, 1);
      })()
    : new Date();

  const handleMonthSelect = (date: Date | undefined) => {
    if (date) {
      // Format as YYYY-MM for the month value
      const formattedMonth = format(date, 'yyyy-MM');
      onMonthChange(formattedMonth);
      setOpen(false);
    }
  };

  // Format display text for the button
  const displayMonth = month 
    ? format(selectedDate, 'MMMM yyyy')
    : 'Select month';

  return (
    <Card className="mb-6 border-0 shadow-sm">
      <CardContent className="py-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Month Selector with Calendar */}
          <div className="flex-shrink-0">
            <label className="text-xs text-muted-foreground mb-1 block">Month</label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[180px] justify-between font-normal hover:bg-accent"
                >
                  <span className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    {displayMonth}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleMonthSelect}
                  captionLayout="dropdown"
                  fromYear={2020}
                  toYear={new Date().getFullYear() + 1}
                  disabled={(date) => date > new Date()}
                  initialFocus
                  className="rounded-md border"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Right-aligned filters */}
          <div className="flex flex-1 flex-col md:flex-row gap-4 md:justify-end">
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