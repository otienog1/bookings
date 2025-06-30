import { api } from './api';
import { API_ENDPOINTS, paymentsApiUrl } from '@/config/apiEndpoints';

export const paymentApi = {
    // Create invoice for a booking
    createInvoice: (invoiceData: any, token: string) =>
        api.post(API_ENDPOINTS.PAYMENTS.CREATE_INVOICE, invoiceData, token),

    // Get invoice details (public)
    getInvoice: (invoiceId: string) =>
        fetch(paymentsApiUrl(API_ENDPOINTS.PAYMENTS.GET_INVOICE(invoiceId)))
            .then(res => res.json()),

    // Initialize payment
    initializePayment: (data: { invoice_id: string; customer_email?: string }) =>
        api.post(API_ENDPOINTS.PAYMENTS.INITIALIZE, data),

    // Verify payment
    verifyPayment: (reference: string) =>
        fetch(paymentsApiUrl(API_ENDPOINTS.PAYMENTS.VERIFY(reference)))
            .then(res => res.json()),

    // Get user's invoices
    getInvoices: (token: string) =>
        api.get(API_ENDPOINTS.PAYMENTS.INVOICES, token),

    // Cancel invoice
    cancelInvoice: (invoiceId: string, token: string) =>
        api.put(API_ENDPOINTS.PAYMENTS.CANCEL_INVOICE(invoiceId), {}, token)
};