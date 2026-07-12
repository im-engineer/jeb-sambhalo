import React from 'react';
import { useApp } from '../AppContext';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  Percent,
  ShoppingCart,
  Wrench,
  HelpCircle,
  Star,
  Zap
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from 'recharts';
import type { ExpenseCategory } from '../types';

export const Dashboard: React.FC = () => {
  const { settings, activeExpenses, totalCollected, totalExpensesAmount, remainingBalance, remainingSharePerPerson, budgets } = useApp();

  const formatCurrency = (val: number) => {
    return settings.currency + ' ' + Math.round(val).toLocaleString('en-IN');
  };

  // 1. Calculations
  const expenseCount = activeExpenses.length;
  
  // Budget Used %
  const totalBudgetLimit = Object.values(budgets).reduce((sum, b) => sum + b, 0);
  const budgetUsedPct = totalBudgetLimit > 0 ? (totalExpensesAmount / totalBudgetLimit) * 100 : 0;

  // Average Daily Spending
  const today = new Date();
  const isCurrentMonth = settings.currentMonth === today.toISOString().substring(0, 7);
  const daysInMonth = isCurrentMonth ? today.getDate() : 30;
  const avgDailySpending = totalExpensesAmount / Math.max(daysInMonth, 1);

  // Highest Expense
  const highestExpense = activeExpenses.reduce((max, e) => e.amount > max ? e.amount : max, 0);

  // Today's Expense
  const todayStr = today.toISOString().split('T')[0];
  const todaysExpense = activeExpenses
    .filter(e => e.date === todayStr)
    .reduce((sum, e) => sum + e.amount, 0);

  // Categories breakdowns
  const groceryCategories: ExpenseCategory[] = ['Groceries', 'Vegetables', 'Fruits', 'Milk', 'Breakfast', 'Snacks'];
  const utilitiesCategories: ExpenseCategory[] = ['Gas', 'Electricity', 'Internet', 'Water', 'Rent', 'Maintenance'];
  
  const totalGrocery = activeExpenses
    .filter(e => groceryCategories.includes(e.category))
    .reduce((sum, e) => sum + e.amount, 0);

  const totalUtilities = activeExpenses
    .filter(e => utilitiesCategories.includes(e.category))
    .reduce((sum, e) => sum + e.amount, 0);

  const totalMiscellaneous = activeExpenses
    .filter(e => !groceryCategories.includes(e.category) && !utilitiesCategories.includes(e.category))
    .reduce((sum, e) => sum + e.amount, 0);

  const monthlySavings = remainingBalance;

  // 2. Charts Data
  // A. Pie Chart (Category Wise)
  const categoryDataMap = activeExpenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const COLORS = [
    '#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
    '#ec4899', '#8b5cf6', '#06b6d4', '#14b8a6', '#84cc16',
    '#a855f7', '#f43f5e', '#d946ef', '#64748b', '#059669'
  ];

  const pieChartData = Object.entries(categoryDataMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // B. Weekly Spending Bar Chart
  const weeklyData = [
    { name: 'Week 1', amount: 0 },
    { name: 'Week 2', amount: 0 },
    { name: 'Week 3', amount: 0 },
    { name: 'Week 4', amount: 0 },
    { name: 'Week 5', amount: 0 },
  ];

  activeExpenses.forEach(exp => {
    const day = new Date(exp.date).getDate();
    if (day <= 7) weeklyData[0].amount += exp.amount;
    else if (day <= 14) weeklyData[1].amount += exp.amount;
    else if (day <= 21) weeklyData[2].amount += exp.amount;
    else if (day <= 28) weeklyData[3].amount += exp.amount;
    else weeklyData[4].amount += exp.amount;
  });

  // C. Daily Spending Trend Line Chart
  const lastDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const dailySpendingMap = activeExpenses.reduce((acc, exp) => {
    const day = new Date(exp.date).getDate();
    acc[day] = (acc[day] || 0) + exp.amount;
    return acc;
  }, {} as Record<number, number>);

  let cumulativeSum = 0;
  const lineChartData = lastDays.map(day => {
    const spent = dailySpendingMap[day] || 0;
    cumulativeSum += spent;
    return {
      day: `Day ${day}`,
      'Daily Spent': spent,
      'Cumulative Spent': cumulativeSum,
    };
  });

  // Chart Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 text-white p-3 border border-slate-700/50 rounded-xl shadow-xl backdrop-blur-md text-xs">
          <p className="font-semibold mb-1 text-slate-300">{label}</p>
          {payload.map((pld: any, index: number) => (
            <p key={index} className="font-medium" style={{ color: pld.color }}>
              {pld.name}: {formatCurrency(pld.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Active Month Summary</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Real-time statistics for {settings.currentMonth}</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold bg-white dark:bg-slate-900 px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
          <Calendar size={14} className="text-indigo-500" />
          <span className="text-slate-600 dark:text-slate-400">Current Date:</span>
          <span>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Grid: 4 Core Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Fund */}
        <div className="premium-card p-6 flex flex-col justify-between min-h-[140px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none" />
          <div>
            <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold tracking-wider uppercase mb-1 block">Total Fund Collected</span>
            <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-heading">{formatCurrency(totalCollected)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-4">
            <TrendingUp size={14} />
            <span>Preloaded: {formatCurrency(8000)} (editable)</span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="premium-card p-6 flex flex-col justify-between min-h-[140px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-rose-500/10 to-transparent rounded-bl-full pointer-events-none" />
          <div>
            <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold tracking-wider uppercase mb-1 block">Total Expenses</span>
            <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-heading">{formatCurrency(totalExpensesAmount)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-semibold mt-4">
            <TrendingDown size={14} />
            <span>{expenseCount} transactions logged</span>
          </div>
        </div>

        {/* Remaining Balance */}
        <div className="premium-card p-6 flex flex-col justify-between min-h-[140px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none" />
          <div>
            <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold tracking-wider uppercase mb-1 block">Remaining Fund Balance</span>
            <span className={`text-3xl font-extrabold tracking-tight font-heading ${remainingBalance < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
              {formatCurrency(remainingBalance)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold mt-4 text-emerald-600 dark:text-emerald-400">
            <Activity size={14} />
            <span>Savings: {formatCurrency(monthlySavings)}</span>
          </div>
        </div>

        {/* Share per Person */}
        <div className="premium-card p-6 flex flex-col justify-between min-h-[140px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-500/10 to-transparent rounded-bl-full pointer-events-none" />
          <div>
            <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold tracking-wider uppercase mb-1 block">Remaining Per Person</span>
            <span className={`text-3xl font-extrabold tracking-tight font-heading ${remainingSharePerPerson < 0 ? 'text-rose-500' : 'text-indigo-500'}`}>
              {formatCurrency(remainingSharePerPerson)}
            </span>
          </div>
          <p className="text-[10px] text-slate-450 dark:text-slate-450 mt-4 font-semibold">
            To be received equally by {Object.values(useApp().memberStats).filter(s => s.contributed > 0).length || 4} paid flatmate(s)
          </p>
        </div>

      </div>

      {/* Grid: 6 Secondary Stats (Dashboard Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        
        {/* Budget Used % */}
        <div className="premium-card p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-400 dark:text-slate-500 mb-2">
            <span className="text-[9px] font-bold uppercase tracking-wider">Budget Used</span>
            <Percent size={13} />
          </div>
          <span className="text-xl font-bold leading-tight">{budgetUsedPct.toFixed(0)}%</span>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${budgetUsedPct > 100 ? 'bg-red-500' : 'bg-violet-600'}`}
              style={{ width: `${Math.min(budgetUsedPct, 100)}%` }}
            />
          </div>
        </div>

        {/* Avg Daily Spending */}
        <div className="premium-card p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-400 dark:text-slate-500 mb-2">
            <span className="text-[9px] font-bold uppercase tracking-wider">Daily Average</span>
            <TrendingUp size={13} />
          </div>
          <span className="text-xl font-bold leading-tight">{formatCurrency(avgDailySpending)}</span>
          <span className="text-[9px] text-slate-400 mt-2 font-medium">Over {daysInMonth} days</span>
        </div>

        {/* Highest Expense */}
        <div className="premium-card p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-400 dark:text-slate-500 mb-2">
            <span className="text-[9px] font-bold uppercase tracking-wider">Highest Cost</span>
            <Star size={13} className="text-amber-500" />
          </div>
          <span className="text-xl font-bold leading-tight">{formatCurrency(highestExpense)}</span>
          <span className="text-[9px] text-slate-400 mt-2 font-medium">Single max txn</span>
        </div>

        {/* Today's Expense */}
        <div className="premium-card p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-400 dark:text-slate-500 mb-2">
            <span className="text-[9px] font-bold uppercase tracking-wider">Today's Spend</span>
            <Zap size={13} className="text-indigo-500" />
          </div>
          <span className="text-xl font-bold leading-tight">{formatCurrency(todaysExpense)}</span>
          <span className="text-[9px] text-slate-400 mt-2 font-medium">Spent today</span>
        </div>

        {/* Total Grocery */}
        <div className="premium-card p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-400 dark:text-slate-500 mb-2">
            <span className="text-[9px] font-bold uppercase tracking-wider">Total Groceries</span>
            <ShoppingCart size={13} className="text-emerald-500" />
          </div>
          <span className="text-xl font-bold leading-tight">{formatCurrency(totalGrocery)}</span>
          <span className="text-[9px] text-slate-400 mt-2 font-medium">Fruits, milk, etc.</span>
        </div>

        {/* Total Utilities */}
        <div className="premium-card p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-400 dark:text-slate-500 mb-2">
            <span className="text-[9px] font-bold uppercase tracking-wider">Total Utilities</span>
            <Wrench size={13} className="text-blue-500" />
          </div>
          <span className="text-xl font-bold leading-tight">{formatCurrency(totalUtilities)}</span>
          <span className="text-[9px] text-slate-400 mt-2 font-medium">Bills, Gas, Water</span>
        </div>

        {/* Total Miscellaneous */}
        <div className="premium-card p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-400 dark:text-slate-500 mb-2">
            <span className="text-[9px] font-bold uppercase tracking-wider">Total Misc</span>
            <HelpCircle size={13} className="text-slate-500" />
          </div>
          <span className="text-xl font-bold leading-tight">{formatCurrency(totalMiscellaneous)}</span>
          <span className="text-[9px] text-slate-400 mt-2 font-medium">Other spends</span>
        </div>

      </div>

      {/* Grid: Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Spending & Cumulative trend */}
        <div className="premium-card p-6 lg:col-span-2">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-550 mb-4 uppercase tracking-wider">Daily Spending & Monthly Trend</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={settings.theme === 'dark' ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Daily Spent" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 6 }} dot={false} />
                <Line type="monotone" dataKey="Cumulative Spent" stroke="#8b5cf6" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown (Pie Chart) */}
        <div className="premium-card p-6">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-550 mb-4 uppercase tracking-wider">Category-wise Breakdown</h3>
          <div className="h-72 w-full flex flex-col justify-between">
            {pieChartData.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs">
                <span>No expense data logged yet</span>
              </div>
            ) : (
              <>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieChartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* List Top Categories with Legend indicators */}
                <div className="max-h-24 overflow-y-auto space-y-1.5 mt-2 pr-1">
                  {pieChartData.slice(0, 4).map((entry, index) => (
                    <div key={entry.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="truncate max-w-[120px] font-medium">{entry.name}</span>
                      </div>
                      <span className="font-semibold">{formatCurrency(entry.value)}</span>
                    </div>
                  ))}
                  {pieChartData.length > 4 && (
                    <p className="text-[10px] text-center text-slate-400 mt-1">
                      + {pieChartData.length - 4} other categories
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Grid: Bottom Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Weekly Spending Bar Chart */}
        <div className="premium-card p-6">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-550 mb-4 uppercase tracking-wider">Weekly Spending</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={settings.theme === 'dark' ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" fill="#6366f1" radius={[8, 8, 0, 0]}>
                  {weeklyData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 4 ? '#8b5cf6' : '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Member Balances & Spending Summary */}
        <div className="premium-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-550 mb-4 uppercase tracking-wider">Flatmate Financial Summary</h3>
            <div className="space-y-4">
              {Object.entries(useApp().memberStats).map(([name, stats]) => {
                const isOwed = stats.balance > 0;
                return (
                  <div key={name} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 last:border-0 last:pb-0">
                    <div>
                      <h4 className="font-semibold text-sm">{name}</h4>
                      <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-slate-400 mt-0.5">
                        <span>Funded: {formatCurrency(stats.contributed)}</span>
                        {!stats.isContributionFullyPaid && (
                          <span className="text-amber-500 font-semibold">(₹{stats.pendingContribution} pending)</span>
                        )}
                        <span>•</span>
                        <span>Paid Direct: {formatCurrency(stats.spent)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold block ${isOwed ? 'text-emerald-500' : stats.balance === 0 ? 'text-slate-500' : 'text-rose-500'}`}>
                        {isOwed ? `+ ${formatCurrency(stats.balance)}` : stats.balance === 0 ? 'Settled' : `- ${formatCurrency(Math.abs(stats.balance))}`}
                      </span>
                      <span className="text-[10px] text-slate-400">{isOwed ? 'Receives' : stats.balance === 0 ? 'No balance' : 'Owes'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Splitting Formula</span>
            <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md font-semibold">
              Equal 1/4 share per flatmate
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
