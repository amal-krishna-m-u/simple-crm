'use client';

import Modal from './Modal';
import type { Customer } from '@/lib/types';

interface CustomersListModalProps {
    isOpen: boolean;
    onClose: () => void;
    customers: Customer[];
    onOpenProfile: (customer: Customer) => void;
}

export default function CustomersListModal({
    isOpen,
    onClose,
    customers,
    onOpenProfile,
}: CustomersListModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Customers"
            footer={
                <button className="btn btn-primary" onClick={onClose}>
                    Close
                </button>
            }
        >
            {customers.length === 0 ? (
                <div className="no-reminders">No customers saved yet.</div>
            ) : (
                customers.map(customer => (
                    <div key={customer.$id} className="customer-row">
                        <div className="customer-row-main">
                            <div className="customer-row-name">{customer.name}</div>
                            <div className="customer-row-details">
                                {[
                                    customer.details,
                                    customer.phone ? `Phone: ${customer.phone}` : '',
                                    customer.email ? `Email: ${customer.email}` : '',
                                ]
                                    .filter(Boolean)
                                    .join(' | ')}
                            </div>
                        </div>
                        <button
                            className="btn"
                            onClick={() => {
                                onOpenProfile(customer);
                                onClose();
                            }}
                        >
                            Open Profile
                        </button>
                    </div>
                ))
            )}
        </Modal>
    );
}
