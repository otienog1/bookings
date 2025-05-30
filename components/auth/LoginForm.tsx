"use client"

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from 'next/navigation';
import UILoader from '@/components/UILoader';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, isAuthenticated } = useAuth();
  const router = useRouter();
  const [pageLoading, setPageLoading] = useState(true);
  
  // Check authentication status on initial load
  useEffect(() => {
    // Short timeout to ensure auth state is properly loaded from localStorage
    const checkAuth = setTimeout(() => {
      if (isAuthenticated) {
        router.push('/');
      } else {
        setPageLoading(false);
      }
    }, 100);
    
    return () => clearTimeout(checkAuth);
  }, [isAuthenticated, router]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(username, password);
  };

  // Show loading state while checking authentication
  if (pageLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <UILoader text='Loading...' />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center uppercase">Login</h2>
        
        {error && (
          <Alert className="mb-4 bg-red-50 border-red-200">
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium mb-1 uppercase">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border p-2 text-sm"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium mb-1 uppercase">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="rounded w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 text-sm uppercase transition-colors"
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;