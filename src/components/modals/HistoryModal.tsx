'use client';

import Modal from './Modal';
import type { Lead, Column } from '@/lib/types';

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    completedLeads: Lead[];
    columns: Column[];
    onRestore: (lead: Lead) => void;
    onPermanentDelete: (leadId: string) => void;
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function HistoryModal({
    isOpen,
    onClose,
    completedLeads,
    columns,
    onRestore,
    onPermanentDelete,
}: HistoryModalProps) {
    function getColumnTitle(columnId: string): string {
        const column = columns.find(c => c.$id === columnId);
        return column?.title || 'Unknown';
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Completed Tasks (History)"
            footer={
                <button className="btn btn-primary" onClick={onClose}>
                    Close
                </button>
            }
        >
            {completedLeads.length === 0 ? (
                <div className="no-reminders">No completed tasks yet.</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {completedLeads.map(lead => (
                        <div
                            key={lead.$id}
                            style={{
                                background: '#f0fdf4',
                                border: '1px solid #86efac',
                                borderRadius: '8px',
                                padding: '10px 12px',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '13px', textDecoration: 'line-through', color: '#6b7280' }}>
                                        {lead.title}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                                        {lead.details}
                                    </div>
                                    <div style={{ fontSize: '10px', color: '#22c55e', marginTop: '4px' }}>
                                        ✓ Completed • Was in: {getColumnTitle(lead.status)}
                                    </div>
                                    {lead.$updatedAt && (
                                        <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>
                                            Completed: {formatDate(lead.$updatedAt)}
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button
                                        className="btn"
                                        onClick={() => onRestore(lead)}
                                        style={{ fontSize: '10px', padding: '4px 8px' }}
                                    >
                                        Restore
                                    </button>
                                    <button
                                        className="btn"
                                        onClick={() => {
                                            if (confirm('Permanently delete this task?')) {
                                                onPermanentDelete(lead.$id);
                                            }
                                        }}
                                        style={{ fontSize: '10px', padding: '4px 8px', color: '#dc2626' }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Modal>
    );
}
