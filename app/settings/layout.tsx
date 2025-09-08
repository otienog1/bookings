"use client"

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import AppLayout from '../AppLayout';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppLayout>
      <ProtectedRoute>
        {children}
      </ProtectedRoute>
    </AppLayout>
  );
}