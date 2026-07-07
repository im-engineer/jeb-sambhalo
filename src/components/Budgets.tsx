import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { PiggyBank, Edit3, AlertCircle, Sparkles } from 'lucide-react';
import type { ExpenseCategory } from '../types';
import { CATEGORIES } from '../types';

export const Budgets: React.FC = () => {
  const { settings, budgetUsage, updateBudget } = useApp();
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [editLimit, setEditLimit] = useState<number | ''>('');

  const formatCurrency = (val: number) => {
    return settings.currency + ' ' + Math.round(val).toLocaleString('en-IN');
  };

  const handleStartEdit = (cat: ExpenseCategory, limit: number) => {
    setEditingCategory(cat);
    setEditLimit(limit);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      updateBudget(editingCategory, Number(editLimit) || 0);
      setEditingCategory(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Budget Planner</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Set and monitor category limits. Progress bars automatically turn red when budget is exceeded.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Budgets Progress List */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm lg:col-span-2 space-y-6">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Active Category Budgets
          </h3>

          <div className="space-y-5">
            {CATEGORIES.map(cat => {
              const usage = budgetUsage[cat] || { limit: 0, spent: 0, pct: 0 };
              const remaining = usage.limit - usage.spent;
              const isOver = usage.spent > usage.limit && usage.limit > 0;
              const hasBudget = usage.limit > 0;

              return (
                <div
                  key={cat}
                  className={`p-4 rounded-xl border transition-all ${
                    isOver
                      ? 'bg-rose-50/20 border-rose-200/60 dark:bg-rose-950/5 dark:border-rose-900/30'
                      : 'bg-slate-50/20 border-slate-100 dark:bg-slate-900/10 dark:border-slate-800/40'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{cat}</span>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                        <span>Spent: {formatCurrency(usage.spent)}</span>
                        <span>/</span>
                        <span>Limit: {hasBudget ? formatCurrency(usage.limit) : 'No limit set'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {hasBudget && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          isOver
                            ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-450'
                            : 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400'
                        }`}>
                          {usage.pct.toFixed(0)}% Used
                        </span>
                      )}
                      <button
                        onClick={() => handleStartEdit(cat, usage.limit)}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      >
                        <Edit3 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {hasBudget ? (
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-red-500' : 'bg-indigo-600'}`}
                        style={{ width: `${Math.min(usage.pct, 100)}%` }}
                      />
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 italic">
                      Configure a budget limit to monitor progress.
                    </div>
                  )}

                  {/* Remaining Indicators */}
                  {hasBudget && (
                    <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-medium">
                      <span>{isOver ? 'Over budget by' : 'Remaining budget'}</span>
                      <span className={isOver ? 'text-rose-500 font-bold' : 'text-emerald-500 font-bold'}>
                        {formatCurrency(Math.abs(remaining))}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Edit Budget Form / Info Sidebar */}
        <div className="space-y-6">
          
          {editingCategory ? (
            <div className="bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-500" />
                <span>Adjust Budget Limit</span>
              </h3>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Category</label>
                  <input
                    type="text"
                    readOnly
                    value={editingCategory}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-100 dark:bg-slate-950/20 text-slate-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Limit Amount ({settings.currency})</label>
                  <input
                    type="number"
                    required
                    placeholder="Enter limit"
                    value={editLimit}
                    onChange={e => setEditLimit(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-transparent font-extrabold"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingCategory(null)}
                    className="flex-1 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 shadow-sm"
                  >
                    Save Limit
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">
                Overview Status
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 rounded-xl shrink-0 mt-0.5">
                    <PiggyBank size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-950 dark:text-white">Active Monthly Budgets</h4>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      Budgets are checked against logged expenses on a per-month basis. Setting a budget helps monitor flatmate spending limits.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <div className="p-2 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-xl shrink-0 mt-0.5">
                    <AlertCircle size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-950 dark:text-white">Over Budget Trigger</h4>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      If category spending exceeds the configured budget limit, the indicator changes to red and fires a system notification.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
