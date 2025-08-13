"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React from "react";

type TransactionsHeaderProps = {
  onAdd: () => void;
};

export function TransactionsHeader({ onAdd }: TransactionsHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Transactions</h1>
        <p className="text-muted-foreground">Review, add, edit, and delete your expenses</p>
      </div>
      <Button onClick={onAdd}>
        <Plus className="h-4 w-4" />
        Add Expense
      </Button>
    </div>
  );
}


