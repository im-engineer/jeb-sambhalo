import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Settings as SettingsIcon, Download, Upload, Trash2, CalendarRange, Moon, Sun, Sparkles, Copy, Check, RefreshCw } from 'lucide-react';

export const Settings: React.FC = () => {
  const {
    settings,
    updateSettings,
    exportBackup,
    importBackup,
    resetAllData,
    startNewMonth,
    remainingBalance,
    // Sync states & actions
    isSyncing,
    syncError,
    lastSyncedTime,
    enableSync,
    disableSync,
    createSyncGroup,
    pushToCloud,
    pullFromCloud,
  } = useApp();

  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [carryBalance, setCarryBalance] = useState(true);
  const [showNewMonthConfirm, setShowNewMonthConfirm] = useState(false);
  const [syncInputId, setSyncInputId] = useState(settings.syncId || '');
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    if (!settings.syncId) return;
    navigator.clipboard.writeText(settings.syncId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateSync = async () => {
    try {
      const id = await createSyncGroup();
      setSyncInputId(id);
    } catch (e) {
      // Error handled in state
    }
  };

  const handleConnectSync = async () => {
    if (!syncInputId) return;
    const ok = await enableSync(syncInputId);
    if (ok) {
      alert('Connected to Sync group successfully! Loaded latest flat ledger.');
    }
  };

  const handleDisconnectSync = () => {
    if (window.confirm('Disconnect from cloud sync? Your local data will remain, but updates will no longer sync.')) {
      disableSync();
    }
  };

  // Backup Export
  const handleExport = () => {
    const backupJson = exportBackup();
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `flat_expense_manager_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Backup Import
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const success = importBackup(text);
      if (success) {
        setImportStatus('success');
        setTimeout(() => setImportStatus('idle'), 3000);
      } else {
        setImportStatus('error');
        setTimeout(() => setImportStatus('idle'), 3000);
      }
    };
    reader.readAsText(file);
  };

  // Reset Trigger
  const handleReset = () => {
    if (window.confirm('WARNING: This will permanently delete all expenses, inventory data, settings, and histories. Are you absolutely sure?')) {
      resetAllData();
      alert('Data reset successfully.');
    }
  };

  // Start New Month Trigger
  const handleStartNewMonth = () => {
    startNewMonth(carryBalance);
    setShowNewMonthConfirm(false);
    alert('Started a new month successfully!');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">System Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage currency, themes, backups, and transition to a new month.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Basic Configurations */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <SettingsIcon size={16} className="text-violet-500" />
            <span>Preferences</span>
          </h3>

          <div className="space-y-4">
            {/* Currency Select */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Local Currency Symbol</label>
              <select
                value={settings.currency}
                onChange={e => updateSettings({ currency: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-transparent font-bold"
              >
                <option value="₹">₹ (INR - Rupee)</option>
                <option value="$">$ (USD - Dollar)</option>
                <option value="€">€ (EUR - Euro)</option>
                <option value="£">£ (GBP - Pound)</option>
              </select>
            </div>

            {/* Dark mode switch */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-2">Display Theme</label>
              <div className="flex gap-2">
                <button
                  onClick={() => updateSettings({ theme: 'light' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 border rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    settings.theme === 'light'
                      ? 'bg-slate-100 dark:bg-slate-800 border-slate-350 dark:border-slate-700'
                      : 'border-slate-200 text-slate-400'
                  }`}
                >
                  <Sun size={14} />
                  <span>Light Mode</span>
                </button>
                <button
                  onClick={() => updateSettings({ theme: 'dark' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 border rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    settings.theme === 'dark'
                      ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-750'
                      : 'border-slate-200 text-slate-400'
                  }`}
                >
                  <Moon size={14} />
                  <span>Dark Mode</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Backups Panel */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Download size={16} className="text-indigo-500" />
            <span>Backup & Restore</span>
          </h3>

          <div className="space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              Export your flat's expenditures, groceries, and configuration to a local JSON file, or restore from a previously exported backup.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleExport}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-semibold hover:opacity-90 shadow-sm transition-all cursor-pointer"
              >
                <Download size={14} />
                <span>Export JSON Backup</span>
              </button>

              <label className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer bg-white dark:bg-slate-900">
                <Upload size={14} />
                <span>Import Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>

            {importStatus === 'success' && (
              <p className="text-xs text-emerald-500 font-bold text-center">Backup restored successfully!</p>
            )}
            {importStatus === 'error' && (
              <p className="text-xs text-rose-500 font-bold text-center">Failed to import. Invalid JSON backup file.</p>
            )}
          </div>
        </div>

      </div>

      {/* Cloud Sync Panel */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <RefreshCw size={16} className={`text-indigo-500 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Flatmates Cloud Sync (Real-time Sharing)</span>
          </h3>
          
          {settings.isSyncEnabled && (
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold uppercase tracking-wider">
              Sync Enabled
            </span>
          )}
        </div>

        <div className="space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
            Sync your flat's expenses, grocery inventory, budgets, and bills in real-time across your flatmates' phones and browsers. 
            One person can **Create** a group, and the rest can **Connect** using the shared Flat Sync ID.
          </p>

          {syncError && (
            <p className="text-xs text-rose-500 font-bold bg-rose-500/10 px-3 py-2 rounded-lg">{syncError}</p>
          )}

          {!settings.isSyncEnabled ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Option A: Connect */}
              <div className="space-y-3 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10">
                <h4 className="font-bold text-xs">Option A: Connect to Existing Group</h4>
                <p className="text-[10px] text-slate-400">Paste your flatmate's shared Flat Sync ID to sync their data to this device.</p>
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Enter Flat Sync ID (e.g. 9924-aefc...)"
                    value={syncInputId}
                    onChange={e => setSyncInputId(e.target.value.trim())}
                    className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-850 rounded-lg text-xs bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleConnectSync}
                    disabled={isSyncing || !syncInputId}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-755 text-white rounded-lg text-xs font-bold disabled:opacity-50 cursor-pointer"
                  >
                    Connect
                  </button>
                </div>
              </div>

              {/* Option B: Create */}
              <div className="space-y-3 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-xs">Option B: Start New Sync Group</h4>
                  <p className="text-[10px] text-slate-400">Initialize a new cloud database with this device's current data. This generates a unique Flat Sync ID.</p>
                </div>
                <button
                  type="button"
                  onClick={handleCreateSync}
                  disabled={isSyncing}
                  className="w-full py-2 border border-slate-205 dark:border-slate-855 hover:bg-slate-55 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-200 rounded-lg text-xs font-bold cursor-pointer bg-white dark:bg-slate-900 shadow-xs"
                >
                  Create Sync Group
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/5 space-y-3">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block font-sans">Active Flat Sync ID (Share with Flatmates)</span>
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white select-all break-all">{settings.syncId}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-bold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 shrink-0 bg-white dark:bg-slate-900 cursor-pointer"
                  >
                    {copied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                    <span>{copied ? 'Copied' : 'Copy ID'}</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3 border-t border-slate-200/50 dark:border-slate-800/40 pt-3 text-[10px] text-slate-450">
                  <span>Last Sync Status: {lastSyncedTime ? `Synced at ${lastSyncedTime}` : 'Pending sync...'}</span>
                  {settings.autoSync && (
                    <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Auto-sync polling active (12s)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={pullFromCloud}
                  disabled={isSyncing}
                  className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-855 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer bg-white dark:bg-slate-900 shadow-xs"
                >
                  <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
                  <span>Sync Pull (Download)</span>
                </button>
                
                <button
                  type="button"
                  onClick={pushToCloud}
                  disabled={isSyncing}
                  className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-855 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer bg-white dark:bg-slate-900 shadow-xs"
                >
                  <Upload size={13} />
                  <span>Sync Push (Upload)</span>
                </button>

                <button
                  type="button"
                  onClick={handleDisconnectSync}
                  className="px-4 py-2 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-455 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 rounded-xl text-xs font-semibold ml-auto cursor-pointer"
                >
                  Disconnect Sync
                </button>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold select-none pt-2">
                <input
                  type="checkbox"
                  checked={settings.autoSync || false}
                  onChange={e => updateSettings({ autoSync: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-650 border-slate-350 focus:ring-indigo-500"
                />
                <span>Enable Real-time Auto-Syncing (automatically updates when peers make changes)</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Start New Month & Reset Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Start New Month Panel */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <CalendarRange size={16} className="text-blue-500" />
            <span>Cycle Monthly Period</span>
          </h3>

          <p className="text-xs text-slate-400 leading-relaxed">
            Move to the next calendar month. This closes the active logs, creates a historical report, and resets monthly expenditures back to empty while carrying over outstanding balances if selected.
          </p>

          <div className="pt-2">
            <button
              onClick={() => setShowNewMonthConfirm(true)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              Start New Month
            </button>
          </div>
        </div>

        {/* System Reset Panel */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Trash2 size={16} className="text-rose-500" />
            <span>Developer Reset</span>
          </h3>

          <p className="text-xs text-slate-400 leading-relaxed">
            Permanently clear all local data stored in this browser session. This will reset the ledger, inventory logs, settings, and backups completely.
          </p>

          <div className="pt-2">
            <button
              onClick={handleReset}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              Reset Data Store
            </button>
          </div>
        </div>

      </div>

      {/* Start New Month Confirmation Modal */}
      {showNewMonthConfirm && (
        <>
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50" onClick={() => setShowNewMonthConfirm(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-md w-full bg-white dark:bg-slate-900 z-[60] shadow-2xl p-6 rounded-2xl border border-slate-250 dark:border-slate-800 animate-fade-in">
            <h3 className="text-base font-bold flex items-center gap-2 mb-3">
              <Sparkles className="text-indigo-550" size={18} />
              <span>Confirm Starting Next Month</span>
            </h3>
            
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              You are about to start a new month. Current active expenses will be archived to history and the ledger will clear.
            </p>

            <div className="bg-slate-50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mb-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span>Closing Month Balance:</span>
                <span className="font-bold">₹ {remainingBalance.toLocaleString('en-IN')}</span>
              </div>

              {/* Carry Balance toggle checkbox */}
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold select-none">
                <input
                  type="checkbox"
                  checked={carryBalance}
                  onChange={e => setCarryBalance(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                />
                <span>Carry remaining balance as next month's opening fund?</span>
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowNewMonthConfirm(false)}
                className="flex-1 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-55"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartNewMonth}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 shadow-sm"
              >
                Confirm Cycle
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
};
