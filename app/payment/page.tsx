'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
    CreditCard, Users, Home
} from 'lucide-react';
import UILoader from '@/components/UILoader';

// Constants for validation and configuration
const VALIDATION_RULES = {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^[+]?[\d\s-]{10,}$/,
    MIN_PAX: 1,
    MAX_PAX: 10,
};

// Enhanced interface with more robust type definitions
interface SafariBooking {
    bookingId: string;
    client: string;
    email: string;
    phone: string;
    pax: number;
    totalPrice: number;
    cardDetails: {
        cardNumber: string;
        cardName: string;
        expiry: string;
        cvv: string;
    };
    address: {
        street: string;
        city: string;
        country: string;
        zipCode: string;
    };
}

// Separate error handling type
interface FormErrors {
    [key: string]: string;
}

const SafariPaymentForm: React.FC = () => {
    // Memoized initial state for consistent reset
    const initialBookingState: SafariBooking = useMemo(() => ({
        bookingId: '',
        client: '',
        email: '',
        phone: '',
        pax: 1,
        totalPrice: 0,
        cardDetails: {
            cardNumber: '',
            cardName: '',
            expiry: '',
            cvv: ''
        },
        address: {
            street: '',
            city: '',
            country: '',
            zipCode: ''
        }
    }), []);

    const [booking, setBooking] = useState<SafariBooking>(initialBookingState);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Enhanced validation utilities with more descriptive error messages
    const validateField = {
        email: (value: string) => ({
            isValid: VALIDATION_RULES.EMAIL_REGEX.test(value),
            errorMessage: 'Please enter a valid email address (e.g., user@example.com)'
        }),
        phone: (value: string) => ({
            isValid: VALIDATION_RULES.PHONE_REGEX.test(value),
            errorMessage: 'Please enter a valid phone number with at least 10 digits'
        }),
        cardNumber: (cardNumber: string) => {
            const digits = cardNumber.replace(/\D/g, '');
            const isValidLength = digits.length >= 12 && digits.length <= 19;
            const isValidLuhn = (() => {
                let sum = 0;
                let isEven = false;
                for (let i = digits.length - 1; i >= 0; i--) {
                    let digit = parseInt(digits.charAt(i), 10);

                    if (isEven) {
                        digit *= 2;
                        if (digit > 9) {
                            digit -= 9;
                        }
                    }

                    sum += digit;
                    isEven = !isEven;
                }

                return (sum % 10) === 0;
            })();

            return {
                isValid: isValidLength && isValidLuhn,
                errorMessage: 'Invalid credit card number. Please check the number.'
            };
        }
    };

    // Centralized error management
    const addError = (field: string, message: string) => {
        setErrors(prev => ({ ...prev, [field]: message }));
    };

    const clearError = (field: string) => {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    };

    // Fetch booking details with improved error handling
    useEffect(() => {
        const fetchBookingDetails = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/safari-booking/details', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        // Consider adding authentication headers if needed
                        // 'Authorization': `Bearer ${authToken}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Unable to fetch booking details');
                }

                const data = await response.json();
                setBooking(prev => ({
                    ...prev,
                    ...data
                }));
            } catch (error) {
                console.error('Booking details fetch failed:', error);
                // Consider adding user-friendly error notification
                alert('Unable to load booking details. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookingDetails();
    }, []);

    // More robust input change handler
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const dataset = (e.target as HTMLInputElement).dataset;

        const updateNestedState = (parentKey: string) => {
            setBooking(prev => ({
                ...prev,
                [parentKey]: {
                    ...prev[parentKey as keyof SafariBooking],
                    [name]: value
                }
            }));
        };

        // Intelligent input handling
        if (dataset?.parent) {
            updateNestedState(dataset.parent);
        } else {
            setBooking(prev => ({
                ...prev,
                [name]: name === 'pax'
                    ? Math.max(VALIDATION_RULES.MIN_PAX,
                        Math.min(VALIDATION_RULES.MAX_PAX, parseInt(value) || VALIDATION_RULES.MIN_PAX))
                    : value
            }));
        }

        // Clear associated errors
        clearError(name);
    }, []);

    // Comprehensive form validation
    const validateForm = useCallback(() => {
        const newErrors: FormErrors = {};

        // Validation rules with more detailed checks
        const validationRules = [
            {
                field: 'email',
                validate: validateField.email,
                errorKey: 'email'
            },
            {
                field: 'phone',
                validate: validateField.phone,
                errorKey: 'phone'
            },
            {
                field: 'cardDetails.cardNumber',
                validate: validateField.cardNumber,
                errorKey: 'cardDetails.cardNumber'
            }
        ];

        // Perform validation with more granular error tracking
        validationRules.forEach(rule => {
            const fieldPath = rule.field.split('.');
            const value = fieldPath.length > 1
                ? booking[fieldPath[0] as keyof SafariBooking][fieldPath[1] as keyof typeof booking.cardDetails]
                : booking[rule.field as keyof SafariBooking];

            const validationResult = rule.validate(value as string);
            if (!validationResult.isValid) {
                newErrors[rule.errorKey] = validationResult.errorMessage;
            }
        });

        // Comprehensive field validations
        const requiredFields = [
            { section: 'address', fields: ['street', 'city', 'country', 'zipCode'] },
            { section: 'cardDetails', fields: ['cardName', 'expiry', 'cvv'] }
        ];

        requiredFields.forEach(({ section, fields }) => {
            fields.forEach(field => {
                const fullField = `${section}.${field}`;
                const value = booking[section as keyof SafariBooking][field as keyof typeof booking.address];

                if (!value || value.trim() === '') {
                    newErrors[fullField] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
                }
            });
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [booking]);

    // Enhanced form submission with more robust error handling
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (validateForm()) {
                const response = await fetch('/api/safari-booking/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // Add any necessary authentication headers
                    },
                    body: JSON.stringify(booking)
                });

                if (!response.ok) {
                    throw new Error('Booking submission failed');
                }

                // Consider more sophisticated success handling
                alert('Safari Booking Submitted Successfully!');
                setBooking(initialBookingState);
            }
        } catch (error) {
            console.error('Booking submission error:', error);
            alert('Unable to submit booking. Please check your information and try again.');
        } finally {
            setIsSubmitting(false);
        }
    }, [validateForm, initialBookingState, booking]);

    // Render input field with improved error handling and accessibility
    const renderInputField = (
        name: string,
        label: string,
        icon: React.ReactNode,
        type: string = 'text',
        placeholder?: string,
        parentKey?: string
    ) => {
        const fullFieldName = parentKey ? `${parentKey}.${name}` : name;
        const value = parentKey
            ? booking[parentKey as keyof SafariBooking][name as keyof typeof booking.cardDetails]
            : booking[name as keyof SafariBooking];

        const isDisabled = ['bookingId', 'client', 'pax', 'totalPrice'].includes(name);

        return (
            <div>
                <label
                    htmlFor={fullFieldName}
                    className="flex items-center text-gray-700 mt-2 mb-2"
                >
                    {icon}
                    <span className="">{label}</span>
                </label>
                <input
                    id={fullFieldName}
                    type={type}
                    name={name}
                    data-parent={parentKey}
                    value={value as string}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    disabled={isDisabled}
                    aria-invalid={!!errors[fullFieldName]}
                    aria-describedby={errors[fullFieldName] ? `${fullFieldName}-error` : undefined}
                    className={`w-full p-2 border rounded
                        ${errors[fullFieldName]
                            ? 'border-red-500 focus:ring-red-300'
                            : 'focus:border-blue-500 focus:ring-blue-300'}
                        focus:outline-none focus:ring-2
                        ${isDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
                {errors[fullFieldName] && (
                    <p
                        id={`${fullFieldName}-error`}
                        className="text-red-500 text-sm mt-1"
                    >
                        {errors[fullFieldName]}
                    </p>
                )}
            </div>
        );
    };

    // Loading state with improved UX
    if (isLoading) {
        return (
            <UILoader />
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 w-full max-w-screen-xl">
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
                    Safari Booking Payment
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <div className='flex w-full space-x-12'>
                        <div className='w-1/2'>
                            {/* Booking Details Section */}
                            <h4 className='flex space-x-2 font-semibold mt-6 mb-4'><Users className="text-blue-500" /><span>Booking Details</span></h4>
                            <div className="grid grid-cols-2 gap-4">
                                {renderInputField('bookingId', 'Booking Reference', '')}
                                {renderInputField('client', 'Client', '')}
                            </div>

                            {/* Booking Participants and Price */}
                            <div className="grid grid-cols-2 gap-4">
                                {renderInputField('pax', 'Pax', '', 'number')}
                                <div>
                                    <label className="flex items-center text-gray-700 my-2">
                                        Total Price
                                    </label>
                                    <input
                                        type="text"
                                        readOnly
                                        value={`$${booking.totalPrice.toFixed(2)}`}
                                        className="w-full p-2 border bg-gray-100 cursor-not-allowed rounded"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className='w-1/2'>
                            <h4 className='flex space-x-2 font-semibold mt-6 mb-4'><Home className="text-blue-500" /><span>Address</span></h4>
                            <div className="space-y-4">
                                {renderInputField('street', 'Street Address', '', 'text', 'Street Address', 'address')}
                                <div className="grid grid-cols-3 gap-4">
                                    {renderInputField('country', 'Country', null, 'text', 'Country', 'address')}
                                    {renderInputField('city', 'City', null, 'text', 'City', 'address')}
                                    {renderInputField('zipCode', 'Zip Code', null, 'text', 'Zip Code', 'address')}
                                </div>
                            </div>

                            {/* Payment Details Section */}
                            <h4 className='flex space-x-2 font-semibold mt-6 mb-4'><CreditCard className="text-blue-500" /><span>Card Details</span></h4>
                            <div className="">
                                {renderInputField('cardName', `Cardholder's Name`, '', 'text', 'Name on Card', 'cardDetails')}
                            </div>
                            <div className="">
                                {renderInputField('cardNumber', 'Card Number', '', 'text', '**** **** **** ****', 'cardDetails')}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {renderInputField('expiry', 'Expiry', '', 'text', 'MM/YY', 'cardDetails')}
                                {renderInputField('cvv', 'CVV', null, 'text', '***', 'cardDetails')}
                            </div>

                            {/* Submit Button */}
                            <div className="text-center pt-6">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full py-3 text-white font-bold rounded 
                                ${isSubmitting
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700 transition-colors'}`}
                                >
                                    {isSubmitting ? 'Processing...' : 'Submit Payment'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SafariPaymentForm;