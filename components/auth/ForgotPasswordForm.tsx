"use client"

import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
      } else {
        setError(data.message || 'An error occurred while sending the reset email.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full md:w-lg space-y-8">
          {/* Success Section */}
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
              Check your email
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We've sent a password reset link to your email address
            </p>
          </div>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <p className="text-xs text-muted-foreground">
                  If you don't see the email, check your spam folder or try again with a different email address.
                </p>
                <div className="pt-4">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/login">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to sign in
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resend Section */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Didn't receive the email?{" "}
              <Button 
                variant="link" 
                className="px-0 font-normal"
                onClick={() => {
                  setIsSuccess(false);
                  setEmail('');
                }}
              >
                Try again
              </Button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full md:w-lg space-y-8">
        {/* Header Section */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
            Forgot your password?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            No worries, we'll send you reset instructions
          </p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="pl-10 h-12"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-base font-medium"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending reset link...
                  </div>
                ) : (
                  'Send reset link'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Back to Login */}
        <div className="text-center">
          <Button asChild variant="link" className="px-0 font-normal">
            <Link href="/login">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to sign in
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;