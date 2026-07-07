import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { PlusCircle, Trash2, Edit3, X, AlertTriangle, Sparkles } from 'lucide-react';
import type { InventoryItem } from '../types';

export const Inventory: React.FC = () => {
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Form State
  const [item, setItem] = useState('');
  const [openingQty, setOpeningQty] = useState<number | ''>('');
  const [purchasedQty, setPurchasedQty] = useState<number | ''>(0);
  const [usedQty, setUsedQty] = useState<number | ''>(0);
  const [lowStockAlert, setLowStockAlert] = useState<number | ''>('');
  const [unit, setUnit] = useState<InventoryItem['unit']>('kg');

  const handleOpenAdd = () => {
    setEditingItem(null);
    setItem('');
    setOpeningQty('');
    setPurchasedQty(0);
    setUsedQty(0);
    setLowStockAlert('');
    setUnit('kg');
    setModalOpen(true);
  };

  const handleOpenEdit = (target: InventoryItem) => {
    setEditingItem(target);
    setItem(target.item);
    setOpeningQty(target.openingQty);
    setPurchasedQty(target.purchasedQty);
    setUsedQty(target.usedQty);
    setLowStockAlert(target.lowStockAlert);
    setUnit(target.unit);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || openingQty === '' || lowStockAlert === '') {
      alert('Please fill in Item, Opening Quantity and Alert Threshold');
      return;
    }

    const payload = {
      item,
      openingQty: Number(openingQty),
      purchasedQty: Number(purchasedQty),
      usedQty: Number(usedQty),
      lowStockAlert: Number(lowStockAlert),
      unit
    };

    if (editingItem) {
      updateInventoryItem(editingItem.id, payload);
    } else {
      addInventoryItem(payload);
    }
    setModalOpen(false);
  };

  const handleQuickAdjust = (id: string, field: 'purchasedQty' | 'usedQty', currentVal: number, delta: number) => {
    const newVal = Math.max(0, currentVal + delta);
    updateInventoryItem(id, { [field]: newVal });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Grocery Inventory</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track opening stocks, new purchases, and usage. Items below their thresholds are highlighted in red.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4.5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-semibold hover:opacity-90 shadow-md transition-all cursor-pointer w-fit"
        >
          <PlusCircle size={15} />
          <span>Add Stock Item</span>
        </button>
      </div>

      {/* Grid: Inventory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {inventory.length === 0 ? (
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-8 text-center col-span-full text-slate-400">
            No grocery inventory items tracked. Click Add Stock Item to start!
          </div>
        ) : (
          inventory.map(inv => {
            const isLow = inv.remainingQty <= inv.lowStockAlert;
            return (
              <div
                key={inv.id}
                className={`bg-white dark:bg-slate-900/60 border rounded-2xl p-5 hover-card shadow-xs flex flex-col justify-between relative overflow-hidden ${
                  isLow
                    ? 'border-red-200 dark:border-red-900/30'
                    : 'border-slate-200/80 dark:border-slate-800/80'
                }`}
              >
                {/* Warning background glow */}
                {isLow && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-red-500/5 to-transparent rounded-bl-full pointer-events-none" />
                )}

                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                      {inv.item}
                      {isLow && <AlertTriangle size={15} className="text-red-500 shrink-0" />}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                      Unit: {inv.unit}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(inv)}
                      className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 hover:text-indigo-500 cursor-pointer"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Delete inventory tracker for ' + inv.item + '?')) {
                          deleteInventoryItem(inv.id);
                        }
                      }}
                      className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 hover:text-rose-500 cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Stock Stats Grid */}
                <div className="grid grid-cols-4 gap-2 text-center mt-5 bg-slate-50 dark:bg-slate-950/20 p-3 rounded-xl border border-slate-100 dark:border-slate-800/40">
                  <div>
                    <span className="block text-[8px] text-slate-400 uppercase tracking-wider">Open</span>
                    <span className="text-xs font-semibold">{inv.openingQty}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-slate-400 uppercase tracking-wider">Bought</span>
                    <span className="text-xs font-semibold text-emerald-500">+{inv.purchasedQty}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-slate-400 uppercase tracking-wider">Used</span>
                    <span className="text-xs font-semibold text-rose-500">-{inv.usedQty}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-slate-400 uppercase tracking-wider">Alert</span>
                    <span className="text-xs font-semibold text-amber-500">{inv.lowStockAlert}</span>
                  </div>
                </div>

                {/* Remaining Quantity Section */}
                <div className="mt-5 flex justify-between items-center border-t border-slate-100 dark:border-slate-800/50 pt-4">
                  <span className="text-xs text-slate-500">Stock Balance:</span>
                  <span className={`text-lg font-black ${isLow ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                    {inv.remainingQty} {inv.unit}
                  </span>
                </div>

                {/* Quick Add/Subtract buttons */}
                <div className="mt-4 flex gap-2">
                  <div className="flex-1 flex border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden text-[10px] items-center justify-between">
                    <button
                      onClick={() => handleQuickAdjust(inv.id, 'purchasedQty', inv.purchasedQty, -1)}
                      className="px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                    >
                      -
                    </button>
                    <span className="text-slate-400">Buy Qty</span>
                    <button
                      onClick={() => handleQuickAdjust(inv.id, 'purchasedQty', inv.purchasedQty, 1)}
                      className="px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-emerald-500"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex-1 flex border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden text-[10px] items-center justify-between">
                    <button
                      onClick={() => handleQuickAdjust(inv.id, 'usedQty', inv.usedQty, -1)}
                      className="px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                    >
                      -
                    </button>
                    <span className="text-slate-400">Use Qty</span>
                    <button
                      onClick={() => handleQuickAdjust(inv.id, 'usedQty', inv.usedQty, 1)}
                      className="px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-rose-500"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Low Stock Warning Banner inside card */}
                {isLow && (
                  <div className="mt-3 text-[10px] font-semibold text-center text-red-600 bg-red-100/50 dark:bg-red-950/20 dark:text-red-400 py-1.5 rounded-lg border border-red-100/80 dark:border-red-900/10">
                    Low Stock Alert! Refill needed.
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Inventory Modal */}
      {modalOpen && (
        <>
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40" onClick={() => setModalOpen(false)} />
          <div className="fixed inset-y-0 right-0 max-w-sm w-full bg-white dark:bg-slate-900 z-50 shadow-2xl p-6 overflow-y-auto flex flex-col border-l border-slate-200 dark:border-slate-850 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Sparkles className="text-indigo-500" size={18} />
                <span>{editingItem ? 'Modify Item' : 'New Stock Item'}</span>
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 flex-1">
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Onions, Tomato"
                  value={item}
                  onChange={e => setItem(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Opening Stock *</label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    value={openingQty}
                    onChange={e => setOpeningQty(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-transparent font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Unit *</label>
                  <select
                    value={unit}
                    onChange={e => setUnit(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-transparent"
                  >
                    <option value="kg">kg</option>
                    <option value="gram">gram</option>
                    <option value="litre">litre</option>
                    <option value="packet">packet</option>
                    <option value="piece">piece</option>
                    <option value="dozen">dozen</option>
                  </select>
                </div>
              </div>

              {editingItem && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Purchased</label>
                    <input
                      type="number"
                      value={purchasedQty}
                      onChange={e => setPurchasedQty(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Used</label>
                    <input
                      type="number"
                      value={usedQty}
                      onChange={e => setUsedQty(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-transparent font-semibold"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Low Stock Alert Level *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 2"
                  value={lowStockAlert}
                  onChange={e => setLowStockAlert(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-transparent"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 shadow-sm"
                >
                  {editingItem ? 'Update Stock' : 'Add Stock'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

    </div>
  );
};
