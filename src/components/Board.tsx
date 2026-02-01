'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import Column from './Column';
import Header from './Header';
import CustomerModal from './modals/CustomerModal';
import ReminderModal from './modals/ReminderModal';
import CustomersListModal from './modals/CustomersListModal';
import type { Column as ColumnType, Lead, Customer, User } from '@/lib/types';
import * as db from '@/lib/database';

export default function Board() {
    // State
    const [columns, setColumns] = useState<ColumnType[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [remindersOpen, setRemindersOpen] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [customersListOpen, setCustomersListOpen] = useState(false);
    const [customerModalOpen, setCustomerModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    // New lead form state
    const [newLeadName, setNewLeadName] = useState('');
    const [newLeadInfo, setNewLeadInfo] = useState('');
    const [saveAsCustomer, setSaveAsCustomer] = useState(false);

    // Customer search state
    const [customerSearch, setCustomerSearch] = useState('');
    const [searchResults, setSearchResults] = useState<Customer[]>([]);
    const [selectedSearchCustomer, setSelectedSearchCustomer] = useState<Customer | null>(null);

    // DnD sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    // Active drag state
    const [activeLeadId, setActiveLeadId] = useState<string | null>(null);

    // Load data
    const loadData = useCallback(async () => {
        try {
            const [columnsData, leadsData, customersData] = await Promise.all([
                db.getColumns(),
                db.getLeads(),
                db.getCustomers(),
            ]);

            // If no columns exist, create default ones
            if (columnsData.length === 0) {
                const defaultColumns = [
                    { title: 'Lead', order: 0 },
                    { title: 'Follow Up', order: 1 },
                    { title: 'To Do', order: 2 },
                    { title: 'Payment Collection', order: 3 },
                ];

                const createdColumns = await Promise.all(
                    defaultColumns.map(col => db.createColumn(col))
                );
                setColumns(createdColumns);
            } else {
                setColumns(columnsData);
            }

            setLeads(leadsData);
            setCustomers(customersData);

            // Fetch users from API
            const usersResponse = await fetch('/api/users');
            const usersData = await usersResponse.json();
            setUsers(usersData.users || []);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Customer search effect
    useEffect(() => {
        if (customerSearch.trim()) {
            const filtered = customers.filter(c =>
                c.name.toLowerCase().includes(customerSearch.toLowerCase())
            );
            setSearchResults(filtered);
        } else {
            setSearchResults([]);
            setSelectedSearchCustomer(null);
        }
    }, [customerSearch, customers]);

    // Get leads for a specific column (exclude completed)
    function getColumnLeads(columnId: string): Lead[] {
        return leads
            .filter(lead => lead.status === columnId && !lead.is_completed)
            .sort((a, b) => a.order - b.order);
    }

    // Get completed leads for history
    function getCompletedLeads(): Lead[] {
        return leads.filter(lead => lead.is_completed);
    }

    // Drag handlers
    function handleDragStart(event: DragStartEvent) {
        setActiveLeadId(event.active.id as string);
    }

    async function handleDragOver(event: DragOverEvent) {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeLead = leads.find(l => l.$id === activeId);
        if (!activeLead) return;

        // Check if dropping over a column
        const overColumn = columns.find(c => c.$id === overId);
        if (overColumn && activeLead.status !== overId) {
            // Move to new column
            setLeads(prev =>
                prev.map(lead =>
                    lead.$id === activeId
                        ? { ...lead, status: overId }
                        : lead
                )
            );
        }
    }

    async function handleDragEnd(event: DragEndEvent) {
        setActiveLeadId(null);
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Get current lead state from the leads array (which may have been updated in handleDragOver)
        const activeLead = leads.find(l => l.$id === activeId);
        if (!activeLead) return;

        // Determine target column
        let targetColumnId: string;
        const overColumn = columns.find(c => c.$id === overId);
        if (overColumn) {
            targetColumnId = overId;
        } else {
            const overLead = leads.find(l => l.$id === overId);
            targetColumnId = overLead ? overLead.status : activeLead.status;
        }

        // Always persist the current status to database (handles column changes from handleDragOver)
        try {
            const newOrder = leads.filter(l => l.status === targetColumnId && l.$id !== activeId).length;
            await db.updateLead(activeId, {
                status: targetColumnId,
                order: newOrder
            });

            // Update local state to ensure consistency
            setLeads(prev =>
                prev.map(lead =>
                    lead.$id === activeId
                        ? { ...lead, status: targetColumnId, order: newOrder }
                        : lead
                )
            );
            console.log(`Lead ${activeId} moved to column ${targetColumnId}`);
        } catch (error) {
            console.error('Error persisting lead move:', error);
            // Reload data on error to get back to consistent state
            loadData();
        }
    }

    // Column operations
    async function handleUpdateColumnTitle(columnId: string, title: string) {
        try {
            await db.updateColumn(columnId, { title });
            setColumns(prev =>
                prev.map(col => (col.$id === columnId ? { ...col, title } : col))
            );
        } catch (error) {
            console.error('Error updating column:', error);
        }
    }

    async function handleDeleteColumn(columnId: string) {
        if (columns.length <= 1) {
            alert('At least one column is required.');
            return;
        }

        try {
            // Delete all leads in column first
            const columnLeads = leads.filter(l => l.status === columnId);
            await Promise.all(columnLeads.map(l => db.deleteLead(l.$id)));

            await db.deleteColumn(columnId);
            setColumns(prev => prev.filter(col => col.$id !== columnId));
            setLeads(prev => prev.filter(lead => lead.status !== columnId));
        } catch (error) {
            console.error('Error deleting column:', error);
        }
    }

    async function handleAddColumn() {
        const name = prompt('Column name:', 'New Stage');
        if (!name) return;

        try {
            const newColumn = await db.createColumn({
                title: name,
                order: columns.length,
            });
            setColumns(prev => [...prev, newColumn]);
        } catch (error) {
            console.error('Error creating column:', error);
        }
    }

    // Lead operations
    async function handleAddQuickLead(columnId: string) {
        try {
            const newLead = await db.createLead({
                title: 'QUICK LEAD',
                details: 'Click Edit to change details.',
                status: columnId,
                order: getColumnLeads(columnId).length,
            });
            setLeads(prev => [...prev, newLead]);
        } catch (error) {
            console.error('Error creating lead:', error);
        }
    }

    async function handleAddLeadFromTopBar() {
        const name = (newLeadName.trim() || 'NEW LEAD').toUpperCase();
        const details = newLeadInfo.trim() || 'Details...';
        const firstColumn = columns[0];
        if (!firstColumn) return;

        try {
            const newLead = await db.createLead({
                title: name,
                details,
                status: firstColumn.$id,
                order: getColumnLeads(firstColumn.$id).length,
            });
            setLeads(prev => [...prev, newLead]);

            // Save as customer if checked
            if (saveAsCustomer && name.trim()) {
                const existingCustomer = customers.find(c => c.name === name);
                if (!existingCustomer) {
                    const newCustomer = await db.createCustomer({
                        name,
                        details,
                    });
                    setCustomers(prev => [...prev, newCustomer]);
                }
            }

            // Reset form
            setNewLeadName('');
            setNewLeadInfo('');
            setSaveAsCustomer(false);
        } catch (error) {
            console.error('Error creating lead:', error);
        }
    }

    async function handleAddLeadFromCustomer() {
        if (!selectedSearchCustomer) {
            alert('Please select a customer from search results.');
            return;
        }

        const firstColumn = columns[0];
        if (!firstColumn) return;

        const c = selectedSearchCustomer;
        let details = c.details || '';
        if (!details) {
            const parts = [];
            if (c.phone) parts.push('Phone: ' + c.phone);
            if (c.email) parts.push('Email: ' + c.email);
            details = parts.join(' | ') || 'Details...';
        }

        try {
            const newLead = await db.createLead({
                title: c.name,
                details,
                status: firstColumn.$id,
                order: getColumnLeads(firstColumn.$id).length,
            });
            setLeads(prev => [...prev, newLead]);
            setCustomerSearch('');
            setSelectedSearchCustomer(null);
        } catch (error) {
            console.error('Error creating lead from customer:', error);
        }
    }

    async function handleEditLead(lead: Lead) {
        const newTitle = prompt('Edit lead name:', lead.title);
        if (newTitle === null) return;
        const newDetails = prompt('Edit details:', lead.details);
        if (newDetails === null) return;

        try {
            await db.updateLead(lead.$id, {
                title: newTitle || lead.title,
                details: newDetails || lead.details,
            });
            setLeads(prev =>
                prev.map(l =>
                    l.$id === lead.$id
                        ? { ...l, title: newTitle || l.title, details: newDetails || l.details }
                        : l
                )
            );
        } catch (error) {
            console.error('Error updating lead:', error);
        }
    }

    async function handleDeleteLead(leadId: string) {
        if (!confirm('Delete this lead?')) return;

        try {
            await db.deleteLead(leadId);
            setLeads(prev => prev.filter(l => l.$id !== leadId));
        } catch (error) {
            console.error('Error deleting lead:', error);
        }
    }

    async function handleAddNote(lead: Lead) {
        const currentNote = lead.note?.replace(/^Note:\s*/, '') || '';
        const note = prompt('Add / edit note:', currentNote);
        if (note === null) return;

        try {
            await db.updateLead(lead.$id, { note: note.trim() || null });
            setLeads(prev =>
                prev.map(l =>
                    l.$id === lead.$id ? { ...l, note: note.trim() || null } : l
                )
            );
        } catch (error) {
            console.error('Error updating note:', error);
        }
    }

    async function handleSetReminder(lead: Lead) {
        const text = prompt('Reminder text:', lead.reminder || 'Follow up');
        if (!text || !text.trim()) {
            // Clear reminder
            try {
                await db.updateLead(lead.$id, {
                    reminder: null,
                    reminder_time: null,
                });
                setLeads(prev =>
                    prev.map(l =>
                        l.$id === lead.$id
                            ? { ...l, reminder: null, reminder_time: null }
                            : l
                    )
                );
            } catch (error) {
                console.error('Error clearing reminder:', error);
            }
            return;
        }

        const timeInput = prompt(
            'Reminder time (YYYY-MM-DD HH:MM, 24hr) – blank for no popup:',
            lead.reminder_time
                ? new Date(lead.reminder_time).toISOString().slice(0, 16).replace('T', ' ')
                : ''
        );

        let reminderTime: number | null = null;
        if (timeInput && timeInput.trim()) {
            const parsed = new Date(timeInput.replace(' ', 'T'));
            if (!isNaN(parsed.getTime())) {
                reminderTime = parsed.getTime();
            }
        }

        try {
            await db.updateLead(lead.$id, {
                reminder: text.trim(),
                reminder_time: reminderTime,
            });
            setLeads(prev =>
                prev.map(l =>
                    l.$id === lead.$id
                        ? { ...l, reminder: text.trim(), reminder_time: reminderTime }
                        : l
                )
            );
        } catch (error) {
            console.error('Error setting reminder:', error);
        }
    }

    async function handleToggleEmergency(lead: Lead) {
        try {
            await db.updateLead(lead.$id, { is_emergency: !lead.is_emergency });
            setLeads(prev =>
                prev.map(l =>
                    l.$id === lead.$id ? { ...l, is_emergency: !l.is_emergency } : l
                )
            );
        } catch (error) {
            console.error('Error toggling emergency:', error);
        }
    }

    async function handleAssignLead(leadId: string, userId: string | null) {
        try {
            await db.updateLead(leadId, { assigned_to: userId });
            setLeads(prev =>
                prev.map(l => (l.$id === leadId ? { ...l, assigned_to: userId } : l))
            );
        } catch (error) {
            console.error('Error assigning lead:', error);
        }
    }

    // Customer operations
    async function handleSaveCustomer(data: Partial<Customer>) {
        if (selectedCustomer) {
            try {
                await db.updateCustomer(selectedCustomer.$id, data);
                setCustomers(prev =>
                    prev.map(c =>
                        c.$id === selectedCustomer.$id ? { ...c, ...data } as Customer : c
                    )
                );
            } catch (error) {
                console.error('Error updating customer:', error);
            }
        }
        setSelectedCustomer(null);
    }

    function handleOpenCustomerProfile(customer: Customer) {
        setSelectedCustomer(customer);
        setCustomerModalOpen(true);
    }

    function handleOpenProfileFromSearch() {
        if (!selectedSearchCustomer) {
            alert('Please select a customer from search results.');
            return;
        }
        handleOpenCustomerProfile(selectedSearchCustomer);
    }

    if (loading) {
        return (
            <div className="loading-container">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <>
            <Header
                onOpenReminders={() => setRemindersOpen(true)}
                onOpenCustomers={() => setCustomersListOpen(true)}
            />

            <main>
                <div className="shell">
                    {/* Top Row */}
                    <div className="top-row">
                        {/* New Lead Bar */}
                        <div className="top-bar">
                            <span className="top-bar-label">New</span>

                            <input
                                type="text"
                                placeholder="NAME / TASK TITLE"
                                value={newLeadName}
                                onChange={(e) => setNewLeadName(e.target.value.toUpperCase())}
                                style={{ minWidth: '190px' }}
                            />
                            <input
                                type="text"
                                placeholder="CONTACT / DETAILS"
                                value={newLeadInfo}
                                onChange={(e) => setNewLeadInfo(e.target.value)}
                                style={{ minWidth: '180px' }}
                            />

                            <label>
                                <input
                                    type="checkbox"
                                    checked={saveAsCustomer}
                                    onChange={(e) => setSaveAsCustomer(e.target.checked)}
                                />
                                Save as customer
                            </label>

                            <button className="btn btn-dark" onClick={handleAddLeadFromTopBar}>
                                + Add to Lead
                            </button>

                            <div className="spacer" />

                            {/* Customer search */}
                            <div className="customer-search-wrap">
                                <input
                                    type="text"
                                    placeholder="SEARCH CUSTOMER..."
                                    value={customerSearch}
                                    onChange={(e) => setCustomerSearch(e.target.value.toUpperCase())}
                                />
                                {searchResults.length > 0 && (
                                    <div className="customer-search-results">
                                        {searchResults.map(c => (
                                            <div
                                                key={c.$id}
                                                className={`search-result ${selectedSearchCustomer?.$id === c.$id ? 'selected' : ''}`}
                                                onClick={() => {
                                                    setSelectedSearchCustomer(c);
                                                    setCustomerSearch(c.name);
                                                }}
                                                style={{ fontSize: '12px', cursor: 'pointer' }}
                                            >
                                                {c.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button className="btn btn-dark" onClick={handleAddLeadFromCustomer}>
                                Add Lead
                            </button>
                            <button className="btn btn-dark" onClick={handleOpenProfileFromSearch}>
                                Profile
                            </button>
                        </div>

                        {/* Side Actions */}
                        <div className="top-actions">
                            <button
                                className="btn btn-primary"
                                onClick={handleAddColumn}
                                title="Add Column"
                            >
                                <span className="btn-icon">➕</span>
                            </button>
                        </div>
                    </div>

                    {/* Board */}
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="board-wrap">
                            {columns.map(column => (
                                <Column
                                    key={column.$id}
                                    column={column}
                                    leads={getColumnLeads(column.$id)}
                                    users={users}
                                    onUpdateTitle={handleUpdateColumnTitle}
                                    onDeleteColumn={handleDeleteColumn}
                                    onAddQuickLead={handleAddQuickLead}
                                    onEditLead={handleEditLead}
                                    onDeleteLead={handleDeleteLead}
                                    onAddNote={handleAddNote}
                                    onSetReminder={handleSetReminder}
                                    onToggleEmergency={handleToggleEmergency}
                                    onAssignLead={handleAssignLead}
                                />
                            ))}
                        </div>
                    </DndContext>
                </div>
            </main>

            {/* Modals */}
            <ReminderModal
                isOpen={remindersOpen}
                onClose={() => setRemindersOpen(false)}
                leads={leads}
                columns={columns}
            />

            <CustomersListModal
                isOpen={customersListOpen}
                onClose={() => setCustomersListOpen(false)}
                customers={customers}
                onOpenProfile={handleOpenCustomerProfile}
            />

            <CustomerModal
                isOpen={customerModalOpen}
                onClose={() => {
                    setCustomerModalOpen(false);
                    setSelectedCustomer(null);
                }}
                customer={selectedCustomer}
                onSave={handleSaveCustomer}
            />
        </>
    );
}
