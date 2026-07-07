export type MemberName = 'Siddhant' | 'Akash' | 'Abday' | 'Rahul';

export const MEMBERS: MemberName[] = ['Siddhant', 'Akash', 'Abday', 'Rahul'];

export type ExpenseCategory =
  | 'Groceries'
  | 'Vegetables'
  | 'Fruits'
  | 'Milk'
  | 'Breakfast'
  | 'Snacks'
  | 'Cleaning'
  | 'Kitchen'
  | 'Gas'
  | 'Electricity'
  | 'Internet'
  | 'Water'
  | 'Furniture'
  | 'Appliances'
  | 'Medicine'
  | 'Party'
  | 'Rent'
  | 'Maintenance'
  | 'Miscellaneous';

export const CATEGORIES: ExpenseCategory[] = [
  'Groceries',
  'Vegetables',
  'Fruits',
  'Milk',
  'Breakfast',
  'Snacks',
  'Cleaning',
  'Kitchen',
  'Gas',
  'Electricity',
  'Internet',
  'Water',
  'Furniture',
  'Appliances',
  'Medicine',
  'Party',
  'Rent',
  'Maintenance',
  'Miscellaneous'
];

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Groceries: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  Vegetables: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
  Fruits: 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300 border-lime-200 dark:border-lime-800',
  Milk: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300 border-sky-200 dark:border-sky-800',
  Breakfast: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  Snacks: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  Cleaning: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300 border-teal-200 dark:border-teal-800',
  Kitchen: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
  Gas: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
  Electricity: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
  Internet: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  Water: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  Furniture: 'bg-stone-100 text-stone-800 dark:bg-stone-900/30 dark:text-stone-300 border-stone-200 dark:border-stone-800',
  Appliances: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  Medicine: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  Party: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300 border-pink-200 dark:border-pink-800',
  Rent: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300 border-violet-200 dark:border-violet-800',
  Maintenance: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900/30 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800',
  Miscellaneous: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300 border-slate-200 dark:border-slate-800',
};

export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Bank Transfer';

export const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'UPI', 'Card', 'Bank Transfer'];

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  category: ExpenseCategory;
  subCategory: string;
  itemName: string;
  description: string;
  amount: number;
  paidBy: MemberName;
  paymentMethod: PaymentMethod;
  paymentSource?: 'Flat Fund' | 'Personal'; // 'Flat Fund' subtracts from pool, 'Personal' is out of pocket
  shopName: string;
  billAvailable: 'Yes' | 'No';
  notes: string;
  photoUrl?: string;
  tags?: string[];
  isFavorite?: boolean;
  isRecurring?: boolean;
  recurringInterval?: 'weekly' | 'monthly' | 'yearly';
  createdTime: string; // ISO String
  month: string; // YYYY-MM (e.g. 2026-07)
}

export interface Contribution {
  id: string;
  date: string;
  member: MemberName;
  amount: number;
  paymentMode: PaymentMethod;
  notes: string;
  month: string; // YYYY-MM
}

export interface InventoryItem {
  id: string;
  item: string;
  openingQty: number;
  purchasedQty: number;
  usedQty: number;
  remainingQty: number;
  lowStockAlert: number;
  unit: 'kg' | 'gram' | 'litre' | 'packet' | 'piece' | 'dozen';
}

export interface MonthHistory {
  month: string; // YYYY-MM
  totalFund: number;
  totalExpenses: number;
  remainingBalance: number;
  carriedOver: boolean;
  settled: boolean;
  contributions: Contribution[];
  expensesCount: number;
}

// Trackers
export interface ShoppingItem {
  id: string;
  item: string;
  qty: string;
  completed: boolean;
  notes?: string;
}

export interface WishlistItem {
  id: string;
  item: string;
  estimatedCost: number;
  url?: string;
  pinned: boolean;
}

export interface UtilityReminder {
  id: string;
  name: string;
  dueDate: string;
  amount: number;
  paid: boolean;
  category: 'Electricity' | 'Internet' | 'Water' | 'Gas' | 'Rent' | 'Other';
}

export interface GasCylinderLog {
  id: string;
  bookingDate: string;
  deliveryDate?: string;
  amount: number;
  empty: boolean;
  provider: string;
}

export interface WaterCanLog {
  id: string;
  date: string;
  quantity: number;
  amount: number;
  paidBy: MemberName;
}

export interface SecurityDeposit {
  id: string;
  description: string;
  amount: number;
  paidBy: MemberName;
  date: string;
  refunded: boolean;
}

export interface RoomMaintenanceLog {
  id: string;
  date: string;
  issue: string;
  cost: number;
  paidBy: MemberName;
  resolved: boolean;
}

export interface SharedAppliance {
  id: string;
  name: string;
  purchaseDate: string;
  cost: number;
  paidBy: MemberName;
  warrantyPeriod?: string; // e.g. 1 year
}

export interface AppSettings {
  currency: string;
  theme: 'light' | 'dark';
  currentMonth: string; // YYYY-MM
  pinnedCategories: ExpenseCategory[];
  monthlyNotes: Record<string, string>; // Month string -> note text
  carryOverBalances: Record<string, number>; // Month string -> carryover amount
}
