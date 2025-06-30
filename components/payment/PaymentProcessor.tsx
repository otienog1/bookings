"use client"

import React, { useState } from 'react';
import { Invoice } from '@/types/PaymentTypes';
import { paymentApi } from '@/utils/paymentApi';

interface PaymentProcessorProps {
    invoice: Invoice;
    onSuccess: (paymentData: any) => void;
    onError: (error: string) => void;
}

const PaymentProcessor: React.FC<PaymentProcessorProps> = ({
    invoice,
    onSuccess,
    onError
}) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [customerEmail, setCustomerEmail] = useState(invoice.customer_email || '');

    const handlePayment = async () => {
        if (!customerEmail) {
            onError('Please enter your email address');
            return;
        }

        setIsProcessing(true);

        try {
            // Initialize payment with Paystack
            const response = await paymentApi.initializePayment({
                invoice_id: invoice.id,
                customer_email: customerEmail
            });

            if (response.success) {
                // Redirect to Paystack payment page
                window.location.href = response.authorization_url;
            } else {
                onError(response.error || 'Failed to initialize payment');
            }
        } catch (error) {
            onError('Payment initialization failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Payment</h2>
                <p className="text-gray-600">Secure card payment powered by Paystack</p>
            </div>

            {/* Customer Email */}
            <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                </label>
                <input
                    type="email"
                    id="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your email address"
                    required
                />
                <p className="text-xs text-gray-500 mt-1">
                    Receipt and booking confirmation will be sent to this email
                </p>
            </div>

            {/* Payment Summary */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Invoice:</span>
                    <span className="font-medium">#{invoice.invoice_number}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Package:</span>
                    <span className="font-medium text-right">{invoice.package_name}</span>
                </div>
                <div className="border-t pt-2">
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total Amount:</span>
                        <span className="text-xl font-bold text-green-600">
                            {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: invoice.currency
                            }).format(invoice.total_amount)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Payment Button */}
            <button
                onClick={handlePayment}
                disabled={isProcessing || !customerEmail}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-green-700 transition duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isProcessing ? 'Redirecting to Payment...' : 'Pay with Card'}
            </button>

            {/* Security Notice */}
            <div className="mt-4 text-center">
                <div className="flex items-center justify-center text-green-600 mb-2">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">Secure Payment</span>
                </div>
                <p className="text-xs text-gray-500">
                    Your payment information is encrypted and secure. We do not store your card details.
                </p>
            </div>
        </div>
    );
};

export default PaymentProcessor;