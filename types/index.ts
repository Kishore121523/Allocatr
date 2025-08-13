// types/index.ts

export interface User {
    id: string;
    email: string;
    displayName: string | null;
    // photoURL: string | null;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface UserPreferences {
    id: string;
    userId: string;
    selectedMonth: string; // Format: "YYYY-MM"
    lastActiveDate: string; // ISO date string
    autoAdvanceMonth: boolean; // Whether to auto-advance to new months
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Budget {
    id: string;
    userId: string;
    monthlyIncome: number;
    categories: BudgetCategory[];
    createdAt: Date;
    updatedAt: Date;
    month: string; // Format: "YYYY-MM"
  }
  
  export interface BudgetCategory {
    id: string;
    name: string;
    allocatedAmount: number;
    color: string;
    icon?: string;
    isCustom?: boolean;
  }
  
  export interface Transaction {
    id: string;
    userId: string;
    amount: number;
    description: string;
    categoryId: string;
    categoryName?: string;
    date: Date;
    createdAt: Date;
    updatedAt: Date;
    isAICategorized?: boolean;
  }
  
  export interface CategorySpending {
    categoryId: string;
    categoryName: string;
    allocated: number;
    spent: number;
    isUnallocated:boolean;
    remaining: number;
    percentageUsed: number;
    color: string;
  }
  
  export interface DashboardStats {
    totalBudget: number;
    totalSpent: number;
    remainingBudget: number;
    percentageUsed: number;
    categoriesOverBudget: number;
    transactionCount: number;
  }
  
  export interface AICategorizationResult {
    amount: number;
    description: string;
    suggestedCategory: string;
    confidence: number;
    date?: string; // Add optional date field
  }
  
  // Default budget categories
  export const DEFAULT_CATEGORIES: Omit<BudgetCategory, 'id' | 'allocatedAmount'>[] = [
    { name: 'Housing', color: '#3B82F6', icon: 'Home' },
    { name: 'Transportation', color: '#10B981', icon: 'Car' },
    { name: 'Food & Dining', color: '#F59E0B', icon: 'UtensilsCrossed' },
    { name: 'Utilities', color: '#6366F1', icon: 'Zap' },
    { name: 'Healthcare', color: '#EF4444', icon: 'Heart' },
    { name: 'Insurance', color: '#8B5CF6', icon: 'Shield' },
    { name: 'Personal', color: '#EC4899', icon: 'User' },
    { name: 'Entertainment', color: '#14B8A6', icon: 'Gamepad2' },
    { name: 'Savings', color: '#84CC16', icon: 'PiggyBank' },
    { name: 'Debt Payments', color: '#F97316', icon: 'CreditCard' },
    { name: 'Education', color: '#06B6D4', icon: 'GraduationCap' },
    { name: 'Groceries', color: '#22C55E', icon: 'ShoppingCart' },
    { name: 'Shopping', color: '#A855F7', icon: 'ShoppingBag' },
    { name: 'Travel', color: '#0EA5E9', icon: 'Plane' },
    { name: 'Clothing', color: '#E11D48', icon: 'Shirt' },
    { name: 'Gifts & Donations', color: '#DB2777', icon: 'Gift' },
    { name: 'Pets', color: '#7C3AED', icon: 'Cat' },
    { name: 'Home Improvement', color: '#059669', icon: 'Hammer' },
    { name: 'Investments', color: '#0891B2', icon: 'TrendingUp' },
    { name: 'Phone & Internet', color: '#7C2D12', icon: 'Smartphone' },
    { name: 'Subscriptions', color: '#BE123C', icon: 'Tv' },
    { name: 'Gym & Fitness', color: '#15803D', icon: 'Dumbbell' },
    { name: 'Beauty & Personal Care', color: '#E11D48', icon: 'Sparkles' },
    { name: 'Childcare', color: '#1E40AF', icon: 'Baby' },
    { name: 'Gas & Fuel', color: '#EA580C', icon: 'Fuel' },
    { name: 'Parking & Tolls', color: '#B91C1C', icon: 'ParkingCircle' },
    { name: 'Public Transit', color: '#166534', icon: 'Train' },
    { name: 'Ride Sharing', color: '#9333EA', icon: 'Car' },
    { name: 'Office Supplies', color: '#0F766E', icon: 'Briefcase' },
    { name: 'Taxes', color: '#991B1B', icon: 'Receipt' },
    { name: 'Legal', color: '#1F2937', icon: 'Scale' },
    { name: 'Other', color: '#6B7280', icon: 'MoreHorizontal' },
  ];