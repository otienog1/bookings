"use client"

import React from 'react';
import { Invoice } from '@/types/PaymentTypes';
import { format } from 'date-fns';

interface InvoiceDisplayProps {
    invoice: Invoice;
    showPayButton?: boolean;
    onPayNow?: () => void;
    isLoading?: boolean;
}

const InvoiceDisplay: React.FC<InvoiceDisplayProps> = ({
    invoice,
    showPayButton = true,
    onPayNow,
    isLoading = false
}) => {
    const formatCurrency = (amount: number, currency: string = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'MMM dd, yyyy');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'text-green-600 bg-green-100';
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            case 'cancelled': return 'text-red-600 bg-red-100';
            case 'expired': return 'text-gray-600 bg-gray-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-green-600 text-white p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold">SAFARI INVOICE</h1>
                        <p className="text-green-100 mt-2">Invoice #{invoice.invoice_number}</p>
                    </div>
                    <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                            {invoice.status.toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Invoice Details */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Customer Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Bill To:</h3>
                        <div className="space-y-1">
                            <p className="font-medium text-gray-900">{invoice.customer_name}</p>
                            {invoice.customer_email && (
                                <p className="text-gray-600">{invoice.customer_email}</p>
                            )}
                            {invoice.customer_phone && (
                                <p className="text-gray-600">{invoice.customer_phone}</p>
                            )}
                        </div>
                    </div>

                    {/* Invoice Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Invoice Details:</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Invoice Date:</span>
                                <span className="font-medium">{formatDate(invoice.created_at || '')}</span>
                            </div>
                            {invoice.due_date && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Due Date:</span>
                                    <span className="font-medium">{formatDate(invoice.due_date)}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-600">Currency:</span>
                                <span className="font-medium">{invoice.currency}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Package Details */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Safari Package Details:</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">{invoice.package_name}</h4>
                        {invoice.package_description && (
                            <p className="text-gray-600 mb-3">{invoice.package_description}</p>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Destination:</span>
                                <p className="font-medium">{invoice.destination}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Start Date:</span>
                                <p className="font-medium">{formatDate(invoice.start_date)}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">End Date:</span>
                                <p className="font-medium">{formatDate(invoice.end_date)}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Duration:</span>
                                <p className="font-medium">{invoice.duration_days} days</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pricing Breakdown */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Pricing Breakdown:</h3>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Description</th>
                                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Quantity</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Unit Price</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <tr>
                                    <td className="px-4 py-3 text-sm text-gray-900">Safari Package per Person</td>
                                    <td className="px-4 py-3 text-sm text-gray-900 text-center">{invoice.total_pax}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                                        {formatCurrency(invoice.base_price, invoice.currency)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                                        {formatCurrency(invoice.subtotal, invoice.currency)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                    <div className="w-full max-w-sm">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-medium">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
                            </div>
                            {invoice.tax_amount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tax:</span>
                                    <span className="font-medium">{formatCurrency(invoice.tax_amount, invoice.currency)}</span>
                                </div>
                            )}
                            {invoice.discount_amount > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Discount:</span>
                                    <span className="font-medium">-{formatCurrency(invoice.discount_amount, invoice.currency)}</span>
                                </div>
                            )}
                            <div className="border-t pt-2">
                                <div className="flex justify-between">
                                    <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                                    <span className="text-2xl font-bold text-green-600">
                                        {formatCurrency(invoice.total_amount, invoice.currency)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {invoice.notes && (
                    <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Notes:</h4>
                        <p className="text-blue-800 text-sm">{invoice.notes}</p>
                    </div>
                )}

                {/* Pay Now Button */}
                {showPayButton && invoice.status === 'pending' && onPayNow && (
                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={onPayNow}
                            disabled={isLoading}
                            className="px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 transition duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Processing...' : `Pay ${formatCurrency(invoice.total_amount, invoice.currency)} Now`}
                        </button>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-4 text-center text-sm text-gray-600">
                <p>Thank you for choosing our safari services!</p>
                <p className="mt-1">For questions about this invoice, please contact our support team.</p>
            </div>
        </div>
    );
};

export default InvoiceDisplay;