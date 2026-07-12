import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type {
  Expense,
  Contribution,
  InventoryItem,
  MonthHistory,
  ShoppingItem,
  WishlistItem,
  UtilityReminder,
  GasCylinderLog,
  WaterCanLog,
  SecurityDeposit,
  RoomMaintenanceLog,
  SharedAppliance,
  AppSettings,
  MemberName,
  ExpenseCategory
} from './types';
import { MEMBERS } from './types';

interface Settlement {
  from: MemberName;
  to: MemberName;
  amount: number;
}

interface AppContextType {
  settings: AppSettings;
  expenses: Expense[];
  contributions: Contribution[];
  inventory: InventoryItem[];
  budgets: Record<ExpenseCategory, number>;
  history: MonthHistory[];
  shoppingList: ShoppingItem[];
  wishlist: WishlistItem[];
  utilityReminders: UtilityReminder[];
  gasLogs: GasCylinderLog[];
  waterLogs: WaterCanLog[];
  deposits: SecurityDeposit[];
  maintenanceLogs: RoomMaintenanceLog[];
  sharedAppliances: SharedAppliance[];
  
  // Actions
  addExpense: (expense: Omit<Expense, 'id' | 'createdTime' | 'month'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  duplicateExpense: (id: string) => void;
  
  addContribution: (contribution: Omit<Contribution, 'id' | 'month'>) => void;
  updateContribution: (id: string, contribution: Partial<Contribution>) => void;
  deleteContribution: (id: string) => void;
  
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'remainingQty'>) => void;
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  
  updateBudget: (category: ExpenseCategory, amount: number) => void;
  
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetAllData: () => void;
  importBackup: (backupData: string) => boolean;
  exportBackup: () => string;
  startNewMonth: (carryRemaining: boolean) => void;
  
  // Trackers Actions
  addShoppingItem: (item: string, qty: string, notes?: string) => void;
  toggleShoppingItem: (id: string) => void;
  deleteShoppingItem: (id: string) => void;
  clearCompletedShopping: () => void;
  
  addWishlistItem: (item: string, cost: number, url?: string) => void;
  togglePinWishlist: (id: string) => void;
  deleteWishlistItem: (id: string) => void;
  
  addUtilityReminder: (reminder: Omit<UtilityReminder, 'id' | 'paid'>) => void;
  toggleUtilityReminder: (id: string) => void;
  deleteUtilityReminder: (id: string) => void;
  
  addGasLog: (log: Omit<GasCylinderLog, 'id'>) => void;
  toggleGasEmpty: (id: string) => void;
  deleteGasLog: (id: string) => void;
  
  addWaterLog: (log: Omit<WaterCanLog, 'id'>) => void;
  deleteWaterLog: (id: string) => void;
  
  addDeposit: (deposit: Omit<SecurityDeposit, 'id' | 'refunded'>) => void;
  toggleDepositRefunded: (id: string) => void;
  deleteDeposit: (id: string) => void;
  
  addMaintenanceLog: (log: Omit<RoomMaintenanceLog, 'id' | 'resolved'>) => void;
  toggleMaintenanceResolved: (id: string) => void;
  deleteMaintenanceLog: (id: string) => void;
  
  addSharedAppliance: (appliance: Omit<SharedAppliance, 'id'>) => void;
  deleteSharedAppliance: (id: string) => void;

  // Sync state & actions
  isSyncing: boolean;
  syncError: string | null;
  lastSyncedTime: string | null;
  enableSync: (id: string) => Promise<boolean>;
  disableSync: () => void;
  createSyncGroup: () => Promise<string>;
  pushToCloud: () => Promise<void>;
  pullFromCloud: () => Promise<void>;

  // Computations for active month
  activeExpenses: Expense[];
  activeContributions: Contribution[];
  totalCollected: number;
  totalExpensesAmount: number;
  remainingBalance: number;
  remainingSharePerPerson: number;
  settlements: Settlement[];
  budgetUsage: Record<ExpenseCategory, { limit: number; spent: number; pct: number }>;
  memberStats: Record<MemberName, { contributed: number; spent: number; balance: number; pendingContribution: number; isContributionFullyPaid: boolean }>;
  notifications: { id: string; type: 'warning' | 'info' | 'danger' | 'success'; message: string; date: string }[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// LocalStorage Keys
const KEYS = {
  SETTINGS: 'flat_expense_manager_settings',
  EXPENSES: 'flat_expense_manager_expenses',
  CONTRIBUTIONS: 'flat_expense_manager_contributions',
  INVENTORY: 'flat_expense_manager_inventory',
  BUDGETS: 'flat_expense_manager_budgets',
  HISTORY: 'flat_expense_manager_history',
  SHOPPING: 'flat_expense_manager_shopping',
  WISHLIST: 'flat_expense_manager_wishlist',
  UTILITIES: 'flat_expense_manager_utilities',
  GAS: 'flat_expense_manager_gas',
  WATER: 'flat_expense_manager_water',
  DEPOSITS: 'flat_expense_manager_deposits',
  MAINTENANCE: 'flat_expense_manager_maintenance',
  APPLIANCES: 'flat_expense_manager_appliances',
};

// Initial Preloads
const DEFAULT_SETTINGS: AppSettings = {
  currency: '₹',
  theme: 'dark',
  currentMonth: '2026-07',
  pinnedCategories: ['Groceries', 'Rent', 'Electricity', 'Internet'],
  monthlyNotes: { '2026-07': 'Welcome to the new flat! Please remember to upload bills.' },
  carryOverBalances: {},
  syncId: '',
  isSyncEnabled: false,
  autoSync: true
};

const DEFAULT_CONTRIBUTIONS = (month: string): Contribution[] => [
  { id: `c-sid-${month}`, date: `${month}-01`, member: 'Siddhant', amount: 2000, paymentMode: 'UPI', notes: 'Monthly Contribution', month },
  { id: `c-aka-${month}`, date: `${month}-01`, member: 'Akash', amount: 2000, paymentMode: 'UPI', notes: 'Monthly Contribution', month },
  { id: `c-abd-${month}`, date: `${month}-01`, member: 'Abday', amount: 2000, paymentMode: 'UPI', notes: 'Monthly Contribution', month },
  { id: `c-rah-${month}`, date: `${month}-01`, member: 'Rahul', amount: 2000, paymentMode: 'UPI', notes: 'Monthly Contribution', month },
];

const DEFAULT_BUDGETS: Record<ExpenseCategory, number> = {
  Groceries: 6000,
  Milk: 1500,
  Vegetables: 2500,
  Gas: 1200,
  Cleaning: 1000,
  Internet: 1000,
  Electricity: 2500,
  Fruits: 1000,
  Breakfast: 1500,
  Snacks: 1200,
  Kitchen: 800,
  Water: 600,
  Furniture: 3000,
  Appliances: 5000,
  Medicine: 1000,
  Party: 4000,
  Rent: 12000,
  Maintenance: 2000,
  Miscellaneous: 3000,
};

const DEFAULT_INVENTORY: InventoryItem[] = [
  { id: 'i-1', item: 'Onions', openingQty: 5, purchasedQty: 0, usedQty: 0, remainingQty: 5, lowStockAlert: 2, unit: 'kg' },
  { id: 'i-2', item: 'Tomatoes', openingQty: 3, purchasedQty: 0, usedQty: 0, remainingQty: 3, lowStockAlert: 1.5, unit: 'kg' },
  { id: 'i-3', item: 'Milk Packet', openingQty: 10, purchasedQty: 0, usedQty: 0, remainingQty: 10, lowStockAlert: 3, unit: 'packet' },
  { id: 'i-4', item: 'Drinking Water Can', openingQty: 5, purchasedQty: 0, usedQty: 0, remainingQty: 5, lowStockAlert: 2, unit: 'piece' },
  { id: 'i-5', item: 'Cooking Gas Cylinder', openingQty: 1, purchasedQty: 0, usedQty: 0, remainingQty: 1, lowStockAlert: 1, unit: 'piece' },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // States
  const [settings, setSettings] = useState<AppSettings>(() => {
    const data = localStorage.getItem(KEYS.SETTINGS);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        return { ...DEFAULT_SETTINGS, ...parsed };
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const data = localStorage.getItem(KEYS.EXPENSES);
    return data ? JSON.parse(data) : [];
  });

  const [contributions, setContributions] = useState<Contribution[]>(() => {
    const data = localStorage.getItem(KEYS.CONTRIBUTIONS);
    if (data) return JSON.parse(data);
    return DEFAULT_CONTRIBUTIONS(DEFAULT_SETTINGS.currentMonth);
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const data = localStorage.getItem(KEYS.INVENTORY);
    return data ? JSON.parse(data) : DEFAULT_INVENTORY;
  });

  const [budgets, setBudgets] = useState<Record<ExpenseCategory, number>>(() => {
    const data = localStorage.getItem(KEYS.BUDGETS);
    return data ? JSON.parse(data) : DEFAULT_BUDGETS;
  });

  const [history, setHistory] = useState<MonthHistory[]>(() => {
    const data = localStorage.getItem(KEYS.HISTORY);
    return data ? JSON.parse(data) : [];
  });

  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => {
    const data = localStorage.getItem(KEYS.SHOPPING);
    return data ? JSON.parse(data) : [];
  });

  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    const data = localStorage.getItem(KEYS.WISHLIST);
    return data ? JSON.parse(data) : [];
  });

  const [utilityReminders, setUtilityReminders] = useState<UtilityReminder[]>(() => {
    const data = localStorage.getItem(KEYS.UTILITIES);
    return data ? JSON.parse(data) : [];
  });

  const [gasLogs, setGasLogs] = useState<GasCylinderLog[]>(() => {
    const data = localStorage.getItem(KEYS.GAS);
    return data ? JSON.parse(data) : [];
  });

  const [waterLogs, setWaterLogs] = useState<WaterCanLog[]>(() => {
    const data = localStorage.getItem(KEYS.WATER);
    return data ? JSON.parse(data) : [];
  });

  const [deposits, setDeposits] = useState<SecurityDeposit[]>(() => {
    const data = localStorage.getItem(KEYS.DEPOSITS);
    return data ? JSON.parse(data) : [];
  });

  const [maintenanceLogs, setMaintenanceLogs] = useState<RoomMaintenanceLog[]>(() => {
    const data = localStorage.getItem(KEYS.MAINTENANCE);
    return data ? JSON.parse(data) : [];
  });

  const [sharedAppliances, setSharedAppliances] = useState<SharedAppliance[]>(() => {
    const data = localStorage.getItem(KEYS.APPLIANCES);
    return data ? JSON.parse(data) : [];
  });

  // Sync to LocalStorage
  useEffect(() => { localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem(KEYS.CONTRIBUTIONS, JSON.stringify(contributions)); }, [contributions]);
  useEffect(() => { localStorage.setItem(KEYS.INVENTORY, JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { localStorage.setItem(KEYS.BUDGETS, JSON.stringify(budgets)); }, [budgets]);
  useEffect(() => { localStorage.setItem(KEYS.HISTORY, JSON.stringify(history)); }, [history]);
  useEffect(() => { localStorage.setItem(KEYS.SHOPPING, JSON.stringify(shoppingList)); }, [shoppingList]);
  useEffect(() => { localStorage.setItem(KEYS.WISHLIST, JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { localStorage.setItem(KEYS.UTILITIES, JSON.stringify(utilityReminders)); }, [utilityReminders]);
  useEffect(() => { localStorage.setItem(KEYS.GAS, JSON.stringify(gasLogs)); }, [gasLogs]);
  useEffect(() => { localStorage.setItem(KEYS.WATER, JSON.stringify(waterLogs)); }, [waterLogs]);
  useEffect(() => { localStorage.setItem(KEYS.DEPOSITS, JSON.stringify(deposits)); }, [deposits]);
  useEffect(() => { localStorage.setItem(KEYS.MAINTENANCE, JSON.stringify(maintenanceLogs)); }, [maintenanceLogs]);
  useEffect(() => { localStorage.setItem(KEYS.APPLIANCES, JSON.stringify(sharedAppliances)); }, [sharedAppliances]);

  // Cloud Sync States
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);
  const [localLastUpdated, setLocalLastUpdated] = useState<string>(() => new Date().toISOString());

  const isSyncingFromCloudRef = useRef(false);

  // Helper to compile current state to payload
  const getPayload = () => ({
    expenses,
    contributions,
    inventory,
    budgets,
    history,
    shoppingList,
    wishlist,
    utilityReminders,
    gasLogs,
    waterLogs,
    deposits,
    maintenanceLogs,
    sharedAppliances,
    currency: settings.currency,
    pinnedCategories: settings.pinnedCategories,
    monthlyNotes: settings.monthlyNotes,
    carryOverBalances: settings.carryOverBalances || {}
  });

  // Helper to apply payload to state
  const applyPayload = (payload: any) => {
    isSyncingFromCloudRef.current = true;
    if (payload.expenses) setExpenses(payload.expenses);
    if (payload.contributions) setContributions(payload.contributions);
    if (payload.inventory) setInventory(payload.inventory);
    if (payload.budgets) setBudgets(payload.budgets);
    if (payload.history) setHistory(payload.history);
    if (payload.shoppingList) setShoppingList(payload.shoppingList);
    if (payload.wishlist) setWishlist(payload.wishlist);
    if (payload.utilityReminders) setUtilityReminders(payload.utilityReminders);
    if (payload.gasLogs) setGasLogs(payload.gasLogs);
    if (payload.waterLogs) setWaterLogs(payload.waterLogs);
    if (payload.deposits) setDeposits(payload.deposits);
    if (payload.maintenanceLogs) setMaintenanceLogs(payload.maintenanceLogs);
    if (payload.sharedAppliances) setSharedAppliances(payload.sharedAppliances);
    
    setSettings(prev => ({
      ...prev,
      currency: payload.currency || prev.currency,
      pinnedCategories: payload.pinnedCategories || prev.pinnedCategories,
      monthlyNotes: payload.monthlyNotes || prev.monthlyNotes,
      carryOverBalances: payload.carryOverBalances || prev.carryOverBalances
    }));

    if (payload.lastUpdated) {
      setLocalLastUpdated(payload.lastUpdated);
    }
    setLastSyncedTime(new Date().toLocaleTimeString());

    setTimeout(() => {
      isSyncingFromCloudRef.current = false;
    }, 1000);
  };

  // Actions
  const createSyncGroup = async (): Promise<string> => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const initialPayload = {
        ...getPayload(),
        lastUpdated: new Date().toISOString()
      };
      
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(initialPayload)
      });
      
      if (!res.ok) throw new Error('Failed to create cloud sync group.');
      
      let id = '';
      try {
        const body = await res.json();
        if (body && body.id) {
          id = body.id;
        }
      } catch (e) {
        // Body was not JSON
      }

      if (!id) {
        const location = res.headers.get('Location') || res.headers.get('location');
        if (location) {
          id = location.split('/').pop() || '';
        }
      }

      if (!id) throw new Error('No sync ID or location returned.');
      
      setSettings(prev => ({
        ...prev,
        syncId: id,
        isSyncEnabled: true,
        autoSync: true
      }));
      setLastSyncedTime(new Date().toLocaleTimeString());
      setLocalLastUpdated(initialPayload.lastUpdated);
      setIsSyncing(false);
      return id;
    } catch (err: any) {
      console.error(err);
      setSyncError(err.message || 'Error creating cloud group.');
      setIsSyncing(false);
      throw err;
    }
  };

  const enableSync = async (id: string): Promise<boolean> => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const res = await fetch(`/api/sync/${id}`);
      if (!res.ok) throw new Error('Flat Sync ID not found or expired.');
      
      const data = await res.json();
      applyPayload(data);
      
      setSettings(prev => ({
        ...prev,
        syncId: id,
        isSyncEnabled: true,
        autoSync: true
      }));
      
      setIsSyncing(false);
      return true;
    } catch (err: any) {
      console.error(err);
      setSyncError(err.message || 'Error connecting to sync group.');
      setIsSyncing(false);
      return false;
    }
  };

  const disableSync = () => {
    setSettings(prev => ({
      ...prev,
      isSyncEnabled: false,
      syncId: ''
    }));
    setLastSyncedTime(null);
    setSyncError(null);
  };

  const pushToCloud = async (timestamp?: string) => {
    if (!settings.isSyncEnabled || !settings.syncId) return;
    setIsSyncing(true);
    setSyncError(null);
    try {
      const updatedTime = timestamp || new Date().toISOString();
      const payload = {
        ...getPayload(),
        lastUpdated: updatedTime
      };
      
      const res = await fetch(`/api/sync/${settings.syncId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Cloud sync upload failed.');
      
      setLocalLastUpdated(updatedTime);
      setLastSyncedTime(new Date().toLocaleTimeString());
    } catch (err: any) {
      console.error(err);
      setSyncError('Push error: Check connection.');
    } finally {
      setIsSyncing(false);
    }
  };

  const pullFromCloud = async () => {
    if (!settings.isSyncEnabled || !settings.syncId) return;
    setIsSyncing(true);
    setSyncError(null);
    try {
      const res = await fetch(`/api/sync/${settings.syncId}`);
      if (!res.ok) throw new Error('Failed to fetch from cloud.');
      
      const data = await res.json();
      
      // Only apply if the cloud data is strictly newer than our local data
      const cloudTime = data.lastUpdated ? new Date(data.lastUpdated).getTime() : 0;
      const localTime = localLastUpdated ? new Date(localLastUpdated).getTime() : 0;

      if (data.lastUpdated && cloudTime > localTime) {
        applyPayload(data);
      } else {
        setLastSyncedTime(new Date().toLocaleTimeString());
      }
    } catch (err: any) {
      console.error(err);
      setSyncError('Pull error: Check connection.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Background polling effect
  useEffect(() => {
    if (!settings.isSyncEnabled || !settings.syncId || !settings.autoSync) return;
    
    // Poll every 12 seconds
    const interval = setInterval(() => {
      pullFromCloud();
    }, 12000);
    
    return () => clearInterval(interval);
  }, [settings.isSyncEnabled, settings.syncId, settings.autoSync, localLastUpdated]);

  // Debounced auto-push on local changes
  useEffect(() => {
    if (!settings.isSyncEnabled || !settings.syncId) return;
    if (isSyncingFromCloudRef.current) return;
    
    const newTimestamp = new Date().toISOString();
    setLocalLastUpdated(newTimestamp);

    const timer = setTimeout(() => {
      pushToCloud(newTimestamp);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [
    expenses, contributions, inventory, budgets, history,
    shoppingList, wishlist, utilityReminders, gasLogs,
    waterLogs, deposits, maintenanceLogs, sharedAppliances,
    settings.currency, settings.pinnedCategories, settings.monthlyNotes, settings.carryOverBalances
  ]);

  // Auto-connect from URL Sync ID parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlSyncId = params.get('syncId');
    if (urlSyncId && urlSyncId !== settings.syncId) {
      console.log('Detected syncId in URL query, auto-connecting...', urlSyncId);
      enableSync(urlSyncId).then(success => {
        if (success) {
          // Remove query parameter from browser address bar
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }
      });
    }
  }, [settings.syncId]);

  // Handle dark mode side-effect
  useEffect(() => {
    const root = window.document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Computed Values
  const activeExpenses = expenses.filter(e => e.month === settings.currentMonth);
  const activeContributions = contributions.filter(c => c.month === settings.currentMonth);

  const carryOverAmount = (settings.carryOverBalances ? settings.carryOverBalances[settings.currentMonth] : 0) || 0;
  const newContributionsSum = activeContributions.reduce((sum, c) => sum + c.amount, 0);
  const totalCollected = carryOverAmount + newContributionsSum;

  const expensesFromFund = activeExpenses
    .filter(e => (e.paymentSource || 'Flat Fund') === 'Flat Fund')
    .reduce((sum, e) => sum + e.amount, 0);

  const expensesPersonal = activeExpenses
    .filter(e => e.paymentSource === 'Personal')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpensesAmount = activeExpenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingBalance = totalCollected - expensesFromFund;
  // Remaining balance is divided only among those who have contributed
  const activeContributorsCount = MEMBERS.filter(m => 
    activeContributions.some(c => c.member === m && c.amount > 0)
  ).length || 4;
  const remainingSharePerPerson = remainingBalance / activeContributorsCount;

  // Member statistics
  const memberStats = MEMBERS.reduce((acc, member) => {
    const contributed = activeContributions
      .filter(c => c.member === member)
      .reduce((sum, c) => sum + c.amount, 0);
    const spent = activeExpenses
      .filter(e => e.paidBy === member && e.paymentSource === 'Personal')
      .reduce((sum, e) => sum + e.amount, 0);
    
    // Peer-to-peer balance = what they paid out of pocket - their 1/4 share of total out-of-pocket expenses
    const personalShare = expensesPersonal / 4;
    const balance = spent - personalShare;
    const pendingContribution = Math.max(0, 2000 - contributed);
    const isContributionFullyPaid = contributed >= 2000;

    acc[member] = { contributed, spent, balance, pendingContribution, isContributionFullyPaid };
    return acc;
  }, {} as Record<MemberName, { contributed: number; spent: number; balance: number; pendingContribution: number; isContributionFullyPaid: boolean }>);

  // Settlement Matrix Calculation
  const settlements: Settlement[] = [];
  const debts = MEMBERS.map(member => ({
    member,
    balance: memberStats[member].balance
  }));

  // Debtors have balance < -0.01 (owe money)
  // Creditors have balance > 0.01 (receive money)
  const debtors = debts.filter(d => d.balance < -0.05).sort((a, b) => a.balance - b.balance);
  const creditors = debts.filter(c => c.balance > 0.05).sort((a, b) => b.balance - a.balance);

  let dIdx = 0;
  let cIdx = 0;

  // Clone to avoid mutation
  const tempDebtors = debtors.map(d => ({ ...d }));
  const tempCreditors = creditors.map(c => ({ ...c }));

  while (dIdx < tempDebtors.length && cIdx < tempCreditors.length) {
    const debtor = tempDebtors[dIdx];
    const creditor = tempCreditors[cIdx];

    const oweAmount = Math.abs(debtor.balance);
    const creditAmount = creditor.balance;

    const transferAmount = Math.min(oweAmount, creditAmount);
    
    settlements.push({
      from: debtor.member,
      to: creditor.member,
      amount: Math.round(transferAmount * 100) / 100
    });

    debtor.balance += transferAmount;
    creditor.balance -= transferAmount;

    if (Math.abs(debtor.balance) < 0.05) dIdx++;
    if (Math.abs(creditor.balance) < 0.05) cIdx++;
  }

  // Budget calculations
  const budgetUsage = (Object.keys(budgets) as ExpenseCategory[]).reduce((acc, cat) => {
    const limit = budgets[cat] || 0;
    const spent = activeExpenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0);
    const pct = limit > 0 ? (spent / limit) * 100 : 0;
    acc[cat] = { limit, spent, pct };
    return acc;
  }, {} as Record<ExpenseCategory, { limit: number; spent: number; pct: number }>);

  // Notification Alerts
  const notifications: { id: string; type: 'warning' | 'info' | 'danger' | 'success'; message: string; date: string }[] = [];
  const currentDateStr = new Date().toLocaleDateString();

  // 1. Budget Warnings
  Object.entries(budgetUsage).forEach(([cat, usage]) => {
    if (usage.spent > usage.limit && usage.limit > 0) {
      notifications.push({
        id: `budget-exceeded-${cat}`,
        type: 'danger',
        message: `Budget Exceeded! Spent ₹${usage.spent} on ${cat} (Limit: ₹${usage.limit})`,
        date: currentDateStr
      });
    } else if (usage.pct >= 85 && usage.limit > 0) {
      notifications.push({
        id: `budget-low-${cat}`,
        type: 'warning',
        message: `Budget Warning: ${cat} is at ${usage.pct.toFixed(0)}% of limit.`,
        date: currentDateStr
      });
    }
  });

  // 2. Low Stock Alerts
  inventory.forEach(item => {
    if (item.remainingQty <= item.lowStockAlert) {
      notifications.push({
        id: `low-stock-${item.id}`,
        type: 'danger',
        message: `Low Stock! ${item.item} is at ${item.remainingQty} ${item.unit}(s) (Alert at: ${item.lowStockAlert})`,
        date: currentDateStr
      });
    }
  });

  // 3. No Contribution check
  MEMBERS.forEach(m => {
    const hasContrib = activeContributions.some(c => c.member === m && c.amount > 0);
    if (!hasContrib) {
      notifications.push({
        id: `no-contrib-${m}`,
        type: 'warning',
        message: `No contribution recorded for ${m} in ${settings.currentMonth}.`,
        date: currentDateStr
      });
    }
  });

  // Actions
  const addExpense = (newExpense: Omit<Expense, 'id' | 'createdTime' | 'month'>) => {
    const id = `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const createdTime = new Date().toISOString();
    const expenseWithId: Expense = {
      ...newExpense,
      id,
      createdTime,
      month: settings.currentMonth
    };

    // Update inventory if it was a purchase
    if (expenseWithId.category === 'Groceries' || expenseWithId.category === 'Vegetables' || expenseWithId.category === 'Fruits') {
      const match = inventory.find(i => i.item.toLowerCase() === expenseWithId.itemName.toLowerCase());
      if (match) {
        // Try to parse purchased quantity from subCategory, description, or notes, or default to 1
        const parsedQty = parseFloat(expenseWithId.description.match(/(\d+(\.\d+)?)/)?.[0] || '1');
        updateInventoryItem(match.id, {
          purchasedQty: match.purchasedQty + parsedQty,
          remainingQty: match.remainingQty + parsedQty
        });
      }
    }

    setExpenses(prev => [expenseWithId, ...prev]);
  };

  const updateExpense = (id: string, updatedFields: Partial<Expense>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updatedFields } : e));
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const duplicateExpense = (id: string) => {
    const source = expenses.find(e => e.id === id);
    if (!source) return;
    const duplicated: Expense = {
      ...source,
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdTime: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0]
    };
    setExpenses(prev => [duplicated, ...prev]);
  };

  const addContribution = (newContrib: Omit<Contribution, 'id' | 'month'>) => {
    const id = `c-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const contributionWithId: Contribution = {
      ...newContrib,
      id,
      month: settings.currentMonth
    };
    setContributions(prev => [contributionWithId, ...prev]);
  };

  const updateContribution = (id: string, updatedFields: Partial<Contribution>) => {
    setContributions(prev => prev.map(c => c.id === id ? { ...c, ...updatedFields } : c));
  };

  const deleteContribution = (id: string) => {
    setContributions(prev => prev.filter(c => c.id !== id));
  };

  const addInventoryItem = (newItem: Omit<InventoryItem, 'id' | 'remainingQty'>) => {
    const id = `inv-${Date.now()}`;
    const itemWithId: InventoryItem = {
      ...newItem,
      id,
      remainingQty: newItem.openingQty + newItem.purchasedQty - newItem.usedQty
    };
    setInventory(prev => [...prev, itemWithId]);
  };

  const updateInventoryItem = (id: string, updatedFields: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const merged = { ...item, ...updatedFields };
        return {
          ...merged,
          remainingQty: merged.openingQty + merged.purchasedQty - merged.usedQty
        };
      }
      return item;
    }));
  };

  const deleteInventoryItem = (id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id));
  };

  const updateBudget = (category: ExpenseCategory, amount: number) => {
    setBudgets(prev => ({
      ...prev,
      [category]: amount
    }));
  };

  const updateSettings = (updatedFields: Partial<AppSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...updatedFields
    }));
  };

  const resetAllData = () => {
    localStorage.clear();
    setSettings(DEFAULT_SETTINGS);
    setExpenses([]);
    setContributions(DEFAULT_CONTRIBUTIONS(DEFAULT_SETTINGS.currentMonth));
    setInventory(DEFAULT_INVENTORY);
    setBudgets(DEFAULT_BUDGETS);
    setHistory([]);
    setShoppingList([]);
    setWishlist([]);
    setUtilityReminders([]);
    setGasLogs([]);
    setWaterLogs([]);
    setDeposits([]);
    setMaintenanceLogs([]);
    setSharedAppliances([]);
  };

  const exportBackup = (): string => {
    const data = {
      settings,
      expenses,
      contributions,
      inventory,
      budgets,
      history,
      shoppingList,
      wishlist,
      utilityReminders,
      gasLogs,
      waterLogs,
      deposits,
      maintenanceLogs,
      sharedAppliances
    };
    return JSON.stringify(data, null, 2);
  };

  const importBackup = (backupData: string): boolean => {
    try {
      const parsed = JSON.parse(backupData);
      if (parsed.settings) setSettings(parsed.settings);
      if (parsed.expenses) setExpenses(parsed.expenses);
      if (parsed.contributions) setContributions(parsed.contributions);
      if (parsed.inventory) setInventory(parsed.inventory);
      if (parsed.budgets) setBudgets(parsed.budgets);
      if (parsed.history) setHistory(parsed.history);
      if (parsed.shoppingList) setShoppingList(parsed.shoppingList);
      if (parsed.wishlist) setWishlist(parsed.wishlist);
      if (parsed.utilityReminders) setUtilityReminders(parsed.utilityReminders);
      if (parsed.gasLogs) setGasLogs(parsed.gasLogs);
      if (parsed.waterLogs) setWaterLogs(parsed.waterLogs);
      if (parsed.deposits) setDeposits(parsed.deposits);
      if (parsed.maintenanceLogs) setMaintenanceLogs(parsed.maintenanceLogs);
      if (parsed.sharedAppliances) setSharedAppliances(parsed.sharedAppliances);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const startNewMonth = (carryRemaining: boolean) => {
    const currentMonthStr = settings.currentMonth;
    const [year, month] = currentMonthStr.split('-').map(Number);
    
    // Calculate next month string
    let nextMonth = month + 1;
    let nextYear = year;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    const nextMonthStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}`;

    // 1. Archive current month summary
    const newHistoryEntry: MonthHistory = {
      month: currentMonthStr,
      totalFund: totalCollected,
      totalExpenses: totalExpensesAmount,
      remainingBalance,
      carriedOver: carryRemaining,
      settled: true,
      contributions: activeContributions,
      expensesCount: activeExpenses.length
    };

    // 2. Set carryover balance
    const carryAmount = carryRemaining ? remainingBalance : 0;

    // 3. Set next month contributions
    const nextMonthContributions = DEFAULT_CONTRIBUTIONS(nextMonthStr);

    setHistory(prev => [...prev, newHistoryEntry]);
    setContributions(prev => [...prev, ...nextMonthContributions]);
    
    // Reset inventory counts (opening = remaining)
    setInventory(prev => prev.map(item => ({
      ...item,
      openingQty: item.remainingQty,
      purchasedQty: 0,
      usedQty: 0,
      remainingQty: item.remainingQty
    })));

    // Update settings with new month and carryover records
    setSettings(prev => ({
      ...prev,
      currentMonth: nextMonthStr,
      carryOverBalances: {
        ...(prev.carryOverBalances || {}),
        [nextMonthStr]: carryAmount
      }
    }));
  };

  // Trackers Actions
  const addShoppingItem = (item: string, qty: string, notes?: string) => {
    const newItem: ShoppingItem = {
      id: `shop-${Date.now()}`,
      item,
      qty,
      completed: false,
      notes
    };
    setShoppingList(prev => [...prev, newItem]);
  };

  const toggleShoppingItem = (id: string) => {
    setShoppingList(prev => prev.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  };

  const deleteShoppingItem = (id: string) => {
    setShoppingList(prev => prev.filter(s => s.id !== id));
  };

  const clearCompletedShopping = () => {
    setShoppingList(prev => prev.filter(s => !s.completed));
  };

  const addWishlistItem = (item: string, cost: number, url?: string) => {
    const newItem: WishlistItem = {
      id: `wish-${Date.now()}`,
      item,
      estimatedCost: cost,
      url,
      pinned: false
    };
    setWishlist(prev => [...prev, newItem]);
  };

  const togglePinWishlist = (id: string) => {
    setWishlist(prev => prev.map(w => w.id === id ? { ...w, pinned: !w.pinned } : w));
  };

  const deleteWishlistItem = (id: string) => {
    setWishlist(prev => prev.filter(w => w.id !== id));
  };

  const addUtilityReminder = (reminder: Omit<UtilityReminder, 'id' | 'paid'>) => {
    const newReminder: UtilityReminder = {
      ...reminder,
      id: `util-${Date.now()}`,
      paid: false
    };
    setUtilityReminders(prev => [...prev, newReminder]);
  };

  const toggleUtilityReminder = (id: string) => {
    setUtilityReminders(prev => prev.map(u => u.id === id ? { ...u, paid: !u.paid } : u));
  };

  const deleteUtilityReminder = (id: string) => {
    setUtilityReminders(prev => prev.filter(u => u.id !== id));
  };

  const addGasLog = (log: Omit<GasCylinderLog, 'id'>) => {
    const newLog: GasCylinderLog = {
      ...log,
      id: `gas-${Date.now()}`
    };
    setGasLogs(prev => [newLog, ...prev]);
  };

  const toggleGasEmpty = (id: string) => {
    setGasLogs(prev => prev.map(g => g.id === id ? { ...g, empty: !g.empty } : g));
  };

  const deleteGasLog = (id: string) => {
    setGasLogs(prev => prev.filter(g => g.id !== id));
  };

  const addWaterLog = (log: Omit<WaterCanLog, 'id'>) => {
    const newLog: WaterCanLog = {
      ...log,
      id: `water-${Date.now()}`
    };
    setWaterLogs(prev => [newLog, ...prev]);
  };

  const deleteWaterLog = (id: string) => {
    setWaterLogs(prev => prev.filter(w => w.id !== id));
  };

  const addDeposit = (deposit: Omit<SecurityDeposit, 'id' | 'refunded'>) => {
    const newDeposit: SecurityDeposit = {
      ...deposit,
      id: `dep-${Date.now()}`,
      refunded: false
    };
    setDeposits(prev => [...prev, newDeposit]);
  };

  const toggleDepositRefunded = (id: string) => {
    setDeposits(prev => prev.map(d => d.id === id ? { ...d, refunded: !d.refunded } : d));
  };

  const deleteDeposit = (id: string) => {
    setDeposits(prev => prev.filter(d => d.id !== id));
  };

  const addMaintenanceLog = (log: Omit<RoomMaintenanceLog, 'id' | 'resolved'>) => {
    const newLog: RoomMaintenanceLog = {
      ...log,
      id: `maint-${Date.now()}`,
      resolved: false
    };
    setMaintenanceLogs(prev => [...prev, newLog]);
  };

  const toggleMaintenanceResolved = (id: string) => {
    setMaintenanceLogs(prev => prev.map(m => m.id === id ? { ...m, resolved: !m.resolved } : m));
  };

  const deleteMaintenanceLog = (id: string) => {
    setMaintenanceLogs(prev => prev.filter(m => m.id !== id));
  };

  const addSharedAppliance = (appliance: Omit<SharedAppliance, 'id'>) => {
    const newAppliance: SharedAppliance = {
      ...appliance,
      id: `app-${Date.now()}`
    };
    setSharedAppliances(prev => [...prev, newAppliance]);
  };

  const deleteSharedAppliance = (id: string) => {
    setSharedAppliances(prev => prev.filter(a => a.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        settings,
        expenses,
        contributions,
        inventory,
        budgets,
        history,
        shoppingList,
        wishlist,
        utilityReminders,
        gasLogs,
        waterLogs,
        deposits,
        maintenanceLogs,
        sharedAppliances,
        
        // Actions
        addExpense,
        updateExpense,
        deleteExpense,
        duplicateExpense,
        addContribution,
        updateContribution,
        deleteContribution,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        updateBudget,
        updateSettings,
        resetAllData,
        exportBackup,
        importBackup,
        startNewMonth,
        
        // Trackers
        addShoppingItem,
        toggleShoppingItem,
        deleteShoppingItem,
        clearCompletedShopping,
        addWishlistItem,
        togglePinWishlist,
        deleteWishlistItem,
        addUtilityReminder,
        toggleUtilityReminder,
        deleteUtilityReminder,
        addGasLog,
        toggleGasEmpty,
        deleteGasLog,
        addWaterLog,
        deleteWaterLog,
        addDeposit,
        toggleDepositRefunded,
        deleteDeposit,
        addMaintenanceLog,
        toggleMaintenanceResolved,
        deleteMaintenanceLog,
        addSharedAppliance,
        deleteSharedAppliance,

        // Sync states & actions
        isSyncing,
        syncError,
        lastSyncedTime,
        enableSync,
        disableSync,
        createSyncGroup,
        pushToCloud,
        pullFromCloud,

        // Computed
        activeExpenses,
        activeContributions,
        totalCollected,
        totalExpensesAmount,
        remainingBalance,
        remainingSharePerPerson,
        settlements,
        budgetUsage,
        memberStats,
        notifications
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
