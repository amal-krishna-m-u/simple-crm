'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import LeadCard from './LeadCard';
import type { Column as ColumnType, Lead, User } from '@/lib/types';

interface ColumnProps {
    column: ColumnType;
    leads: Lead[];
    users: User[];
    onUpdateTitle: (columnId: string, title: string) => void;
    onDeleteColumn: (columnId: string) => void;
    onAddQuickLead: (columnId: string) => void;
    onEditLead: (lead: Lead) => void;
    onDeleteLead: (leadId: string) => void;
    onAddNote: (lead: Lead) => void;
    onSetReminder: (lead: Lead) => void;
    onToggleEmergency: (lead: Lead) => void;
    onAssignLead: (leadId: string, userId: string | null) => void;
    onMarkComplete: (lead: Lead) => void;
}

function getColumnClass(columnId: string): string {
    const lowerTitle = columnId.toLowerCase();
    if (lowerTitle.includes('lead')) return 'column-lead';
    if (lowerTitle.includes('follow')) return 'column-followup';
    if (lowerTitle.includes('todo') || lowerTitle.includes('to do')) return 'column-todo';
    if (lowerTitle.includes('payment')) return 'column-payment';
    return 'column-custom';
}

export default function Column({
    column,
    leads,
    users,
    onUpdateTitle,
    onDeleteColumn,
    onAddQuickLead,
    onEditLead,
    onDeleteLead,
    onAddNote,
    onSetReminder,
    onToggleEmergency,
    onAssignLead,
    onMarkComplete,
}: ColumnProps) {
    const [editingTitle, setEditingTitle] = useState(false);
    const [title, setTitle] = useState(column.title);

    const { setNodeRef, isOver } = useDroppable({
        id: column.$id,
    });

    function handleTitleBlur() {
        setEditingTitle(false);
        if (title.trim() !== column.title) {
            onUpdateTitle(column.$id, title.trim());
        }
    }

    function handleDeleteColumn() {
        if (confirm(`Delete column "${column.title}" and its leads?`)) {
            onDeleteColumn(column.$id);
        }
    }

    const leadIds = leads.map(l => l.$id);

    return (
        <div className={`column ${getColumnClass(column.title)}`}>
            <div className="column-header">
                <input
                    type="text"
                    className="column-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onFocus={() => setEditingTitle(true)}
                    onBlur={handleTitleBlur}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.currentTarget.blur();
                        }
                    }}
                />
                <span className="count">
                    {leads.length > 0 ? `(${leads.length})` : ''}
                </span>
                <button
                    className="delete-column-btn"
                    onClick={handleDeleteColumn}
                    title="Delete column"
                >
                    ✕
                </button>
            </div>

            <div
                ref={setNodeRef}
                className={`column-body ${isOver ? 'drag-over' : ''}`}
            >
                <SortableContext items={leadIds} strategy={verticalListSortingStrategy}>
                    {leads.map(lead => (
                        <LeadCard
                            key={lead.$id}
                            lead={lead}
                            users={users}
                            onEdit={onEditLead}
                            onDelete={onDeleteLead}
                            onAddNote={onAddNote}
                            onSetReminder={onSetReminder}
                            onToggleEmergency={onToggleEmergency}
                            onAssign={onAssignLead}
                            onMarkComplete={onMarkComplete}
                        />
                    ))}
                </SortableContext>
            </div>

            <div className="column-footer">
                <button
                    className="btn btn-primary"
                    onClick={() => onAddQuickLead(column.$id)}
                >
                    + Quick Lead
                </button>
            </div>
        </div>
    );
}
