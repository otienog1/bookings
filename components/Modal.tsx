"use client"

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    backdropClick?: boolean
    children: React.ReactNode
    title?: string
    description?: string
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, backdropClick = true, children, title, description }) => {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent 
                className="w-11/12 md:w-2/3 lg:w-1/2 xl:w-1/3 max-h-[90vh] overflow-y-auto uppercase"
                onPointerDownOutside={(e) => {
                    if (!backdropClick) {
                        e.preventDefault();
                    }
                }}
            >
                {title && (
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        {description && <DialogDescription>{description}</DialogDescription>}
                    </DialogHeader>
                )}
                {children}
            </DialogContent>
        </Dialog>
    );
};

export default Modal;