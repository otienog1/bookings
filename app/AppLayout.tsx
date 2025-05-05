"use client"

import React from 'react';
import { useAuth } from '@/components/auth/AuthContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {isAuthenticated && (
        <header className="bg-gray-800 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-lg font-semibold uppercase">Booking Management System</h1>
            <div className="flex items-center gap-4">
              <span className="text-xs">
                Welcome, {user?.first_name || user?.username} ({user?.role})
              </span>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-xs rounded transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
      )}
      <main className="flex-grow container mx-auto mb-4">
        {children}
      </main>
      <footer className="bg-gray-100 p-4 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} Booking Management System | All rights reserved | Version 1.0.
      </footer>
    </div>
  );
};

export default AppLayout;