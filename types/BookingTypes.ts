export interface Booking {
    id: number;
    name: string;
    date_from: string;
    date_to: string;
    country: string;
    pax: number;
    ladies: number;
    men: number;
    children: number;
    teens: number;
    agent_id: number;
    agent: string;
    consultant: string;
    user_id?: number;
    created_by?: string;
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
    token: string;
    booking: Booking | null;
    onSave: (booking: Booking) => void;
    onCancel: () => void;
}