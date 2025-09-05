"use client"

import React, { useEffect } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/components/auth/AuthContext';
import { redirect } from 'next/navigation';
import UILoader from '@/components/UILoader';

export default function LoginPage() {
  const { isAuthenticated, isInitializing } = useAuth();

  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      redirect('/dashboard');
    }
  }, [isAuthenticated, isInitializing]);

  // Show loading while checking authentication
  if (isInitializing) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <UILoader text="Loading..." />
      </div>
    );
  }

  // If authenticated, redirect will happen
  if (isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <UILoader text="Redirecting to dashboard..." />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <LoginForm />
    </div>
  );
}