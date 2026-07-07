import React from 'react';
import { useApp } from '../AppContext';
import { ArrowRightLeft, ArrowUpRight, ArrowDownLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import type { MemberName } from '../types';

export const Settlement: React.FC = () => {
  const { settings, memberStats, settlements, totalCollected, totalExpensesAmount } = useApp();

  const formatCurrency = (val: number) => {
    return settings.currency + ' ' + Math.round(val).toLocaleString('en-IN');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settlement Center</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Peer-to-peer balances, out-of-pocket expenses, and optimized debt settlement transfers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Balances Overview Grid */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm lg:col-span-2 space-y-6">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Individual Account Balances
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Object.keys(memberStats) as MemberName[]).map(member => {
              const stats = memberStats[member];
              const isOwed = stats.balance > 0;
              const isSettled = Math.abs(stats.balance) < 0.05;

              return (
                <div
                  key={member}
                  className={`p-5 rounded-2xl border transition-all duration-350 flex flex-col justify-between relative overflow-hidden ${
                    isSettled
                      ? 'border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/10'
                      : isOwed
                      ? 'border-emerald-200 dark:border-emerald-900/30 bg-emerald-50/20 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300'
                      : 'border-rose-200 dark:border-rose-900/30 bg-rose-50/20 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">{member}</h4>
                      <p className="text-xs text-slate-500 mt-1">Flatmate Account</p>
                    </div>
                    {isSettled ? (
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold px-2 py-1 rounded-md uppercase">
                        Fully Settled
                      </span>
                    ) : isOwed ? (
                      <span className="bg-emerald-100/80 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-md uppercase flex items-center gap-1">
                        <ArrowUpRight size={12} />
                        To Receive
                      </span>
                    ) : (
                      <span className="bg-rose-100/80 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[10px] font-bold px-2 py-1 rounded-md uppercase flex items-center gap-1">
                        <ArrowDownLeft size={12} />
                        Owes Money
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-6 border-t border-slate-200/60 dark:border-slate-800/60 pt-4 text-xs text-slate-500 dark:text-slate-400">
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-slate-400">Fund Contribution</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(stats.contributed)}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-slate-400">Out-of-pocket Bills</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(stats.spent)}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 flex justify-between items-center border-t border-dashed border-slate-200/60 dark:border-slate-800/40">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Net Standing:</span>
                    <span className={`text-base font-extrabold ${isSettled ? 'text-slate-500' : isOwed ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {isSettled ? '₹ 0' : isOwed ? `+ ${formatCurrency(stats.balance)}` : `- ${formatCurrency(Math.abs(stats.balance))}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Peer to Peer Transfers Plan */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <ArrowRightLeft size={16} className="text-violet-500" />
              <span>Optimized Settlements</span>
            </h3>

            {settlements.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Perfect Settlement</h4>
                  <p className="text-xs text-slate-400 mt-1">All flat shares and contributions are fully balanced!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {settlements.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/40 dark:bg-slate-950/20 flex items-center justify-between transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-rose-500 dark:text-rose-400">{s.from}</span>
                        <span className="text-slate-400 text-[10px]">pays</span>
                        <span className="font-bold text-xs text-emerald-500 dark:text-emerald-400">{s.to}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Direct peer transfer</p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(s.amount)}
                      </span>
                      <span className="block text-[9px] text-slate-400">Settles share</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-400 space-y-2">
            <div className="flex justify-between">
              <span>Combined Fund Pool:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-350">{formatCurrency(totalCollected)}</span>
            </div>
            <div className="flex justify-between">
              <span>Flat Expenditures:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-350">{formatCurrency(totalExpensesAmount)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Settlement Guide Banner */}
      <div className="bg-indigo-50/40 dark:bg-indigo-950/10 border border-indigo-100/80 dark:border-indigo-900/30 rounded-2xl p-5 flex items-start gap-4">
        <AlertCircle size={20} className="text-indigo-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm text-indigo-950 dark:text-indigo-300">How Settlement Works</h4>
          <p className="text-xs text-indigo-700/80 dark:text-indigo-400/80 mt-1 leading-relaxed">
            The settlement algorithm computes the total net financial input of each member: 
            <strong> (Contribution + Direct Bill Payments)</strong>. It then compares this against their fair 1/4 share of the combined pool 
            <strong> (Total Fund + Direct Bill Payments) / 4</strong>. Debtors are automatically matched with creditors to minimize the number of overall bank/UPI transactions required.
          </p>
        </div>
      </div>

    </div>
  );
};
