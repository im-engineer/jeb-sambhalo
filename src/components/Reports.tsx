import React, { useMemo } from 'react';
import { useApp } from '../AppContext';
import { Download, Printer, TrendingUp, Award, Coins } from 'lucide-react';
import { MEMBERS } from '../types';

export const Reports: React.FC = () => {
  const {
    settings,
    activeExpenses,
    totalCollected,
    totalExpensesAmount,
    remainingBalance,
    settlements,
    memberStats
  } = useApp();

  const formatCurrency = (val: number) => {
    return settings.currency + ' ' + Math.round(val).toLocaleString('en-IN');
  };

  // 1. Core Analytics Calculations
  const metrics = useMemo(() => {
    const txCount = activeExpenses.length;
    const savings = remainingBalance;
    const perPersonSpending = totalExpensesAmount / 4;

    // Highest & Lowest Expenses
    let highestExp = { itemName: 'None', amount: 0 };
    let lowestExp = { itemName: 'None', amount: Infinity };

    activeExpenses.forEach(e => {
      if (e.amount > highestExp.amount) {
        highestExp = { itemName: e.itemName, amount: e.amount };
      }
      if (e.amount < lowestExp.amount) {
        lowestExp = { itemName: e.itemName, amount: e.amount };
      }
    });

    if (txCount === 0) {
      lowestExp.amount = 0;
    }

    const avgExpense = txCount > 0 ? totalExpensesAmount / txCount : 0;

    // Top spending category
    const catMap: Record<string, number> = {};
    activeExpenses.forEach(e => {
      catMap[e.category] = (catMap[e.category] || 0) + e.amount;
    });
    
    let topCategory = 'None';
    let topCatAmount = 0;
    Object.entries(catMap).forEach(([cat, amt]) => {
      if (amt > topCatAmount) {
        topCategory = cat;
        topCatAmount = amt;
      }
    });

    // Payment method frequency
    const payMap: Record<string, number> = {};
    activeExpenses.forEach(e => {
      payMap[e.paymentMethod] = (payMap[e.paymentMethod] || 0) + e.amount;
    });

    return {
      txCount,
      savings,
      perPersonSpending,
      highestExp,
      lowestExp: lowestExp.amount === Infinity ? { itemName: 'None', amount: 0 } : lowestExp,
      avgExpense,
      topCategory,
      topCatAmount,
      payMap
    };
  }, [activeExpenses, remainingBalance, totalExpensesAmount]);

  // Export handlers
  const exportExcel = () => {
    const headers = ['Metric', 'Value'];
    const data = [
      ['Report Month', settings.currentMonth],
      ['Total Fund Collected', totalCollected],
      ['Total Expenditures', totalExpensesAmount],
      ['Net Savings', metrics.savings],
      ['Top Category', metrics.topCategory],
      ['Top Category Cost', metrics.topCatAmount],
      ['Highest Single Expense', `${metrics.highestExp.itemName} (${metrics.highestExp.amount})`],
      ['Lowest Single Expense', `${metrics.lowestExp.itemName} (${metrics.lowestExp.amount})`],
      ['Average Transaction Cost', metrics.avgExpense],
      ['Total Transactions Logged', metrics.txCount],
      ['Per Person Share of Expense', metrics.perPersonSpending]
    ];

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(','), ...data.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `flat_monthly_report_${settings.currentMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const contribRows = MEMBERS.map(m => {
      const stats = memberStats[m];
      return `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">${m}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">₹${stats.contributed}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">₹${stats.spent}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">₹${Math.round(stats.balance)}</td>
        </tr>
      `;
    }).join('');

    const settlementRows = settlements.map(s => `
      <li>${s.from} pays ${s.to} <strong>₹${s.amount}</strong></li>
    `).join('') || '<li>No settlement actions needed.</li>';

    printWindow.document.write(`
      <html>
        <head>
          <title>Monthly Expense Report - ${settings.currentMonth}</title>
          <style>
            body { font-family: sans-serif; padding: 30px; color: #333; line-height: 1.6; }
            h2 { color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
            .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-top: 20px; }
            .card { border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
            th { background-color: #f8fafc; }
          </style>
        </head>
        <body>
          <h2>Jeb Sambhalo Manager - Month End Report (${settings.currentMonth})</h2>
          
          <div class="grid">
            <div class="card">
              <h3>Financial Metrics</h3>
              <p><strong>Total Fund Pool:</strong> ₹${totalCollected}</p>
              <p><strong>Total Expenses:</strong> ₹${totalExpensesAmount}</p>
              <p><strong>Month Savings:</strong> ₹${metrics.savings}</p>
              <p><strong>Per Person Share:</strong> ₹${metrics.perPersonSpending}</p>
            </div>
            <div class="card">
              <h3>Expense Highlights</h3>
              <p><strong>Top Spending Category:</strong> ${metrics.topCategory} (₹${metrics.topCatAmount})</p>
              <p><strong>Highest Expense:</strong> ${metrics.highestExp.itemName} (₹${metrics.highestExp.amount})</p>
              <p><strong>Average Expense Cost:</strong> ₹${Math.round(metrics.avgExpense)}</p>
              <p><strong>Number of Transactions:</strong> ${metrics.txCount}</p>
            </div>
          </div>

          <h3>Contributions & Direct Spend Breakdown</h3>
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Contributions Paid</th>
                <th>Direct Bill Payments</th>
                <th>Net Standing</th>
              </tr>
            </thead>
            <tbody>
              ${contribRows}
            </tbody>
          </table>

          <h3>Settlements Matrix Plan</h3>
          <ul>
            ${settlementRows}
          </ul>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Monthly Reports & Statistics</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Generate and export monthly expense sheets, summaries and transaction stats.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportExcel}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs bg-white dark:bg-slate-900"
          >
            <Download size={14} />
            <span>Export Excel</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-semibold hover:opacity-90 shadow-md transition-all cursor-pointer"
          >
            <Printer size={14} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex items-start gap-4">
          <div className="p-3 bg-violet-50 dark:bg-indigo-950/30 text-indigo-500 rounded-xl">
            <Coins size={20} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Fund Balance Summary</span>
            <h4 className="font-extrabold text-lg text-slate-900 dark:text-white mt-1">
              Collected: {formatCurrency(totalCollected)}
            </h4>
            <p className="text-xs text-slate-400 mt-1">Expenses: {formatCurrency(totalExpensesAmount)}</p>
            <span className="text-[10px] text-emerald-500 font-bold block mt-2">Savings: {formatCurrency(metrics.savings)}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex items-start gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 rounded-xl">
            <Award size={20} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Top Spending Area</span>
            <h4 className="font-extrabold text-lg text-slate-900 dark:text-white mt-1 capitalize">
              {metrics.topCategory}
            </h4>
            <p className="text-xs text-slate-400 mt-1">Total: {formatCurrency(metrics.topCatAmount)}</p>
            <span className="text-[10px] text-indigo-500 font-bold block mt-2">
              Avg Cost: {formatCurrency(metrics.avgExpense)}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex items-start gap-4">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-500 rounded-xl">
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Single Highest Billing</span>
            <h4 className="font-extrabold text-lg text-slate-900 dark:text-white mt-1 truncate max-w-[160px]">
              {metrics.highestExp.itemName}
            </h4>
            <p className="text-xs text-slate-400 mt-1">Amount: {formatCurrency(metrics.highestExp.amount)}</p>
            <span className="text-[10px] text-slate-450 block mt-2">Lowest: {formatCurrency(metrics.lowestExp.amount)}</span>
          </div>
        </div>

      </div>

      {/* Contribution & Settlements Summary panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Contributions Summary list */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            Contributions Summary
          </h3>
          <div className="space-y-4">
            {MEMBERS.map(m => {
              const stats = memberStats[m];
              const pct = totalCollected > 0 ? (stats.contributed / totalCollected) * 100 : 0;
              return (
                <div key={m} className="flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{m}</h4>
                    <span className="text-[10px] text-slate-450 block mt-0.5">Funded: {formatCurrency(stats.contributed)}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-slate-850 dark:text-slate-200 block">{pct.toFixed(0)}%</span>
                    <span className="text-[9px] text-slate-400">Share of Pool</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Settlement Summary list */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            Settlement Summary
          </h3>
          <div className="space-y-3.5">
            {settlements.length === 0 ? (
              <p className="text-xs text-slate-450 py-8 text-center">No settlements needed. Everyone is balanced.</p>
            ) : (
              settlements.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-lg border border-slate-100/50 dark:border-slate-850 bg-slate-50/20 dark:bg-slate-950/10">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <span className="text-rose-500">{s.from}</span>
                    <span className="text-slate-400 font-normal">→</span>
                    <span className="text-emerald-500">{s.to}</span>
                  </div>
                  <span className="font-extrabold text-slate-900 dark:text-white">{formatCurrency(s.amount)}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
