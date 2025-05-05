"use client"

import React from 'react';
import { AuthProvider, useAuth } from '@/components/auth/AuthContext';
import BookingManagementApp from '@/components/BookingManagementApp';
import LoginForm from '@/components/auth/LoginForm';
import AppLayout from './AppLayout';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <AppLayout>
      {isAuthenticated ? <BookingManagementApp /> : <LoginForm />}
    </AppLayout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;