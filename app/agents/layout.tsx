"use client"

import React from 'react';
import AppLayout from '../AppLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function AgentsLayout({
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