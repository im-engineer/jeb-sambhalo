import React, { useState } from 'react';
import { useApp } from '../AppContext';
import {
  LayoutDashboard,
  ReceiptText,
  Scale,
  Package,
  PiggyBank,
  ListTodo,
  FileBarChart,
  Settings as SettingsIcon,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  Sparkles,
  AlertTriangle,
  History,
  Coins
} from 'lucide-react';

interface LayoutProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentTab, setCurrentTab, children }) => {
  const { settings, updateSettings, notifications, activeExpenses, totalExpensesAmount, history } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const allMonths = React.useMemo(() => {
    const set = new Set<string>();
    set.add(settings.currentMonth);
    history.forEach(h => set.add(h.month));
    set.add('2026-05');
    set.add('2026-06');
    set.add('2026-07');
    set.add('2026-08');
    set.add('2026-09');
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [settings.currentMonth, history]);

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', name: 'Expenses', icon: ReceiptText },
    { id: 'settlements', name: 'Settlements', icon: Scale },
    { id: 'budgets', name: 'Budgets', icon: PiggyBank },
    { id: 'inventory', name: 'Grocery Inventory', icon: Package },
    { id: 'contributions', name: 'Contributions', icon: Coins },
    { id: 'trackers', name: 'Trackers & Tools', icon: ListTodo },
    { id: 'reports', name: 'Reports & Stats', icon: FileBarChart },
    { id: 'history', name: 'Month History', icon: History },
    { id: 'settings', name: 'Settings', icon: SettingsIcon },
  ];

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 flex transition-colors duration-300">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white/40 dark:bg-slate-900/40 border-r border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl p-6 sticky top-0 h-screen z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight">Jeb Sambhalo</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Dashboard</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-600/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 dark:text-slate-400 dark:hover:text-slate-50 dark:hover:bg-slate-800/30'
                }`}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-slate-200/60 dark:border-slate-800/60 pt-4 flex flex-col gap-3">
          <div className="bg-slate-100/60 dark:bg-slate-800/30 rounded-xl p-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex justify-between mb-1">
              <span>Month</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{settings.currentMonth}</span>
            </div>
            <div className="flex justify-between">
              <span>Active Expenses</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{activeExpenses.length}</span>
            </div>
          </div>
          
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-all cursor-pointer"
          >
            <span className="flex items-center gap-2">
              {settings.theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              <span>{settings.theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              Ctrl+D
            </span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="sticky top-0 bg-slate-50/70 dark:bg-slate-950/70 border-b border-slate-200/60 dark:border-slate-800/60 backdrop-blur-md px-6 py-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                <Sparkles size={14} />
              </div>
              <span className="font-bold text-sm tracking-tight">Flat Manager</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-slate-900 dark:text-white capitalize">{currentTab.replace('-', ' ')}</span>
          </div>

          {/* Navigation Utility Actions */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Theme toggle mobile */}
            <button
              onClick={toggleTheme}
              className="lg:hidden p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
            >
              {settings.theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Notifications Menu */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer relative"
              >
                <Bell size={18} />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                )}
              </button>

              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setNotificationsOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 max-h-[480px] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-4 z-40 animate-fade-in">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        <Bell size={16} className="text-indigo-500" />
                        <span>Notifications</span>
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold">
                        {notifications.length} Active
                      </span>
                    </div>

                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                        No alerts or reminders for now!
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {notifications.map((n, i) => (
                          <div
                            key={i}
                            className={`p-3 rounded-xl border text-xs flex gap-2.5 items-start ${
                              n.type === 'danger'
                                ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30 text-rose-800 dark:text-rose-300'
                                : n.type === 'warning'
                                ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30 text-amber-800 dark:text-amber-300'
                                : 'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium leading-relaxed">{n.message}</p>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">{n.date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Month Selector Dropdown */}
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="text-slate-450 dark:text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Workspace Month:</span>
              <select
                value={settings.currentMonth}
                onChange={e => updateSettings({ currentMonth: e.target.value })}
                className="px-3 py-1.5 border border-indigo-100 dark:border-indigo-900/35 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-semibold focus:outline-none cursor-pointer text-xs"
              >
                {allMonths.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 z-50 p-6 flex flex-col shadow-2xl animate-fade-in lg:hidden">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h1 className="font-bold text-base leading-tight">Flat Manager</h1>
                    <p className="text-[10px] text-slate-400">4 Flatmates Dashboard</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="space-y-1">
                {menuItems.map(item => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3 text-xs mb-4 text-slate-500 dark:text-slate-400">
                  <div className="flex justify-between mb-1">
                    <span>Month</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{settings.currentMonth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Expense</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">₹{totalExpensesAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
