import { ID, Query } from 'appwrite';
import {
    databases,
    DATABASE_ID,
    COLUMNS_COLLECTION_ID,
    LEADS_COLLECTION_ID,
    CUSTOMERS_COLLECTION_ID,
} from './appwrite';
import type {
    Column,
    Lead,
    Customer,
    CreateColumnData,
    CreateLeadData,
    CreateCustomerData,
    UpdateColumnData,
    UpdateLeadData,
    UpdateCustomerData,
} from './types';

// ============ COLUMNS ============

export async function getColumns(): Promise<Column[]> {
    const response = await databases.listDocuments(
        DATABASE_ID,
        COLUMNS_COLLECTION_ID,
        [Query.orderAsc('order')]
    );
    return response.documents as unknown as Column[];
}

export async function createColumn(data: CreateColumnData): Promise<Column> {
    const response = await databases.createDocument(
        DATABASE_ID,
        COLUMNS_COLLECTION_ID,
        ID.unique(),
        data
    );
    return response as unknown as Column;
}

export async function updateColumn(id: string, data: UpdateColumnData): Promise<Column> {
    const response = await databases.updateDocument(
        DATABASE_ID,
        COLUMNS_COLLECTION_ID,
        id,
        data
    );
    return response as unknown as Column;
}

export async function deleteColumn(id: string): Promise<void> {
    await databases.deleteDocument(DATABASE_ID, COLUMNS_COLLECTION_ID, id);
}

// ============ LEADS ============

export async function getLeads(): Promise<Lead[]> {
    const response = await databases.listDocuments(
        DATABASE_ID,
        LEADS_COLLECTION_ID,
        [Query.orderAsc('order'), Query.limit(1000)]
    );
    return response.documents as unknown as Lead[];
}

export async function getLeadsByColumn(columnId: string): Promise<Lead[]> {
    const response = await databases.listDocuments(
        DATABASE_ID,
        LEADS_COLLECTION_ID,
        [Query.equal('status', columnId), Query.orderAsc('order')]
    );
    return response.documents as unknown as Lead[];
}

export async function createLead(data: CreateLeadData): Promise<Lead> {
    const response = await databases.createDocument(
        DATABASE_ID,
        LEADS_COLLECTION_ID,
        ID.unique(),
        {
            ...data,
            is_emergency: data.is_emergency ?? false,
            is_completed: data.is_completed ?? false,
            order: data.order ?? 0,
            note: data.note ?? null,
            reminder: data.reminder ?? null,
            reminder_time: data.reminder_time ?? null,
            assigned_to: data.assigned_to ?? null,
        }
    );
    return response as unknown as Lead;
}

export async function updateLead(id: string, data: UpdateLeadData): Promise<Lead> {
    const response = await databases.updateDocument(
        DATABASE_ID,
        LEADS_COLLECTION_ID,
        id,
        data
    );
    return response as unknown as Lead;
}

export async function deleteLead(id: string): Promise<void> {
    await databases.deleteDocument(DATABASE_ID, LEADS_COLLECTION_ID, id);
}

export async function moveLead(
    leadId: string,
    newColumnId: string,
    newOrder: number
): Promise<Lead> {
    return updateLead(leadId, { status: newColumnId, order: newOrder });
}

// ============ CUSTOMERS ============

export async function getCustomers(): Promise<Customer[]> {
    const response = await databases.listDocuments(
        DATABASE_ID,
        CUSTOMERS_COLLECTION_ID,
        [Query.orderAsc('name'), Query.limit(1000)]
    );
    return response.documents as unknown as Customer[];
}

export async function searchCustomers(query: string): Promise<Customer[]> {
    if (!query.trim()) return [];
    const response = await databases.listDocuments(
        DATABASE_ID,
        CUSTOMERS_COLLECTION_ID,
        [Query.search('name', query), Query.limit(20)]
    );
    return response.documents as unknown as Customer[];
}

export async function createCustomer(data: CreateCustomerData): Promise<Customer> {
    const response = await databases.createDocument(
        DATABASE_ID,
        CUSTOMERS_COLLECTION_ID,
        ID.unique(),
        {
            name: data.name.toUpperCase(),
            phone: data.phone ?? '',
            email: data.email ?? '',
            details: data.details ?? '',
        }
    );
    return response as unknown as Customer;
}

export async function updateCustomer(id: string, data: UpdateCustomerData): Promise<Customer> {
    const response = await databases.updateDocument(
        DATABASE_ID,
        CUSTOMERS_COLLECTION_ID,
        id,
        data
    );
    return response as unknown as Customer;
}

export async function deleteCustomer(id: string): Promise<void> {
    await databases.deleteDocument(DATABASE_ID, CUSTOMERS_COLLECTION_ID, id);
}

export async function getCustomerById(id: string): Promise<Customer> {
    const response = await databases.getDocument(
        DATABASE_ID,
        CUSTOMERS_COLLECTION_ID,
        id
    );
    return response as unknown as Customer;
}
