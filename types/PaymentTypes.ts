export interface Invoice {
    id: string;
    booking_id: number;
    invoice_number: string;
    customer_name: string;
    customer_email?: string;
    customer_phone?: string;
    package_name: string;
    package_description?: string;
    start_date: string;
    end_date: string;
    duration_days: number;
    destination: string;
    base_price: number;
    total_pax: number;
    subtotal: number;
    tax_amount: number;
    discount_amount: number;
    total_amount: number;
    currency: string;
    payment_link?: string;
    status: 'pending' | 'paid' | 'cancelled' | 'expired';
    due_date?: string;
    notes?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Payment {
    id: string;
    invoice_id: string;
    provider: string;
    provider_reference: string;
    provider_transaction_id?: string;
    amount: number;
    currency: string;
    status: 'pending' | 'success' | 'failed' | 'cancelled';
    customer_email?: string;
    payment_method: string;
    failure_reason?: string;
    created_at?: string;
    updated_at?: string;
}

export interface PaymentInitialization {
    success: boolean;
    authorization_url?: string;
    reference?: string;
    error?: string;
}