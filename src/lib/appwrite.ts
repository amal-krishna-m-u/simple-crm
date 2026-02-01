import { Client, Account, Databases, Teams, Storage, ID } from 'appwrite';

// ============ CLIENT-SIDE APPWRITE (Browser) ============
export const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

// Client-side services
export const account = new Account(client);
export const databases = new Databases(client);
export const teams = new Teams(client);
export const storage = new Storage(client);

// Re-export ID for convenience
export { ID };

// Database and collection IDs
export const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID || 'crm_db';
export const COLUMNS_COLLECTION_ID = process.env.NEXT_PUBLIC_COLUMNS_COLLECTION_ID || 'columns';
export const LEADS_COLLECTION_ID = process.env.NEXT_PUBLIC_LEADS_COLLECTION_ID || 'leads';
export const CUSTOMERS_COLLECTION_ID = process.env.NEXT_PUBLIC_CUSTOMERS_COLLECTION_ID || 'customers';
