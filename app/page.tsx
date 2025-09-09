"use client"

import React from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import UILoader from '@/components/UILoader';
import { Navbar } from '@/components/ui/navbar';
import { Citrus } from 'lucide-react';

export default function HomePage() {
  const { isInitializing } = useAuth();

  // Show loading while checking authentication
  if (isInitializing) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <UILoader text="Loading..." />
      </div>
    );
  }

  // Show landing page for all users (authenticated and non-authenticated)
  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/20 to-blue-50/20 dark:from-green-950/10 dark:to-blue-950/10"></div>
      <div className="relative z-10">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-foreground mb-6">
              Safari Bookings Management
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Manage your safari bookings, track reservations, and explore amazing wildlife destinations with our comprehensive booking platform.
            </p>
          </div>

          <div id="features" className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-md flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 9l6-3-6-3v6z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Easy Booking</h3>
              <p className="text-muted-foreground">Simple and intuitive booking system for your safari adventures</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-md flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Analytics</h3>
              <p className="text-muted-foreground">Track your bookings and revenue with detailed analytics</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 dark:bg-purple-900 rounded-md flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Team Management</h3>
              <p className="text-muted-foreground">Manage your team and agents efficiently</p>
            </div>
          </div>

          {/* About Section */}
          <div id="about" className="mt-32">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">About Safari Bookings</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                We are dedicated to providing the most comprehensive and user-friendly safari booking platform.
                Our system helps travel agencies, tour operators, and safari guides manage their bookings efficiently
                while delivering exceptional experiences to their clients.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Our Mission</h3>
                <p className="text-muted-foreground mb-6">
                  To connect wildlife enthusiasts with unforgettable safari experiences while providing
                  tour operators with the tools they need to manage their business effectively.
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Streamlined booking management
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Real-time availability tracking
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Comprehensive reporting tools
                  </li>
                </ul>
              </div>
              <div className="text-center lg:text-left">
                <div className="w-64 h-64 mx-auto lg:mx-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center">
                  <Citrus className="w-24 h-24 text-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div id="contact" className="mt-32 mb-16">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">Get In Touch</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Ready to transform your safari booking process? Contact us to learn more about our platform
                or to schedule a demo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-6 border border-border rounded-md">
                <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-md flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Email</h3>
                <p className="text-muted-foreground">hello@safaribookings.com</p>
              </div>

              <div className="p-6 border border-border rounded-md">
                <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-md flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Phone</h3>
                <p className="text-muted-foreground">+1 (555) 123-4567</p>
              </div>

              <div className="p-6 border border-border rounded-md">
                <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-md flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Location</h3>
                <p className="text-muted-foreground">San Francisco, CA</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}