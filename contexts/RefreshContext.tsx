'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface RefreshContextType {
  dashboardRefreshTrigger: number;
  refreshDashboard: () => void;
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

export function RefreshProvider({ children }: { children: ReactNode }) {
  const [dashboardRefreshTrigger, setDashboardRefreshTrigger] = useState(0);

  const refreshDashboard = () => {
    setDashboardRefreshTrigger(prev => prev + 1);
  };

  return (
    <RefreshContext.Provider value={{
      dashboardRefreshTrigger,
      refreshDashboard
    }}>
      {children}
    </RefreshContext.Provider>
  );
}

export function useRefresh() {
  const context = useContext(RefreshContext);
  if (context === undefined) {
    throw new Error('useRefresh must be used within a RefreshProvider');
  }
  return context;
}