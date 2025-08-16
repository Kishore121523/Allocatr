"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React from "react";

type TransactionsHeaderProps = {
  onAdd: () => void;
};

export function TransactionsHeader({ onAdd }: TransactionsHeaderProps) {
  return (
    <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Transactions</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Review, add, edit, and delete your expenses</p>
      </div>
      <Button onClick={onAdd} className="w-full sm:w-auto">
        <Plus className="h-4 w-4" />
        Add Expense
      </Button>
    </div>
  );
}


