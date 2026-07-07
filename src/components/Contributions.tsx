import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { History, Edit3, Trash2, PlusCircle, Sparkles, X } from 'lucide-react';
import type { MemberName, PaymentMethod } from '../types';
import { PAYMENT_METHODS } from '../types';

export const Contributions: React.FC = () => {
  const {
    settings,
    contributions,
    activeContributions,
    addContribution,
    updateContribution,
    deleteContribution
  } = useApp();

  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [member, setMember] = useState<MemberName>('Siddhant');
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMode, setPaymentMode] = useState<PaymentMethod>('UPI');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const formatCurrency = (val: number) => {
    return settings.currency + ' ' + Math.round(val).toLocaleString('en-IN');
  };

  // Calculations
  const carryOverAmount = settings.carryOverBalances[settings.currentMonth] || 0;
  const newContributionsSum = activeContributions.reduce((sum, c) => sum + c.amount, 0);
  const totalCollected = carryOverAmount + newContributionsSum;

  const startEdit = (c: typeof activeContributions[0]) => {
    setEditingId(c.id);
    setMember(c.member);
    setAmount(c.amount);
    setPaymentMode(c.paymentMode);
    setDate(c.date);
    setNotes(c.notes);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setMember('Siddhant');
    setAmount('');
    setPaymentMode('UPI');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount === '' || Number(amount) <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    const payload = {
      date,
      member,
      amount: Number(amount),
      paymentMode,
      notes: notes || 'Contribution'
    };

    if (editingId) {
      updateContribution(editingId, payload);
      setEditingId(null);
    } else {
      addContribution(payload);
    }

    // Reset Form
    setAmount('');
    setNotes('');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Contribution Center</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage flat fund contributions. Log initial balances, carryovers, and additional payments at any time.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Previous Month Carry Over */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
          <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">
            Previous Month Carry-Over
          </span>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(carryOverAmount)}
          </span>
          <p className="text-[10px] text-slate-400 mt-2 font-medium">Opening balance from previous month</p>
        </div>

        {/* New Contributions Sum */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
          <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">
            New Contributions Logged
          </span>
          <span className="text-2xl font-extrabold text-indigo-500">
            {formatCurrency(newContributionsSum)}
          </span>
          <p className="text-[10px] text-slate-400 mt-2 font-medium">Total entries logged in this month</p>
        </div>

        {/* Total Available Fund */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs bg-gradient-to-tr from-indigo-500/5 to-transparent">
          <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">
            Total Available Fund
          </span>
          <span className="text-2xl font-black text-emerald-500">
            {formatCurrency(totalCollected)}
          </span>
          <p className="text-[10px] text-slate-400 mt-2 font-medium">Carry-over + New Contributions</p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Month contributions list */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/65 pb-4">
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              {settings.currentMonth} Contribution Log Entries
            </h3>
            <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-850 font-bold">
              {activeContributions.length} Transactions
            </span>
          </div>

          <div className="space-y-4.5 max-h-[480px] overflow-y-auto pr-1">
            {activeContributions.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-12">No contributions logged for this month yet.</p>
            ) : (
              activeContributions.map(c => {
                const pct = totalCollected > 0 ? (c.amount / totalCollected) * 100 : 0;
                return (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10 flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{c.member}</h4>
                        <div className="flex gap-2 text-[10px] text-slate-400 mt-1">
                          <span>Paid: {c.date}</span>
                          <span>•</span>
                          <span>Mode: {c.paymentMode}</span>
                        </div>
                        {c.notes && (
                          <p className="text-[10px] text-slate-400 italic mt-1.5 bg-slate-100 dark:bg-slate-950/30 px-2 py-0.5 rounded-md w-fit">
                            {c.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white block">
                            {formatCurrency(c.amount)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">{pct.toFixed(0)}% Share</span>
                        </div>

                        <div className="flex gap-1.5 ml-2">
                          <button
                            onClick={() => startEdit(c)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 hover:text-indigo-500 cursor-pointer"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Delete this contribution entry?')) {
                                deleteContribution(c.id);
                              }
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 hover:text-rose-500 cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Percentage line indicator */}
                    <div className="w-full bg-slate-100 dark:bg-slate-850 h-1 rounded-full overflow-hidden mt-3">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Form Panel: Add or Edit */}
        <div>
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-500" />
              <span>{editingId ? 'Edit Contribution log' : 'Log Contribution'}</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Member Name</label>
                <select
                  value={member}
                  onChange={e => setMember(e.target.value as MemberName)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-transparent"
                >
                  <option value="Siddhant">Siddhant</option>
                  <option value="Akash">Akash</option>
                  <option value="Abday">Abday</option>
                  <option value="Rahul">Rahul</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Amount ({settings.currency})</label>
                <input
                  type="number"
                  required
                  placeholder="Enter amount"
                  value={amount}
                  onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-transparent font-extrabold"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Payment Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-transparent"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={e => setPaymentMode(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-transparent"
                >
                  {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Notes / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Initial Contribution, Extra cash"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-transparent"
                />
              </div>

              <div className="flex gap-2 pt-2">
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-55 flex items-center justify-center gap-1"
                  >
                    <X size={13} />
                    <span>Cancel</span>
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle size={14} />
                  <span>{editingId ? 'Update Log' : 'Log Contribution'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>

      {/* Global Contribution logs History across all months */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
          <History size={16} className="text-indigo-500" />
          <span>All-Time Contribution Payments History Log</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/10 text-xs font-semibold text-slate-450 uppercase tracking-wider">
                <th className="p-3">Date</th>
                <th className="p-3">Month</th>
                <th className="p-3">Member</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3">Payment Mode</th>
                <th className="p-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {contributions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-450">No historical logs found.</td>
                </tr>
              ) : (
                [...contributions].sort((a, b) => b.date.localeCompare(a.date)).map(c => (
                  <tr key={c.id} className="hover:bg-slate-55/20 dark:hover:bg-slate-850/10">
                    <td className="p-3 text-xs">{c.date}</td>
                    <td className="p-3 text-xs font-bold">{c.month}</td>
                    <td className="p-3 font-semibold">{c.member}</td>
                    <td className="p-3 text-right font-extrabold text-slate-900 dark:text-white">
                      {settings.currency} {c.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-xs">{c.paymentMode}</td>
                    <td className="p-3 text-xs text-slate-400 max-w-xs truncate">{c.notes || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
