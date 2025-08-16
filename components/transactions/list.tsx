"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil, Receipt, Sparkles, Trash2 } from "lucide-react";
import { Transaction } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

type TransactionsListProps = {
  loading: boolean;
  transactions: Transaction[];
  total: number;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
  categoryColors: Map<string, string>;
};

export function TransactionsList({
  loading,
  transactions,
  total,
  onEdit,
  onDelete,
  categoryColors,
}: TransactionsListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
        <CardTitle className="text-lg sm:text-xl">Transactions</CardTitle>
        <div className="text-sm text-muted-foreground">
          Total: <span className="font-semibold text-foreground">{formatCurrency(total)}</span>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Receipt className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-1">No transactions found.</p>
            <p className="text-xs text-muted-foreground">Try adjusting filters or add a new expense.</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {transactions.map((t) => (
              <div key={t.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-border/75 bg-accent/30 sm:border-transparent sm:bg-transparent sm:hover:bg-accent gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{t.description}</p>
                    {t.isAICategorized && <Sparkles className="h-3 w-3 text-primary" />}
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {!!t.categoryName && (
                      <Badge 
                        variant="outline" 
                        className="text-xs font-medium"
                        style={{ 
                          borderColor: categoryColors.get(t.categoryName) || '#6B7280',
                          backgroundColor: `${categoryColors.get(t.categoryName) || '#6B7280'}15`,
                          color: categoryColors.get(t.categoryName) || '#6B7280',
                        }}
                      >
                        {t.categoryName}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{formatDate(t.date)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end sm:gap-4">
                  <div className="text-left sm:text-right min-w-[90px]">
                    <p className="font-semibold text-base sm:text-sm">{formatCurrency(t.amount)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(t)} className="h-8 w-8 sm:h-9 sm:w-9">
                      <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(t.id)} className="h-8 w-8 sm:h-9 sm:w-9">
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


