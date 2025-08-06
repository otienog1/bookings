"use client"

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Invoice } from '@/types/PaymentTypes';
import { paymentApi } from '@/utils/paymentApi';
import InvoiceDisplay from '@/components/payment/InvoiceDisplay';
import UILoader from '@/components/UILoader';

const InvoicePage: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const response = await paymentApi.getInvoice(params.id as string);
                if (response.success) {
                    setInvoice(response.invoice);
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

    const handlePayNow = () => {
        if (invoice) {
            router.push(`/payment/process/${invoice.id}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <UILoader text="Loading invoice..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Invoice Not Found</h1>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {invoice && (
                    <InvoiceDisplay
                        invoice={invoice}
                        showPayButton={invoice.status === 'pending'}
                        onPayNow={handlePayNow}
                    />
                )}
            </div>
        </div>
    );
};

export default InvoicePage;