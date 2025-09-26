export interface Booking {
    id: string | number;
    name: string;
    date_from: string;
    date_to: string;
    country: string;
    pax: number;
    ladies: number;
    men: number;
    children: number;
    teens: number;
    agent_id: string | number;
    agent?: string;
    agent_name?: string;
    agent_country?: string;
    consultant: string;
    user_id?: string | number;
    created_by?: string;
    notes?: string;
    deleted_at?: string | null;
    is_deleted?: boolean;
    [key: string]: unknown;
}

export interface BookingsResponse {
    bookings: Booking[];
}

export interface GroupedBookings {
    [key: string]: {
        [key: string]: Booking[];
    };
}

export interface BookingFormProps {
    // token: string;
    booking: Booking | null;
    onSave: (booking: Booking) => void;
    onCancel: () => void;
}

export interface BookingDocument {
    id: string;
    filename: string;
    category: 'Voucher' | 'Air Ticket' | 'Invoice' | 'Other';
    size: number;
    uploadedAt: string;
    url: string;
    mimeType: string;
    bookingId: string;
}

export interface ShareToken {
    token: string;
    shareUrl: string;
    expiresAt: string;
    categories: string[];
    allowedCategories?: string[];
}

export interface DocumentUploadProgress {
    filename: string;
    progress: number;
    status: 'uploading' | 'completed' | 'error';
    error?: string;
}