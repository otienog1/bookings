"use client"

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Invoice } from '@/types/PaymentTypes';
import { paymentApi } from '@/utils/paymentApi';
import PaymentProcessor from '@/components/payment/PaymentProcessor';
import UILoader from '@/components/UILoader';

const PaymentProcessPage: React.FC = () => {
    const params = useParams();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const response = await paymentApi.getInvoice(params.id as string);
                if (response.success) {
                    if (response.invoice.status !== 'pending') {
                        setError('This invoice is not available for payment');
                    } else {
                        setInvoice(response.invoice);
                    }
                } else {
                    setError(response.error || 'Invoice not found');
                }
            } catch {
                setError('Failed to load invoice');
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchInvoice();
        }
    }, [params.id]);

    const handlePaymentSuccess = () => {
        // Payment success will be handled by redirect to success page
    };

    const handlePaymentError = (errorMessage: string) => {
        setError(errorMessage);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <UILoader text="Loading payment details..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Payment Error</h1>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.history.back()}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {invoice && (
                    <PaymentProcessor
                        invoice={invoice}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                    />
                )}
            </div>
        </div>
    );
};

export default PaymentProcessPage;