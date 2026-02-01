'use client';

import Modal from './Modal';
import type { Lead, Column } from '@/lib/types';

interface Reminder {
    lead: Lead;
    columnTitle: string;
}

interface ReminderModalProps {
    isOpen: boolean;
    onClose: () => void;
    leads: Lead[];
    columns: Column[];
}

function formatDateTime(timestamp: number): string {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}`;
}

export default function ReminderModal({
    isOpen,
    onClose,
    leads,
    columns,
}: ReminderModalProps) {
    // Get leads with reminders
    const reminders: Reminder[] = leads
        .filter(lead => lead.reminder)
        .map(lead => {
            const column = columns.find(c => c.$id === lead.status);
            return {
                lead,
                columnTitle: column?.title || 'Unknown',
            };
        })
        .sort((a, b) => {
            if (!a.lead.reminder_time && !b.lead.reminder_time) return 0;
            if (!a.lead.reminder_time) return 1;
            if (!b.lead.reminder_time) return -1;
            return a.lead.reminder_time - b.lead.reminder_time;
        });

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="All Reminders"
            footer={
                <button className="btn btn-primary" onClick={onClose}>
                    Close
                </button>
            }
        >
            {reminders.length === 0 ? (
                <div className="no-reminders">No reminders set.</div>
            ) : (
                <>
                    <div className="section-title-small">Lead Reminders</div>
                    {reminders.map(({ lead, columnTitle }) => (
                        <div key={lead.$id} className="reminder-item">
                            <div className="reminder-title">{lead.title}</div>
                            <div className="reminder-text">{lead.reminder}</div>
                            <div className="reminder-time">
                                {lead.reminder_time
                                    ? formatDateTime(lead.reminder_time)
                                    : 'No time (no popup)'}
                            </div>
                            <div className="reminder-column-name">Column: {columnTitle}</div>
                        </div>
                    ))}
                </>
            )}
        </Modal>
    );
}
