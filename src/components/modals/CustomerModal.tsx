'use client';

import { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import type { Customer, User, AssignedUser } from '@/lib/types';
import * as storageService from '@/lib/storage';

interface CustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: Customer | null;
    users: User[];
    onSave: (data: Partial<Customer>) => void;
}

type DocumentType = 'passport' | 'aadhaar' | 'pan';

export default function CustomerModal({
    isOpen,
    onClose,
    customer,
    users,
    onSave,
}: CustomerModalProps) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');

    // Document file IDs
    const [passportFileId, setPassportFileId] = useState<string | null>(null);
    const [aadhaarFileId, setAadhaarFileId] = useState<string | null>(null);
    const [panFileId, setPanFileId] = useState<string | null>(null);

    // Assigned users
    const [assignedUsers, setAssignedUsers] = useState<AssignedUser[]>([]);

    // Upload states
    const [uploading, setUploading] = useState<DocumentType | null>(null);

    // File input refs
    const passportInputRef = useRef<HTMLInputElement>(null);
    const aadhaarInputRef = useRef<HTMLInputElement>(null);
    const panInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (customer) {
            setName(customer.name);
            setPhone(customer.phone || '');
            setEmail(customer.email || '');
            setPassportFileId(customer.passport_file_id || null);
            setAadhaarFileId(customer.aadhaar_file_id || null);
            setPanFileId(customer.pan_file_id || null);
            // Parse assigned users from JSON
            try {
                const parsed = customer.assigned_users ? JSON.parse(customer.assigned_users) : [];
                setAssignedUsers(parsed);
            } catch {
                setAssignedUsers([]);
            }
        } else {
            setName('');
            setPhone('');
            setEmail('');
            setPassportFileId(null);
            setAadhaarFileId(null);
            setPanFileId(null);
            setAssignedUsers([]);
        }
    }, [customer, isOpen]);

    async function handleFileUpload(type: DocumentType, file: File) {
        setUploading(type);
        try {
            const fileId = await storageService.uploadFile(file);
            switch (type) {
                case 'passport':
                    setPassportFileId(fileId);
                    break;
                case 'aadhaar':
                    setAadhaarFileId(fileId);
                    break;
                case 'pan':
                    setPanFileId(fileId);
                    break;
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Failed to upload file. Please try again.');
        } finally {
            setUploading(null);
        }
    }

    async function handleRemoveFile(type: DocumentType) {
        const fileId = type === 'passport' ? passportFileId : type === 'aadhaar' ? aadhaarFileId : panFileId;
        if (!fileId) return;

        try {
            await storageService.deleteFile(fileId);
            switch (type) {
                case 'passport':
                    setPassportFileId(null);
                    break;
                case 'aadhaar':
                    setAadhaarFileId(null);
                    break;
                case 'pan':
                    setPanFileId(null);
                    break;
            }
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    }

    function handleAddUser(userId: string) {
        const user = users.find(u => u.$id === userId);
        if (!user) return;
        if (assignedUsers.some(u => u.id === userId)) return;

        setAssignedUsers([...assignedUsers, { id: userId, name: user.name || user.email }]);
    }

    function handleRemoveUser(userId: string) {
        setAssignedUsers(assignedUsers.filter(u => u.id !== userId));
    }

    function handleSave() {
        onSave({
            name: name.toUpperCase(),
            phone,
            email,
            passport_file_id: passportFileId,
            aadhaar_file_id: aadhaarFileId,
            pan_file_id: panFileId,
            assigned_users: assignedUsers.length > 0 ? JSON.stringify(assignedUsers) : null,
        });
        onClose();
    }

    function renderFileInput(type: DocumentType, label: string, fileId: string | null, inputRef: React.RefObject<HTMLInputElement | null>) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ minWidth: '70px', fontSize: '12px' }}>{label}:</span>
                {fileId ? (
                    <>
                        <a
                            href={storageService.getFileDownloadUrl(fileId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: '11px', color: '#2563eb' }}
                        >
                            View Document
                        </a>
                        <button
                            className="btn"
                            onClick={() => handleRemoveFile(type)}
                            style={{ fontSize: '10px', padding: '2px 6px', color: '#dc2626' }}
                        >
                            Remove
                        </button>
                    </>
                ) : (
                    <>
                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/*,.pdf"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(type, file);
                            }}
                        />
                        <button
                            className="btn"
                            onClick={() => inputRef.current?.click()}
                            disabled={uploading !== null}
                            style={{ fontSize: '11px', padding: '4px 8px' }}
                        >
                            {uploading === type ? 'Uploading...' : 'Upload'}
                        </button>
                    </>
                )}
            </div>
        );
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
                    <h3>Customer Details</h3>
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
                </div>

                <div className="profile-section">
                    <h3>Documents</h3>
                    {renderFileInput('passport', 'Passport', passportFileId, passportInputRef)}
                    {renderFileInput('aadhaar', 'Aadhaar', aadhaarFileId, aadhaarInputRef)}
                    {renderFileInput('pan', 'PAN', panFileId, panInputRef)}
                </div>

                <div className="profile-section">
                    <h3>Assigned Team Members</h3>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <select
                            onChange={(e) => {
                                if (e.target.value) {
                                    handleAddUser(e.target.value);
                                    e.target.value = '';
                                }
                            }}
                            style={{ flex: 1, fontSize: '12px' }}
                        >
                            <option value="">Add team member...</option>
                            {users
                                .filter(u => !assignedUsers.some(au => au.id === u.$id))
                                .map(user => (
                                    <option key={user.$id} value={user.$id}>
                                        {user.name || user.email}
                                    </option>
                                ))}
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {assignedUsers.map(user => (
                            <span
                                key={user.id}
                                style={{
                                    background: '#e5e7eb',
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    fontSize: '11px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                }}
                            >
                                {user.name}
                                <button
                                    onClick={() => handleRemoveUser(user.id)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        padding: 0,
                                        color: '#6b7280',
                                    }}
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                        {assignedUsers.length === 0 && (
                            <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                                No team members assigned
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
