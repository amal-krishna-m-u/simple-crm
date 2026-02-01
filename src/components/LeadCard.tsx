'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Lead, User } from '@/lib/types';

interface LeadCardProps {
    lead: Lead;
    users: User[];
    onEdit: (lead: Lead) => void;
    onDelete: (leadId: string) => void;
    onAddNote: (lead: Lead) => void;
    onSetReminder: (lead: Lead) => void;
    onToggleEmergency: (lead: Lead) => void;
    onAssign: (leadId: string, userId: string | null) => void;
}

export default function LeadCard({
    lead,
    users,
    onEdit,
    onDelete,
    onAddNote,
    onSetReminder,
    onToggleEmergency,
    onAssign,
}: LeadCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: lead.$id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const assignedUser = users.find(u => u.$id === lead.assigned_to);

    function formatReminderTime(timestamp: number): string {
        const date = new Date(timestamp);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}-${month}-${year} ${hours}:${minutes}`;
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`lead-card ${lead.is_emergency ? 'emergency-on' : ''}`}
            {...attributes}
            {...listeners}
        >
            {/* Emergency toggle dot */}
            <div
                className="emergency-dot"
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleEmergency(lead);
                }}
            />

            <div className="lead-title">{lead.title}</div>
            <div className="lead-meta">{lead.details}</div>

            {lead.note && (
                <div className="lead-note">Note: {lead.note}</div>
            )}

            {lead.reminder && (
                <div className="lead-reminder">
                    Reminder: {lead.reminder}
                    {lead.reminder_time && ` (${formatReminderTime(lead.reminder_time)})`}
                </div>
            )}

            {assignedUser && (
                <div className="lead-assigned">
                    Assigned to: {assignedUser.name || assignedUser.email}
                </div>
            )}

            <div className="lead-actions">
                <button
                    className="btn"
                    onClick={(e) => { e.stopPropagation(); onEdit(lead); }}
                >
                    Edit
                </button>
                <button
                    className="btn"
                    onClick={(e) => { e.stopPropagation(); onAddNote(lead); }}
                >
                    Note
                </button>
                <button
                    className="btn"
                    onClick={(e) => { e.stopPropagation(); onSetReminder(lead); }}
                >
                    Reminder
                </button>
                <button
                    className="btn"
                    onClick={(e) => { e.stopPropagation(); onDelete(lead.$id); }}
                >
                    Delete
                </button>
                <select
                    className="assign-select"
                    value={lead.assigned_to || ''}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onAssign(lead.$id, e.target.value || null)}
                >
                    <option value="">Assign to...</option>
                    {users.map(user => (
                        <option key={user.$id} value={user.$id}>
                            {user.name || user.email}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
