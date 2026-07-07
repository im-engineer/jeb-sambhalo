import React, { useState } from 'react';
import { AppProvider } from './AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ExpenseManager } from './components/ExpenseManager';
import { Settlement } from './components/Settlement';
import { Budgets } from './components/Budgets';
import { Inventory } from './components/Inventory';
import { Contributions } from './components/Contributions';
import { Trackers } from './components/Trackers';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { History } from './components/History';

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('dashboard');

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'expenses':
        return <ExpenseManager />;
      case 'settlements':
        return <Settlement />;
      case 'budgets':
        return <Budgets />;
      case 'inventory':
        return <Inventory />;
      case 'contributions':
        return <Contributions />;
      case 'trackers':
        return <Trackers />;
      case 'reports':
        return <Reports />;
      case 'history':
        return <History />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentTab={currentTab} setCurrentTab={setCurrentTab}>
      {renderContent()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
