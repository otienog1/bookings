"use client"

import React, { useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        return
        // if (e.target === e.currentTarget) {
        //     onClose();
        // }
    };

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 uppercase z-50"
            onClick={handleBackdropClick}
        >
            <div className="bg-white p-6 w-11/12 md:w-2/3 lg:w-1/2 xl:w-1/3 max-h-[90vh] overflow-y-auto -lg">
                <div className="relative">
                    <button
                        onClick={onClose}
                        className="absolute -top-2 -right-2 p-2 text-gray-500 hover:text-gray-700"
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;