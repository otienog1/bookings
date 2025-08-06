"use client"

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { paymentApi } from '@/utils/paymentApi';
import { Invoice, Payment } from '@/types/PaymentTypes';
import UILoader from '@/components/UILoader';
import Link from 'next/link';

const PaymentSuccessPage: React.FC = () => {
    const params = useParams();
    const searchParams = useSearchParams();
    const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [payment, setPayment] = useState<Payment | null>(null);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const verifyPayment = async () => {
            const reference = searchParams.get('reference');

            if (!reference) {
                setVerificationStatus('failed');
                setError('Payment reference not found');
                return;
            }

            try {
                const response = await paymentApi.verifyPayment(reference);

                if (response.success) {
                    setVerificationStatus('success');
                    setInvoice(response.invoice);
                    setPayment(response.payment);
                } else {
                    setVerificationStatus('failed');
                    setError(response.error || 'Payment verification failed');
                }
            } catch {
                setVerificationStatus('failed');
                setError('Failed to verify payment');
            }
        };

        verifyPayment();
    }, [searchParams]);

    const formatCurrency = (amount: number, currency: string = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    };

    if (verificationStatus === 'verifying') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <UILoader text="Verifying your payment..." />
                    <p className="mt-4 text-gray-600">Please wait while we confirm your payment</p>
                </div>
            </div>
        );
    }

    if (verificationStatus === 'failed') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Verification Failed</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <div className="space-y-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => window.history.back()}
                            className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Success Header */}
                <div className="bg-green-600 text-white p-8 text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
                    <p className="text-green-100">Your safari booking payment has been processed successfully</p>
                </div>

                {/* Payment Details */}
                <div className="p-8">
                    {invoice && payment && (
                        <>
                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Payment Details</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Transaction ID:</span>
                                            <span className="font-medium">{payment.provider_reference}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Amount Paid:</span>
                                            <span className="font-medium text-green-600">
                                                {formatCurrency(payment.amount, payment.currency)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Payment Method:</span>
                                            <span className="font-medium capitalize">{payment.payment_method}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Date:</span>
                                            <span className="font-medium">
                                                {new Date(payment.created_at || '').toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Booking Details</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Invoice #:</span>
                                            <span className="font-medium">{invoice.invoice_number}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Package:</span>
                                            <span className="font-medium">{invoice.package_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Destination:</span>
                                            <span className="font-medium">{invoice.destination}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Duration:</span>
                                            <span className="font-medium">{invoice.duration_days} days</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Next Steps */}
                            <div className="bg-blue-50 p-6 rounded-lg mb-6">
                                <h3 className="text-lg font-semibold text-blue-900 mb-3">What&apos;s Next?</h3>
                                <ul className="space-y-2 text-blue-800 text-sm">
                                    <li className="flex items-start">
                                        <span className="text-blue-600 mr-2">•</span>
                                        You will receive a payment confirmation email shortly
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-blue-600 mr-2">•</span>
                                        Our team will contact you within 24 hours to finalize your safari details
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-blue-600 mr-2">•</span>
                                        Detailed itinerary and travel information will be provided before your trip
                                    </li>
                                </ul>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    href={`/payment/invoice/${invoice.id}`}
                                    className="flex-1 bg-green-600 text-white text-center py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition duration-200"
                                >
                                    View Invoice
                                </Link>
                                <button
                                    onClick={() => window.print()}
                                    className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition duration-200"
                                >
                                    Print Receipt
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccessPage;