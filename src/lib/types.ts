import { Models } from 'appwrite';

// Column type
export interface Column extends Models.Document {
    title: string;
    order: number;
}

// Lead type
export interface Lead extends Models.Document {
    title: string;
    details: string;
    status: string; // Column ID
    assigned_to: string | null; // User ID
    is_emergency: boolean;
    is_completed: boolean; // Soft delete - hidden from board but kept in history
    order: number;
    note: string | null;
    reminder: string | null;
    reminder_time: number | null; // Timestamp in ms
}

// Customer type
export interface Customer extends Models.Document {
    name: string;
    phone: string;
    email: string;
    details: string;
    attachments: string[];
    members: CustomerMember[];
}

export interface CustomerMember {
    name: string;
}

// User type (from Appwrite Auth)
export interface User {
    $id: string;
    name: string;
    email: string;
}

// Form data types
export interface CreateLeadData {
    title: string;
    details: string;
    status: string;
    assigned_to?: string | null;
    is_emergency?: boolean;
    is_completed?: boolean;
    order?: number;
    note?: string | null;
    reminder?: string | null;
    reminder_time?: number | null;
}

export interface CreateColumnData {
    title: string;
    order: number;
}

export interface CreateCustomerData {
    name: string;
    phone?: string;
    email?: string;
    details?: string;
    attachments?: string[];
    members?: CustomerMember[];
}

export interface UpdateLeadData extends Partial<CreateLeadData> { }
export interface UpdateColumnData extends Partial<CreateColumnData> { }
export interface UpdateCustomerData extends Partial<CreateCustomerData> { }
