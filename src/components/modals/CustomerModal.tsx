'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import type { Customer, CustomerMember } from '@/lib/types';

interface CustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: Customer | null;
    onSave: (data: Partial<Customer>) => void;
}

export default function CustomerModal({
    isOpen,
    onClose,
    customer,
    onSave,
}: CustomerModalProps) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [members, setMembers] = useState<CustomerMember[]>([]);

    useEffect(() => {
        if (customer) {
            setName(customer.name);
            setPhone(customer.phone);
            setEmail(customer.email);
            setMembers(customer.members || []);
        } else {
            setName('');
            setPhone('');
            setEmail('');
            setMembers([]);
        }
    }, [customer, isOpen]);

    function handleAddMember() {
        setMembers([...members, { name: '' }]);
    }

    function handleRemoveMember(index: number) {
        setMembers(members.filter((_, i) => i !== index));
    }

    function handleMemberNameChange(index: number, newName: string) {
        const updated = [...members];
        updated[index] = { name: newName.toUpperCase() };
        setMembers(updated);
    }

    function handleSave() {
        onSave({
            name: name.toUpperCase(),
            phone,
            email,
            members: members.filter(m => m.name.trim()),
        });
        onClose();
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={customer ? `Customer Profile – ${customer.name}` : 'New Customer'}
            footer={
                <button className="btn btn-primary" onClick={handleSave}>
                    Save Profile
                </button>
            }
        >
            <div className="profile-sections">
                <div className="profile-section">
                    <h3>Owner</h3>
                    <label>
                        Name
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value.toUpperCase())}
                            placeholder="CUSTOMER NAME"
                        />
                    </label>
                    <label>
                        Phone
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Phone number"
                        />
                    </label>
                    <label>
                        Email
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email address"
                        />
                    </label>
                    <div className="attachments-group">
                        <strong style={{ fontSize: '12px' }}>Attachments</strong>
                        <label>Passport <input type="file" disabled /></label>
                        <label>Aadhar <input type="file" disabled /></label>
                        <label>PAN <input type="file" disabled /></label>
                        <small style={{ fontSize: '10px', color: '#777' }}>
                            (File uploads coming soon)
                        </small>
                    </div>
                </div>
                <div className="profile-section">
                    <div className="members-header">
                        <h3>Members</h3>
                        <button className="btn" onClick={handleAddMember}>
                            + Add Member
                        </button>
                    </div>
                    <div>
                        {members.map((member, index) => (
                            <div key={index} className="member-card">
                                <div className="member-card-header">
                                    <input
                                        type="text"
                                        value={member.name}
                                        onChange={(e) => handleMemberNameChange(index, e.target.value)}
                                        placeholder="Member name"
                                    />
                                    <button onClick={() => handleRemoveMember(index)}>✕</button>
                                </div>
                            </div>
                        ))}
                        {members.length === 0 && (
                            <p style={{ fontSize: '11px', color: '#777' }}>No members added yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
