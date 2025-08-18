"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

// Helper function to group transactions by date
function groupTransactionsByDate(transactions: Transaction[]) {
  const grouped = new Map<string, { transactions: Transaction[]; total: number; dateDisplay: string }>();
  
  transactions.forEach(transaction => {
    const dateKey = formatLocalDateYYYYMMDD(transaction.date);
    const dateDisplay = formatDate(transaction.date);
    
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, { 
        transactions: [], 
        total: 0,
        dateDisplay 
      });
    }
    
    const group = grouped.get(dateKey)!;
    group.transactions.push(transaction);
    group.total += transaction.amount;
  });
  
  // Sort by date (most recent first)
  return Array.from(grouped.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([dateKey, group]) => ({
      dateKey,
      dateDisplay: group.dateDisplay,
      transactions: group.transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      total: group.total
    }));
}

// Helper function to format date for grouping (YYYY-MM-DD)
function formatLocalDateYYYYMMDD(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function TransactionsList({
  loading,
  transactions,
  total,
  onEdit,
  onDelete,
  categoryColors,
}: TransactionsListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  
  const groupedTransactions = groupTransactionsByDate(transactions);

  const handleDeleteClick = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (transactionToDelete) {
      onDelete(transactionToDelete.id);
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setTransactionToDelete(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
        <CardTitle className="text-lg sm:text-xl">Transactions</CardTitle>
        <div className="text-sm px-3 sm:px-4 py-3 bg-muted/30 rounded-lg">
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
          <div className="space-y-6">
            {groupedTransactions.map((group) => (
              <div key={group.dateKey} className="space-y-3">
                {/* Date header with daily total */}
                <div className="flex items-center justify-between py-2 sm:mx-1 px-2 sm:px-3 border-b border-border/20 bg-muted/30 rounded-lg">
                  <p className="font-semibold text-base text-foreground">{group.dateDisplay}</p>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{formatCurrency(group.total)}</span>
                  </div>
                </div>
                
                {/* Transactions for this date */}
                <div className="space-y-3 sm:space-y-3">
                  {group.transactions.map((t) => (
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
                          <span className="text-xs text-muted-foreground">
                            {new Intl.DateTimeFormat('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            }).format(new Date(t.createdAt))}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end sm:gap-4">
                        <div className="text-left sm:text-right min-w-[90px]">
                          <p className="font-semibold text-base sm:text-sm">{formatCurrency(t.amount)}</p>
                        </div>
                        <div className="flex items-center mr-[-8px] sm:mr-0">
                          <Button variant="ghost" size="icon" onClick={() => onEdit(t)} className="h-8 w-8 sm:h-9 sm:w-9">
                            <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(t)} className="h-8 w-8 sm:h-9 sm:w-9">
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="w-[90vw] max-w-[500px] max-h-[90vh] overflow-y-auto p-4 sm:p-6 [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-xl">Delete Transaction</DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to delete the transaction "{transactionToDelete?.description}" for {formatCurrency(transactionToDelete?.amount || 0)}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}


