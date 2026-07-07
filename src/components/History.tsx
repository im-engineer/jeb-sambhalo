import React, { useState, useMemo } from 'react';
import { useApp } from '../AppContext';
import { Search, Eye, Calendar, Clock } from 'lucide-react';

export const History: React.FC = () => {
  const { expenses, contributions, settings, updateSettings, history } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('All');

  const formatCurrency = (val: number) => {
    return settings.currency + ' ' + Math.round(val).toLocaleString('en-IN');
  };

  // Compile real-time summaries for ALL months that have data
  const monthsSummaries = useMemo(() => {
    const set = new Set<string>();
    set.add(settings.currentMonth);
    expenses.forEach(e => set.add(e.month));
    contributions.forEach(c => set.add(c.month));
    history.forEach(h => set.add(h.month));
    
    const months = Array.from(set).sort((a, b) => b.localeCompare(a));
    
    return months.map(m => {
      const monthExpenses = expenses.filter(e => e.month === m);
      const monthContributions = contributions.filter(c => c.month === m);
      
      const carryOver = (settings.carryOverBalances ? settings.carryOverBalances[m] : 0) || 0;
      const newContribs = monthContributions.reduce((sum, c) => sum + c.amount, 0);
      const totalFund = carryOver + newContribs;
      
      const expensesFromFund = monthExpenses
        .filter(e => (e.paymentSource || 'Flat Fund') === 'Flat Fund')
        .reduce((sum, e) => sum + e.amount, 0);
        
      const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
      const remainingBalance = totalFund - expensesFromFund;
      
      return {
        month: m,
        totalFund,
        totalExpenses,
        remainingBalance,
        expensesCount: monthExpenses.length,
        isActive: m === settings.currentMonth
      };
    });
  }, [expenses, contributions, settings.currentMonth, settings.carryOverBalances, history]);

  // Unique years list for filtering
  const uniqueYears = useMemo(() => {
    const years = new Set<string>();
    monthsSummaries.forEach(s => {
      const year = s.month.split('-')[0];
      years.add(year);
    });
    return Array.from(years);
  }, [monthsSummaries]);

  // Filter list
  const filteredHistory = useMemo(() => {
    return monthsSummaries.filter(h => {
      const [year, monthNum] = h.month.split('-');
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const monthName = monthNames[Number(monthNum) - 1] || '';
      
      const matchesSearch =
        h.month.includes(searchTerm) ||
        monthName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesYear = yearFilter === 'All' || year === yearFilter;

      return matchesSearch && matchesYear;
    });
  }, [monthsSummaries, searchTerm, yearFilter]);

  const loadMonthWorkspace = (monthStr: string) => {
    updateSettings({ currentMonth: monthStr });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Month Workspaces History</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Browse monthly workspaces. View real-time sums for both active and historical periods.
        </p>
      </div>

      {/* Filter panel */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row gap-4 items-center">
        
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search month name (e.g. July, 2026)..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600/50"
          />
        </div>

        {/* Year filter select */}
        <div className="w-full sm:w-44 flex items-center gap-2 text-xs shrink-0">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] whitespace-nowrap">Filter Year:</span>
          <select
            value={yearFilter}
            onChange={e => setYearFilter(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent font-semibold cursor-pointer text-xs"
          >
            <option value="All">All Years</option>
            {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

      </div>

      {/* History Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredHistory.length === 0 ? (
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-12 text-center col-span-full text-slate-400">
            No workspaces matching filters.
          </div>
        ) : (
          filteredHistory.map(h => (
            <div
              key={h.month}
              className={`bg-white dark:bg-slate-900/60 border rounded-2xl p-5 hover-card shadow-xs flex flex-col justify-between transition-all ${
                h.isActive 
                  ? 'border-indigo-500/60 ring-2 ring-indigo-500/10 bg-gradient-to-tr from-indigo-500/5 to-transparent' 
                  : 'border-slate-200/80 dark:border-slate-800/80'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${h.isActive ? 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-500' : 'bg-slate-50 dark:bg-slate-950/20 text-slate-400'}`}>
                    <Calendar size={18} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{h.month}</h3>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5 font-bold">
                      {h.isActive ? 'Current Active Period' : 'Closed Archive'}
                    </p>
                  </div>
                </div>
                
                {h.isActive ? (
                  <span className="bg-indigo-105 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase flex items-center gap-1">
                    <Clock size={10} />
                    <span>Active</span>
                  </span>
                ) : (
                  <span className="bg-slate-100 text-slate-650 dark:bg-slate-850 dark:text-slate-400 text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase">
                    Archived
                  </span>
                )}
              </div>

              {/* Summary Stats list */}
              <div className="space-y-2 mt-5 border-t border-b border-slate-100 dark:border-slate-800/60 py-3.5 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Total Fund Pool:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(h.totalFund)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Expenditures:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(h.totalExpenses)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Remaining Balance:</span>
                  <span className="text-emerald-500">{formatCurrency(h.remainingBalance)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 border-t border-dashed border-slate-200/65 dark:border-slate-800/40 pt-2">
                  <span>Transactions count:</span>
                  <span>{h.expensesCount} logged</span>
                </div>
              </div>

              {/* Load workspace button */}
              <button
                onClick={() => loadMonthWorkspace(h.month)}
                disabled={h.isActive}
                className={`mt-4 w-full flex items-center justify-center gap-1.5 py-2 border rounded-xl text-xs font-bold transition-all shadow-xs ${
                  h.isActive 
                    ? 'border-indigo-200/50 bg-indigo-50/30 text-indigo-400 dark:border-indigo-950/20 dark:bg-indigo-950/5 cursor-not-allowed'
                    : 'border-slate-200 dark:border-slate-850 hover:bg-indigo-650 hover:text-white hover:border-indigo-650 cursor-pointer bg-white dark:bg-slate-900'
                }`}
              >
                <Eye size={13} />
                <span>{h.isActive ? 'Currently Active' : 'Load Workspace'}</span>
              </button>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
