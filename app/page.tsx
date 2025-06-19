"use client"

import React from 'react';
import { AuthProvider, useAuth } from '@/components/auth/AuthContext';
import BookingManagementApp from '@/components/BookingManagementApp';
import LoginForm from '@/components/auth/LoginForm';
import AppLayout from './AppLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <AppLayout>
      {isAuthenticated ? (
        <ProtectedRoute>
          <BookingManagementApp />
        </ProtectedRoute>
      ) : (
        <LoginForm />
      )}
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