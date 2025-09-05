"use client"

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthContext';
import { redirect } from 'next/navigation';
import UILoader from '@/components/UILoader';

export default function RegisterPage() {
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
      <div className="max-w-md w-full space-y-8 p-8 bg-card rounded-md shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Join our safari booking platform
          </p>
        </div>
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Registration is not yet available.</p>
          <p className="text-sm text-muted-foreground mb-6">Please contact your administrator to create an account.</p>
          <Link
            href="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Sign In Instead
          </Link>
        </div>
      </div>
    </div>
  );
}