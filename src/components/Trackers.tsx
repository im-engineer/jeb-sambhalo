import React, { useState } from 'react';
import { useApp } from '../AppContext';
import {
  ListTodo,
  Star,
  Trash2,
  CheckCircle2,
  Droplet,
  Flame,
  Key,
  Shield,
  Layers,
  ShoppingBag,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import type { MemberName } from '../types';

export const Trackers: React.FC = () => {
  const {
    settings,
    shoppingList,
    wishlist,
    utilityReminders,
    gasLogs,
    waterLogs,
    deposits,
    maintenanceLogs,
    sharedAppliances,
    
    // Actions
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
    deleteSharedAppliance
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'shopping' | 'utility' | 'gas_water' | 'deposits_appliances'>('shopping');

  // Local Form states
  const [shopItem, setShopItem] = useState('');
  const [shopQty, setShopQty] = useState('');
  
  const [wishItem, setWishItem] = useState('');
  const [wishCost, setWishCost] = useState<number | ''>('');
  const [wishUrl, setWishUrl] = useState('');

  const [billName, setBillName] = useState('');
  const [billCat, setBillCat] = useState<'Electricity' | 'Internet' | 'Water' | 'Gas' | 'Rent' | 'Other'>('Electricity');
  const [billDue, setBillDue] = useState('');
  const [billAmount, setBillAmount] = useState<number | ''>('');

  const [gasBooking, setGasBooking] = useState(new Date().toISOString().split('T')[0]);
  const [gasDelivery, setGasDelivery] = useState('');
  const [gasCost, setGasCost] = useState<number | ''>(1050);
  const [gasProvider, setGasProvider] = useState('Indane');

  const [waterDate, setWaterDate] = useState(new Date().toISOString().split('T')[0]);
  const [waterQty, setWaterQty] = useState<number | ''>(1);
  const [waterCost, setWaterCost] = useState<number | ''>(50);
  const [waterPaidBy, setWaterPaidBy] = useState<MemberName>('Siddhant');

  const [depDesc, setDepDesc] = useState('');
  const [depAmt, setDepAmt] = useState<number | ''>('');
  const [depDate, setDepDate] = useState(new Date().toISOString().split('T')[0]);
  const [depPaidBy, setDepPaidBy] = useState<MemberName>('Siddhant');

  const [maintIssue, setMaintIssue] = useState('');
  const [maintCost, setMaintCost] = useState<number | ''>('');
  const [maintDate, setMaintDate] = useState(new Date().toISOString().split('T')[0]);
  const [maintPaidBy, setMaintPaidBy] = useState<MemberName>('Siddhant');

  const [applianceName, setApplianceName] = useState('');
  const [applianceCost, setApplianceCost] = useState<number | ''>('');
  const [applianceDate, setApplianceDate] = useState(new Date().toISOString().split('T')[0]);
  const [appliancePaidBy, setAppliancePaidBy] = useState<MemberName>('Siddhant');

  const formatCurrency = (val: number) => {
    return settings.currency + ' ' + val.toLocaleString('en-IN');
  };

  // Submit Handlers
  const submitShopping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopItem || !shopQty) return;
    addShoppingItem(shopItem, shopQty);
    setShopItem('');
    setShopQty('');
  };

  const submitWishlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishItem || !wishCost) return;
    addWishlistItem(wishItem, Number(wishCost), wishUrl || undefined);
    setWishItem('');
    setWishCost('');
    setWishUrl('');
  };

  const submitUtility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billName || !billDue || !billAmount) return;
    addUtilityReminder({
      name: billName,
      category: billCat,
      dueDate: billDue,
      amount: Number(billAmount)
    });
    setBillName('');
    setBillDue('');
    setBillAmount('');
  };

  const submitGas = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gasBooking || !gasCost) return;
    addGasLog({
      bookingDate: gasBooking,
      deliveryDate: gasDelivery || undefined,
      amount: Number(gasCost),
      provider: gasProvider,
      empty: false
    });
    setGasBooking(new Date().toISOString().split('T')[0]);
    setGasDelivery('');
    setGasCost(1050);
  };

  const submitWater = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waterDate || !waterQty || !waterCost) return;
    addWaterLog({
      date: waterDate,
      quantity: Number(waterQty),
      amount: Number(waterCost),
      paidBy: waterPaidBy
    });
    setWaterDate(new Date().toISOString().split('T')[0]);
    setWaterQty(1);
    setWaterCost(50);
  };

  const submitDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depDesc || !depAmt || !depDate) return;
    addDeposit({
      description: depDesc,
      amount: Number(depAmt),
      date: depDate,
      paidBy: depPaidBy
    });
    setDepDesc('');
    setDepAmt('');
    setDepDate(new Date().toISOString().split('T')[0]);
  };

  const submitMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintIssue || !maintCost || !maintDate) return;
    addMaintenanceLog({
      issue: maintIssue,
      cost: Number(maintCost),
      date: maintDate,
      paidBy: maintPaidBy
    });
    setMaintIssue('');
    setMaintCost('');
    setMaintDate(new Date().toISOString().split('T')[0]);
  };

  const submitAppliance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applianceName || !applianceCost || !applianceDate) return;
    addSharedAppliance({
      name: applianceName,
      cost: Number(applianceCost),
      purchaseDate: applianceDate,
      paidBy: appliancePaidBy
    });
    setApplianceName('');
    setApplianceCost('');
    setApplianceDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Trackers & Tools</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Utility reminders, cylinder delivery details, water logs, security deposits, wishlist, and shopping logs.
        </p>
      </div>

      {/* Sub Tabs Bar */}
      <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800 gap-1">
        <button
          onClick={() => setActiveSubTab('shopping')}
          className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-xs transition-all border-b-2 cursor-pointer ${
            activeSubTab === 'shopping'
              ? 'border-indigo-650 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ShoppingBag size={14} />
          <span>Shopping & Wishlist</span>
        </button>

        <button
          onClick={() => setActiveSubTab('utility')}
          className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-xs transition-all border-b-2 cursor-pointer ${
            activeSubTab === 'utility'
              ? 'border-indigo-650 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ClipboardList size={14} />
          <span>Utility Bills</span>
        </button>

        <button
          onClick={() => setActiveSubTab('gas_water')}
          className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-xs transition-all border-b-2 cursor-pointer ${
            activeSubTab === 'gas_water'
              ? 'border-indigo-650 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Flame size={14} />
          <span>Gas & Water Cans</span>
        </button>

        <button
          onClick={() => setActiveSubTab('deposits_appliances')}
          className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-xs transition-all border-b-2 cursor-pointer ${
            activeSubTab === 'deposits_appliances'
              ? 'border-indigo-650 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Key size={14} />
          <span>Deposits, Appliances & Maint.</span>
        </button>
      </div>

      {/* SUB TAB PANELS */}

      {/* 1. Shopping & Wishlist */}
      {activeSubTab === 'shopping' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Shopping list */}
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm text-slate-950 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <ListTodo size={16} className="text-violet-500" />
                  <span>Flat Shopping List</span>
                </h3>
                {shoppingList.some(s => s.completed) && (
                  <button
                    onClick={clearCompletedShopping}
                    className="text-[10px] text-rose-500 font-bold hover:underline cursor-pointer"
                  >
                    Clear Checked
                  </button>
                )}
              </div>

              {/* Add form */}
              <form onSubmit={submitShopping} className="flex gap-2 mb-4">
                <input
                  type="text"
                  required
                  placeholder="Item to buy..."
                  value={shopItem}
                  onChange={e => setShopItem(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-transparent"
                />
                <input
                  type="text"
                  required
                  placeholder="Qty (e.g. 2 kg, 1 pack)"
                  value={shopQty}
                  onChange={e => setShopQty(e.target.value)}
                  className="w-28 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-transparent"
                />
                <button
                  type="submit"
                  className="px-4 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Add
                </button>
              </form>

              {/* Items List */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {shoppingList.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">Shopping list is currently empty!</p>
                ) : (
                  shoppingList.map(s => (
                    <div
                      key={s.id}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                        s.completed
                          ? 'bg-slate-55/10 border-slate-200/50 dark:border-slate-800/40 opacity-50'
                          : 'bg-slate-50/30 border-slate-100 dark:bg-slate-900/10 dark:border-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleShoppingItem(s.id)}
                          className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all ${
                            s.completed
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-slate-300 hover:border-indigo-500'
                          }`}
                        >
                          {s.completed && <CheckCircle2 size={12} />}
                        </button>
                        <span className={`text-xs font-semibold ${s.completed ? 'line-through' : ''}`}>
                          {s.item} <span className="text-[10px] text-slate-400 font-normal">({s.qty})</span>
                        </span>
                      </div>
                      <button
                        onClick={() => deleteShoppingItem(s.id)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Wishlist */}
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-950 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Star size={16} className="text-amber-500" />
                <span>Flat Wishlist (Future purchases)</span>
              </h3>

              {/* Add form */}
              <form onSubmit={submitWishlist} className="grid grid-cols-3 gap-2 mb-4">
                <input
                  type="text"
                  required
                  placeholder="Item name..."
                  value={wishItem}
                  onChange={e => setWishItem(e.target.value)}
                  className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-transparent col-span-2"
                />
                <input
                  type="number"
                  required
                  placeholder="Cost (Est)"
                  value={wishCost}
                  onChange={e => setWishCost(e.target.value === '' ? '' : Number(e.target.value))}
                  className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-transparent font-semibold"
                />
                <input
                  type="url"
                  placeholder="Link/URL (optional)"
                  value={wishUrl}
                  onChange={e => setWishUrl(e.target.value)}
                  className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-transparent col-span-2"
                />
                <button
                  type="submit"
                  className="bg-indigo-650 hover:bg-indigo-750 text-white rounded-xl text-xs font-semibold cursor-pointer py-2"
                >
                  Wish Item
                </button>
              </form>

              {/* Wishlist Items log */}
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                {wishlist.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">Wishlist is empty.</p>
                ) : (
                  wishlist.map(w => (
                    <div
                      key={w.id}
                      className="p-3 rounded-xl border border-slate-100 dark:bg-slate-900/10 dark:border-slate-800/80 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1">
                          {w.item}
                          {w.pinned && <Star size={11} className="text-amber-500 fill-amber-500" />}
                        </h4>
                        {w.url && (
                          <a
                            href={w.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[9px] text-violet-500 hover:underline mt-0.5 block"
                          >
                            Product link
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-extrabold">{formatCurrency(w.estimatedCost)}</span>
                        <button onClick={() => togglePinWishlist(w.id)} className="p-1 hover:text-amber-500">
                          <Star size={13} fill={w.pinned ? "currentColor" : "none"} className={w.pinned ? 'text-amber-500' : 'text-slate-400'} />
                        </button>
                        <button onClick={() => deleteWishlistItem(w.id)} className="text-slate-400 hover:text-rose-500 p-1">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 2. Utility Bills */}
      {activeSubTab === 'utility' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Add bill form */}
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-sm text-slate-950 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-500" />
              <span>Add Bill Reminder</span>
            </h3>

            <form onSubmit={submitUtility} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Bill Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WiFi Bill June, Rent"
                  value={billName}
                  onChange={e => setBillName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Category</label>
                  <select
                    value={billCat}
                    onChange={e => setBillCat(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-transparent"
                  >
                    <option value="Electricity">Electricity</option>
                    <option value="Internet">Internet</option>
                    <option value="Water">Water</option>
                    <option value="Gas">Gas</option>
                    <option value="Rent">Rent</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={billDue}
                    onChange={e => setBillDue(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Estimated Amount</label>
                <input
                  type="number"
                  required
                  placeholder="₹ 0.00"
                  value={billAmount}
                  onChange={e => setBillAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-transparent font-extrabold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-755 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm mt-2"
              >
                Log Reminder
              </button>
            </form>
          </div>

          {/* Active Reminders List */}
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm lg:col-span-2">
            <h3 className="font-bold text-sm text-slate-950 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <ClipboardList size={16} className="text-violet-500" />
              <span>Bill Reminders Logs</span>
            </h3>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {utilityReminders.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-12">No active bill reminders logged.</p>
              ) : (
                utilityReminders.map(u => (
                  <div
                    key={u.id}
                    className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                      u.paid
                        ? 'bg-slate-55/10 border-slate-200/50 dark:border-slate-800/30 opacity-55'
                        : 'bg-slate-50/20 border-slate-100 dark:bg-slate-900/10 dark:border-slate-800/80'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{u.name}</h4>
                      <div className="flex gap-2 text-[10px] text-slate-400 mt-1">
                        <span>Due: {u.dueDate}</span>
                        <span>•</span>
                        <span>Category: {u.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white block">
                          {formatCurrency(u.amount)}
                        </span>
                        <span className={`text-[10px] font-bold ${u.paid ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {u.paid ? 'Paid' : 'Unpaid'}
                        </span>
                      </div>

                      <button
                        onClick={() => toggleUtilityReminder(u.id)}
                        className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                          u.paid
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                            : 'border-slate-200 text-slate-500 hover:text-emerald-500'
                        }`}
                      >
                        {u.paid ? 'Mark Unpaid' : 'Mark Paid'}
                      </button>

                      <button
                        onClick={() => deleteUtilityReminder(u.id)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* 3. Gas & Water Cans */}
      {activeSubTab === 'gas_water' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Gas Cylinders cylinder tracker */}
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-950 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Flame size={16} className="text-orange-500" />
              <span>Cooking Gas History</span>
            </h3>

            {/* Cylinder add form */}
            <form onSubmit={submitGas} className="grid grid-cols-2 gap-3 bg-slate-50/20 dark:bg-slate-900/10 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">Booking Date</label>
                <input
                  type="date"
                  required
                  value={gasBooking}
                  onChange={e => setGasBooking(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">Delivery Date (Est)</label>
                <input
                  type="date"
                  value={gasDelivery}
                  onChange={e => setGasDelivery(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">Cylinder Cost</label>
                <input
                  type="number"
                  required
                  value={gasCost}
                  onChange={e => setGasCost(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold"
                />
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Provider</label>
                  <input
                    type="text"
                    required
                    value={gasProvider}
                    onChange={e => setGasProvider(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold cursor-pointer h-8"
                >
                  Log
                </button>
              </div>
            </form>

            {/* Cylinder history logs */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {gasLogs.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No cylinder logs.</p>
              ) : (
                gasLogs.map(g => (
                  <div key={g.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-semibold text-xs">Gas Cylinder Refill ({g.provider})</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Booked: {g.bookingDate} {g.deliveryDate && `| Delivered: ${g.deliveryDate}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">{formatCurrency(g.amount)}</span>
                      <button
                        onClick={() => toggleGasEmpty(g.id)}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                          g.empty
                            ? 'bg-rose-100 text-rose-600'
                            : 'bg-emerald-100 text-emerald-600'
                        }`}
                      >
                        {g.empty ? 'Empty' : 'Full / Active'}
                      </button>
                      <button onClick={() => deleteGasLog(g.id)} className="text-slate-400 hover:text-rose-500">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Water cans logs */}
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-950 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Droplet size={16} className="text-blue-500" />
              <span>Water Cans Log</span>
            </h3>

            {/* Water Cans log form */}
            <form onSubmit={submitWater} className="grid grid-cols-2 gap-3 bg-slate-50/20 dark:bg-slate-900/10 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={waterDate}
                  onChange={e => setWaterDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">Quantity (Cans)</label>
                <input
                  type="number"
                  required
                  value={waterQty}
                  onChange={e => setWaterQty(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">Total Cost</label>
                <input
                  type="number"
                  required
                  value={waterCost}
                  onChange={e => setWaterCost(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold"
                />
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Paid By</label>
                  <select
                    value={waterPaidBy}
                    onChange={e => setWaterPaidBy(e.target.value as MemberName)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-transparent"
                  >
                    <option value="Siddhant">Siddhant</option>
                    <option value="Akash">Akash</option>
                    <option value="Abday">Abday</option>
                    <option value="Rahul">Rahul</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-bold cursor-pointer h-8"
                >
                  Log
                </button>
              </div>
            </form>

            {/* Water cans logs list */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {waterLogs.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No water can delivery logs.</p>
              ) : (
                waterLogs.map(w => (
                  <div key={w.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-semibold text-xs">{w.quantity} Drinking Water Can(s)</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Delivered: {w.date} | Paid by {w.paidBy}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">{formatCurrency(w.amount)}</span>
                      <button onClick={() => deleteWaterLog(w.id)} className="text-slate-400 hover:text-rose-500">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* 4. Deposits, Appliances & Room Maintenance */}
      {activeSubTab === 'deposits_appliances' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Security Deposits */}
            <div className="bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-xs text-slate-950 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Key size={14} className="text-violet-500" />
                <span>Security Deposits</span>
              </h3>

              <form onSubmit={submitDeposit} className="space-y-3 bg-slate-50/20 dark:bg-slate-900/10 p-3 rounded-xl border border-slate-100">
                <input
                  type="text"
                  required
                  placeholder="e.g. Landlord Security, Gas deposit"
                  value={depDesc}
                  onChange={e => setDepDesc(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    required
                    placeholder="Amount"
                    value={depAmt}
                    onChange={e => setDepAmt(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold"
                  />
                  <input
                    type="date"
                    required
                    value={depDate}
                    onChange={e => setDepDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                  />
                </div>
                <div className="flex gap-2 items-center">
                  <select
                    value={depPaidBy}
                    onChange={e => setDepPaidBy(e.target.value as MemberName)}
                    className="flex-1 px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-transparent"
                  >
                    <option value="Siddhant">Siddhant</option>
                    <option value="Akash">Akash</option>
                    <option value="Abday">Abday</option>
                    <option value="Rahul">Rahul</option>
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-violet-650 hover:bg-violet-750 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Log Deposit
                  </button>
                </div>
              </form>

              <div className="space-y-2 max-h-[160px] overflow-y-auto">
                {deposits.map(d => (
                  <div key={d.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-semibold text-xs">{d.description}</h4>
                      <p className="text-[9px] text-slate-400 mt-0.5">Paid by {d.paidBy} | {d.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{formatCurrency(d.amount)}</span>
                      <button
                        onClick={() => toggleDepositRefunded(d.id)}
                        className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                          d.refunded ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {d.refunded ? 'Refunded' : 'Held'}
                      </button>
                      <button onClick={() => deleteDeposit(d.id)} className="text-slate-400 hover:text-rose-500">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Room Maintenance Logs */}
            <div className="bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-xs text-slate-950 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Shield size={14} className="text-rose-500" />
                <span>Room Maintenance</span>
              </h3>

              <form onSubmit={submitMaintenance} className="space-y-3 bg-slate-50/20 dark:bg-slate-900/10 p-3 rounded-xl border border-slate-100">
                <input
                  type="text"
                  required
                  placeholder="e.g. Geyser Repair, Tap fixing"
                  value={maintIssue}
                  onChange={e => setMaintIssue(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    required
                    placeholder="Repair cost"
                    value={maintCost}
                    onChange={e => setMaintCost(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold"
                  />
                  <input
                    type="date"
                    required
                    value={maintDate}
                    onChange={e => setMaintDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                  />
                </div>
                <div className="flex gap-2 items-center">
                  <select
                    value={maintPaidBy}
                    onChange={e => setMaintPaidBy(e.target.value as MemberName)}
                    className="flex-1 px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-transparent"
                  >
                    <option value="Siddhant">Siddhant</option>
                    <option value="Akash">Akash</option>
                    <option value="Abday">Abday</option>
                    <option value="Rahul">Rahul</option>
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Log Issue
                  </button>
                </div>
              </form>

              <div className="space-y-2 max-h-[160px] overflow-y-auto">
                {maintenanceLogs.map(m => (
                  <div key={m.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-semibold text-xs">{m.issue}</h4>
                      <p className="text-[9px] text-slate-400 mt-0.5">Paid by {m.paidBy} | {m.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{formatCurrency(m.cost)}</span>
                      <button
                        onClick={() => toggleMaintenanceResolved(m.id)}
                        className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                          m.resolved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {m.resolved ? 'Resolved' : 'Pending'}
                      </button>
                      <button onClick={() => deleteMaintenanceLog(m.id)} className="text-slate-400 hover:text-rose-500">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shared Appliances & Furniture */}
            <div className="bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-xs text-slate-950 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Layers size={14} className="text-emerald-500" />
                <span>Shared Appliances</span>
              </h3>

              <form onSubmit={submitAppliance} className="space-y-3 bg-slate-50/20 dark:bg-slate-900/10 p-3 rounded-xl border border-slate-100">
                <input
                  type="text"
                  required
                  placeholder="e.g. Microwave, Sofa, Fridge"
                  value={applianceName}
                  onChange={e => setApplianceName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    required
                    placeholder="Purchase cost"
                    value={applianceCost}
                    onChange={e => setApplianceCost(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold"
                  />
                  <input
                    type="date"
                    required
                    value={applianceDate}
                    onChange={e => setApplianceDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                  />
                </div>
                <div className="flex gap-2 items-center">
                  <select
                    value={appliancePaidBy}
                    onChange={e => setAppliancePaidBy(e.target.value as MemberName)}
                    className="flex-1 px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-transparent"
                  >
                    <option value="Siddhant">Siddhant</option>
                    <option value="Akash">Akash</option>
                    <option value="Abday">Abday</option>
                    <option value="Rahul">Rahul</option>
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Log Asset
                  </button>
                </div>
              </form>

              <div className="space-y-2 max-h-[160px] overflow-y-auto">
                {sharedAppliances.map(a => (
                  <div key={a.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-semibold text-xs">{a.name}</h4>
                      <p className="text-[9px] text-slate-400 mt-0.5">Bought by {a.paidBy} | {a.purchaseDate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{formatCurrency(a.cost)}</span>
                      <button onClick={() => deleteSharedAppliance(a.id)} className="text-slate-400 hover:text-rose-500">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
