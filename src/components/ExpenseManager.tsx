import React, { useState, useMemo } from 'react';
import { useApp } from '../AppContext';
import {
  PlusCircle,
  Search,
  ArrowUpDown,
  Trash2,
  Edit,
  Copy,
  Download,
  Printer,
  X,
  Star,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import type { Expense, ExpenseCategory, MemberName, PaymentMethod } from '../types';
import { CATEGORIES, PAYMENT_METHODS, CATEGORY_COLORS } from '../types';

export const ExpenseManager: React.FC = () => {
  const {
    settings,
    activeExpenses,
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    duplicateExpense
  } = useApp();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPerson, setSelectedPerson] = useState<string>('All');
  const [selectedPayment, setSelectedPayment] = useState<string>('All');
  const [selectedShop, setSelectedShop] = useState<string>('All');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [timeFilter, setTimeFilter] = useState<string>('This Month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<keyof Expense>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Add/Edit modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  
  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ExpenseCategory>('Groceries');
  const [subCategory, setSubCategory] = useState('');
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [paidBy, setPaidBy] = useState<MemberName>('Siddhant');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [shopName, setShopName] = useState('');
  const [billAvailable, setBillAvailable] = useState<'Yes' | 'No'>('No');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [paymentSource, setPaymentSource] = useState<'Flat Fund' | 'Personal'>('Flat Fund');

  // Quick Add Options
  const templates = [
    { label: 'Weekly Veggies', category: 'Vegetables' as ExpenseCategory, sub: 'Daily Greens', name: 'Fresh Vegetables', amount: 350, shop: 'Local Mandi', note: 'Weekly batch' },
    { label: 'Internet Bill', category: 'Internet' as ExpenseCategory, sub: 'Broadband', name: 'Airtel Fiber', amount: 999, shop: 'Airtel App', note: 'Split equally' },
    { label: 'Cooking Gas Cylinder', category: 'Gas' as ExpenseCategory, sub: 'Cylinder refill', name: 'HP Gas Refill', amount: 1050, shop: 'HP Gas Agency', note: 'Delivery charge included' },
    { label: 'Water Can x5', category: 'Water' as ExpenseCategory, sub: 'Can supplier', name: 'Water Cans', amount: 250, shop: 'Aman Aqua', note: '5 cans delivered' },
  ];

  // List of unique shops for filter dropdown
  const uniqueShops = useMemo(() => {
    const shops = new Set(activeExpenses.map(e => e.shopName).filter(Boolean));
    return Array.from(shops);
  }, [activeExpenses]);

  // Open modal for adding
  const handleOpenAdd = () => {
    setEditingExpenseId(null);
    setDate(new Date().toISOString().split('T')[0]);
    setCategory('Groceries');
    setSubCategory('');
    setItemName('');
    setDescription('');
    setAmount('');
    setPaidBy('Siddhant');
    setPaymentMethod('UPI');
    setPaymentSource('Flat Fund');
    setShopName('');
    setBillAvailable('No');
    setNotes('');
    setPhotoUrl('');
    setTagsInput('');
    setIsFavorite(false);
    setIsRecurring(false);
    setModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (exp: Expense) => {
    setEditingExpenseId(exp.id);
    setDate(exp.date);
    setCategory(exp.category);
    setSubCategory(exp.subCategory || '');
    setItemName(exp.itemName);
    setDescription(exp.description || '');
    setAmount(exp.amount);
    setPaidBy(exp.paidBy);
    setPaymentMethod(exp.paymentMethod);
    setPaymentSource(exp.paymentSource || 'Flat Fund');
    setShopName(exp.shopName || '');
    setBillAvailable(exp.billAvailable);
    setNotes(exp.notes || '');
    setPhotoUrl(exp.photoUrl || '');
    setTagsInput(exp.tags ? exp.tags.join(', ') : '');
    setIsFavorite(exp.isFavorite || false);
    setIsRecurring(exp.isRecurring || false);
    setModalOpen(true);
  };

  // Handle Quick Add Template selection
  const applyTemplate = (tpl: typeof templates[0]) => {
    setCategory(tpl.category);
    setSubCategory(tpl.sub);
    setItemName(tpl.name);
    setAmount(tpl.amount);
    setShopName(tpl.shop);
    setNotes(tpl.note);
  };

  // Save / Update form
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0 || !itemName) {
      alert('Please fill in Item Name and a valid Amount');
      return;
    }

    const payload = {
      date,
      category,
      subCategory,
      itemName,
      description,
      amount: Number(amount),
      paidBy,
      paymentMethod,
      paymentSource,
      shopName,
      billAvailable,
      notes,
      photoUrl: photoUrl || undefined,
      tags: tagsInput ? tagsInput.split(',').map(t => t.trim()) : [],
      isFavorite,
      isRecurring
    };

    if (editingExpenseId) {
      updateExpense(editingExpenseId, payload);
    } else {
      addExpense(payload);
    }
    setModalOpen(false);
  };

  // Sorting helper
  const handleSort = (field: keyof Expense) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter & Search Logic
  const filteredExpenses = useMemo(() => {
    // Standard pool: search across all expenses, but usually we focus on settings.currentMonth.
    // However, if TimeFilter is 'All Time', we search all. Otherwise, filter by time first.
    let pool = [...expenses];

    // Time filter
    const now = new Date();
    
    if (timeFilter === 'This Month') {
      pool = pool.filter(e => e.month === settings.currentMonth);
    } else if (timeFilter === 'Today') {
      const todayStr = now.toISOString().split('T')[0];
      pool = pool.filter(e => e.date === todayStr);
    } else if (timeFilter === 'Yesterday') {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      pool = pool.filter(e => e.date === yesterdayStr);
    } else if (timeFilter === 'This Week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
      const startStr = startOfWeek.toISOString().split('T')[0];
      pool = pool.filter(e => e.date >= startStr);
    } else if (timeFilter === 'Last Month') {
      let lmYear = now.getFullYear();
      let lmMonth = now.getMonth(); // previous month index
      if (lmMonth === 0) {
        lmMonth = 12;
        lmYear -= 1;
      }
      const lmStr = `${lmYear}-${String(lmMonth).padStart(2, '0')}`;
      pool = pool.filter(e => e.month === lmStr);
    } else if (timeFilter === 'Custom Date' && customStartDate && customEndDate) {
      pool = pool.filter(e => e.date >= customStartDate && e.date <= customEndDate);
    }

    // Category filter
    if (selectedCategory !== 'All') {
      pool = pool.filter(e => e.category === selectedCategory);
    }

    // Person filter
    if (selectedPerson !== 'All') {
      pool = pool.filter(e => e.paidBy === selectedPerson);
    }

    // Payment Method filter
    if (selectedPayment !== 'All') {
      pool = pool.filter(e => e.paymentMethod === selectedPayment);
    }

    // Shop filter
    if (selectedShop !== 'All') {
      pool = pool.filter(e => e.shopName === selectedShop);
    }

    // Amount range
    if (minAmount) {
      pool = pool.filter(e => e.amount >= Number(minAmount));
    }
    if (maxAmount) {
      pool = pool.filter(e => e.amount <= Number(maxAmount));
    }

    // Favorites
    if (showFavoritesOnly) {
      pool = pool.filter(e => e.isFavorite);
    }

    // Search term (global search across item, category, description, shop, member, notes)
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      pool = pool.filter(e =>
        e.itemName.toLowerCase().includes(term) ||
        e.category.toLowerCase().includes(term) ||
        e.description.toLowerCase().includes(term) ||
        e.shopName.toLowerCase().includes(term) ||
        e.paidBy.toLowerCase().includes(term) ||
        e.notes.toLowerCase().includes(term) ||
        (e.tags && e.tags.some(t => t.toLowerCase().includes(term)))
      );
    }

    // Apply Sorting
    return pool.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

  }, [expenses, settings.currentMonth, searchTerm, selectedCategory, selectedPerson, selectedPayment, selectedShop, minAmount, maxAmount, timeFilter, customStartDate, customEndDate, showFavoritesOnly, sortField, sortOrder]);

  // Paginated data
  const paginatedExpenses = useMemo(() => {
    const offset = (currentPage - 1) * itemsPerPage;
    return filteredExpenses.slice(offset, offset + itemsPerPage);
  }, [filteredExpenses, currentPage]);

  const totalPages = Math.max(Math.ceil(filteredExpenses.length / itemsPerPage), 1);

  // Exporters
  const exportCSV = () => {
    const headers = ['ID', 'Date', 'Category', 'Sub Category', 'Item Name', 'Description', 'Amount', 'Paid By', 'Payment Method', 'Shop Name', 'Bill Available', 'Notes'];
    const rows = filteredExpenses.map(e => [
      e.id,
      e.date,
      e.category,
      e.subCategory,
      e.itemName,
      `"${e.description.replace(/"/g, '""')}"`,
      e.amount,
      e.paidBy,
      e.paymentMethod,
      e.shopName,
      e.billAvailable,
      `"${e.notes.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `flat_expenses_${settings.currentMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const tableRows = filteredExpenses.map(e => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${e.date}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${e.category}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${e.itemName}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">₹${e.amount}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${e.paidBy}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${e.paymentMethod}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${e.shopName}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Expenses Report - ${settings.currentMonth}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f2f2f2; text-align: left; }
          </style>
        </head>
        <body>
          <h2>Flat Expenses Report - ${settings.currentMonth}</h2>
          <p>Total Count: ${filteredExpenses.length} | Total Expenses: ₹${filteredExpenses.reduce((sum, e) => sum + e.amount, 0)}</p>
          <table>
            <thead>
              <tr>
                <th style="border: 1px solid #ddd; padding: 8px;">Date</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Category</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Item Name</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Amount</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Paid By</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Method</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Shop</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Expenses Ledger</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">View, filter, export and log your flat expenses</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs bg-white dark:bg-slate-900"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs bg-white dark:bg-slate-900"
          >
            <Printer size={14} />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4.5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-semibold hover:opacity-90 shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
          >
            <PlusCircle size={15} />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Global Filter Bar */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search items, shops, descriptions, tags, notes..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600/50"
            />
          </div>
          {/* Time range */}
          <div>
            <select
              value={timeFilter}
              onChange={e => { setTimeFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600/50 font-medium"
            >
              <option value="This Month">This Month Only</option>
              <option value="Today">Today</option>
              <option value="Yesterday">Yesterday</option>
              <option value="This Week">This Week</option>
              <option value="Last Month">Last Month</option>
              <option value="All Time">All Time</option>
              <option value="Custom Date">Custom Range</option>
            </select>
          </div>
          {/* Category */}
          <div>
            <select
              value={selectedCategory}
              onChange={e => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600/50 font-medium"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Custom Dates / Extended filters row */}
        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
          
          {timeFilter === 'Custom Date' && (
            <div className="flex items-center gap-2 text-xs">
              <input
                type="date"
                value={customStartDate}
                onChange={e => setCustomStartDate(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={e => setCustomEndDate(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
              />
            </div>
          )}

          {/* Paid By Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Paid By:</span>
            <select
              value={selectedPerson}
              onChange={e => setSelectedPerson(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-transparent font-medium"
            >
              <option value="All">All</option>
              <option value="Siddhant">Siddhant</option>
              <option value="Akash">Akash</option>
              <option value="Abday">Abday</option>
              <option value="Rahul">Rahul</option>
            </select>
          </div>

          {/* Shop Name Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Shop:</span>
            <select
              value={selectedShop}
              onChange={e => setSelectedShop(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-transparent font-medium max-w-[120px] truncate"
            >
              <option value="All">All Shops</option>
              {uniqueShops.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Payment Method Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Method:</span>
            <select
              value={selectedPayment}
              onChange={e => setSelectedPayment(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-transparent font-medium"
            >
              <option value="All">All Methods</option>
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          {/* Amount range */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Amount:</span>
            <input
              type="number"
              placeholder="Min"
              value={minAmount}
              onChange={e => setMinAmount(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs w-16 bg-transparent"
            />
            <span className="text-slate-400">-</span>
            <input
              type="number"
              placeholder="Max"
              value={maxAmount}
              onChange={e => setMaxAmount(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs w-16 bg-transparent"
            />
          </div>

          {/* Favorites Checkbox */}
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              showFavoritesOnly
                ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Star size={13} fill={showFavoritesOnly ? "currentColor" : "none"} />
            <span>Favorites</span>
          </button>

          {/* Reset Filters button */}
          {(searchTerm || selectedCategory !== 'All' || selectedPerson !== 'All' || selectedShop !== 'All' || selectedPayment !== 'All' || minAmount || maxAmount || showFavoritesOnly || timeFilter !== 'This Month') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setSelectedPerson('All');
                setSelectedShop('All');
                setSelectedPayment('All');
                setMinAmount('');
                setMaxAmount('');
                setTimeFilter('This Month');
                setShowFavoritesOnly(false);
              }}
              className="text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1 cursor-pointer ml-auto"
            >
              <X size={14} />
              <span>Clear Filters</span>
            </button>
          )}

        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/10 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="p-4 cursor-pointer" onClick={() => handleSort('date')}>
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="p-4 cursor-pointer" onClick={() => handleSort('itemName')}>
                  <div className="flex items-center gap-1">
                    <span>Item Name</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="p-4 cursor-pointer" onClick={() => handleSort('category')}>
                  <div className="flex items-center gap-1">
                    <span>Category</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="p-4 cursor-pointer text-right" onClick={() => handleSort('amount')}>
                  <div className="flex items-center gap-1 justify-end">
                    <span>Amount</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="p-4 cursor-pointer" onClick={() => handleSort('paidBy')}>
                  <div className="flex items-center gap-1">
                    <span>Paid By</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="p-4">Payment</th>
                <th className="p-4">Shop</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
              {paginatedExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 dark:text-slate-500">
                    No transactions match the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedExpenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors">
                    <td className="p-4 whitespace-nowrap text-xs font-semibold">{exp.date}</td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {exp.itemName}
                        {exp.isFavorite && <Star size={12} className="text-amber-500 fill-amber-500" />}
                      </div>
                      {exp.description && <div className="text-xs text-slate-400 max-w-xs truncate">{exp.description}</div>}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${CATEGORY_COLORS[exp.category] || 'bg-slate-100'}`}>
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-4 text-right font-extrabold whitespace-nowrap text-slate-900 dark:text-white">
                      {settings.currency} {exp.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 whitespace-nowrap font-medium">{exp.paidBy}</td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="text-xs text-slate-900 dark:text-white font-medium">{exp.paymentMethod}</div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                        (exp.paymentSource || 'Flat Fund') === 'Flat Fund'
                          ? 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400'
                          : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'
                      }`}>
                        {exp.paymentSource || 'Flat Fund'}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">{exp.shopName || '-'}</td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => updateExpense(exp.id, { isFavorite: !exp.isFavorite })}
                          className={`p-1.5 rounded-lg border border-slate-100 dark:border-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-amber-500 transition-all cursor-pointer`}
                        >
                          <Star size={13} fill={exp.isFavorite ? "currentColor" : "none"} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(exp)}
                          className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-violet-500 dark:hover:text-violet-400 transition-all cursor-pointer"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          onClick={() => duplicateExpense(exp.id)}
                          className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all cursor-pointer"
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this expense?')) {
                              deleteExpense(exp.id);
                            }
                          }}
                          className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-500 transition-all cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/20 dark:bg-slate-950/10">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Showing {Math.min(filteredExpenses.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filteredExpenses.length, currentPage * itemsPerPage)} of {filteredExpenses.length} transactions
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs px-3 font-semibold">Page {currentPage} of {totalPages}</span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Expense Modal */}
      {modalOpen && (
        <>
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 transition-all" onClick={() => setModalOpen(false)} />
          <div className="fixed inset-y-0 right-0 max-w-lg w-full bg-white dark:bg-slate-900 z-50 shadow-2xl p-6 overflow-y-auto flex flex-col animate-fade-in border-l border-slate-200 dark:border-slate-850">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="text-indigo-500" size={18} />
                <span>{editingExpenseId ? 'Edit Expense Details' : 'Log New Expense'}</span>
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4.5 mt-4 flex-1">
              
              {/* Templates bar (only for adding) */}
              {!editingExpenseId && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Quick Templates</label>
                  <div className="flex flex-wrap gap-2">
                    {templates.map(tpl => (
                      <button
                        key={tpl.label}
                        type="button"
                        onClick={() => applyTemplate(tpl)}
                        className="text-[11px] font-semibold border border-slate-200 dark:border-slate-800 hover:border-violet-500 dark:hover:border-violet-500 px-2.5 py-1.5 rounded-lg hover:bg-violet-500/5 transition-all cursor-pointer"
                      >
                        {tpl.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-transparent"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Category *</label>
                  <select
                    required
                    value={category}
                    onChange={e => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-transparent"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Sub Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Vegetables, Snacks"
                    value={subCategory}
                    onChange={e => setSubCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-transparent"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Onions, Broadband"
                    value={itemName}
                    onChange={e => setItemName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Amount ({settings.currency}) *</label>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-transparent font-extrabold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Paid By *</label>
                  <select
                    required
                    value={paidBy}
                    onChange={e => setPaidBy(e.target.value as MemberName)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-transparent"
                  >
                    <option value="Siddhant">Siddhant</option>
                    <option value="Akash">Akash</option>
                    <option value="Abday">Abday</option>
                    <option value="Rahul">Rahul</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Payment Source</label>
                  <select
                    value={paymentSource}
                    onChange={e => setPaymentSource(e.target.value as 'Flat Fund' | 'Personal')}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-transparent"
                  >
                    <option value="Flat Fund">Flat Fund</option>
                    <option value="Personal">Personal Cash</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-transparent"
                  >
                    {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Shop Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Amazon"
                    value={shopName}
                    onChange={e => setShopName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Bill Available?</label>
                  <select
                    value={billAvailable}
                    onChange={e => setBillAvailable(e.target.value as 'Yes' | 'No')}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-transparent"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="shared, party, veggies"
                    value={tagsInput}
                    onChange={e => setTagsInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Short description or item detail"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-transparent"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Notes / Reminders</label>
                <textarea
                  placeholder="Any extra comments or split details"
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-transparent resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Bill Photo URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://example.com/receipt.jpg"
                  value={photoUrl}
                  onChange={e => setPhotoUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-transparent"
                />
                {photoUrl && (
                  <div className="mt-2 border border-slate-200 dark:border-slate-800 rounded-lg p-2 flex items-center justify-between bg-slate-50 dark:bg-slate-950/20">
                    <span className="text-xs text-slate-500 truncate flex items-center gap-1.5">
                      <Eye size={12} />
                      Preview Available
                    </span>
                    <a href={photoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-violet-500 font-semibold hover:underline">
                      Open Image
                    </a>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`flex items-center justify-center gap-1 px-4 py-2 border rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isFavorite
                      ? 'bg-amber-50 border-amber-200 text-amber-600'
                      : 'border-slate-200 text-slate-500'
                  }`}
                >
                  <Star size={14} fill={isFavorite ? "currentColor" : "none"} />
                  <span>Favorite</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsRecurring(!isRecurring)}
                  className={`flex items-center justify-center gap-1 px-4 py-2 border rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isRecurring
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                      : 'border-slate-200 text-slate-500'
                  }`}
                >
                  <RefreshCw size={14} />
                  <span>Recurring</span>
                </button>
                
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all cursor-pointer text-center"
                >
                  {editingExpenseId ? 'Update Log' : 'Log Transaction'}
                </button>
              </div>

            </form>
          </div>
        </>
      )}

    </div>
  );
};
