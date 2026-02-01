/**
 * Appwrite Database Setup Script
 * Run once to create database and collections
 * 
 * Usage: node scripts/setup-appwrite.mjs
 */

import { Client, Databases, ID } from 'node-appwrite';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_SECRET;
const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID || 'crm_db';

if (!PROJECT_ID || !API_KEY) {
    console.error('❌ Missing NEXT_PUBLIC_APPWRITE_PROJECT_ID or APPWRITE_API_SECRET in .env.local');
    process.exit(1);
}

// Initialize Appwrite
const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

async function setup() {
    console.log('🚀 Starting Appwrite setup...\n');

    try {
        // Create Database
        console.log('📦 Creating database...');
        try {
            await databases.create(DATABASE_ID, 'CRM Database');
            console.log(`   ✅ Database "${DATABASE_ID}" created`);
        } catch (e) {
            if (e.code === 409) {
                console.log(`   ⚠️  Database "${DATABASE_ID}" already exists`);
            } else throw e;
        }

        // Create Columns Collection
        console.log('\n📁 Creating "columns" collection...');
        const columnsId = process.env.NEXT_PUBLIC_COLUMNS_COLLECTION_ID || 'columns';
        try {
            await databases.createCollection(DATABASE_ID, columnsId, 'Columns', [
                // Permissions: any user can read/write
                'read("any")', 'create("any")', 'update("any")', 'delete("any")'
            ]);
            console.log('   ✅ Collection created');

            // Add attributes
            await databases.createStringAttribute(DATABASE_ID, columnsId, 'title', 255, true);
            await databases.createIntegerAttribute(DATABASE_ID, columnsId, 'order', true);
            console.log('   ✅ Attributes added');
        } catch (e) {
            if (e.code === 409) {
                console.log('   ⚠️  Collection already exists');
            } else throw e;
        }

        // Create Leads Collection
        console.log('\n📁 Creating "leads" collection...');
        const leadsId = process.env.NEXT_PUBLIC_LEADS_COLLECTION_ID || 'leads';
        try {
            await databases.createCollection(DATABASE_ID, leadsId, 'Leads', [
                'read("any")', 'create("any")', 'update("any")', 'delete("any")'
            ]);
            console.log('   ✅ Collection created');

            // Add attributes (with small delays to avoid rate limits)
            await databases.createStringAttribute(DATABASE_ID, leadsId, 'title', 255, true);
            await databases.createStringAttribute(DATABASE_ID, leadsId, 'details', 2000, false);
            await databases.createStringAttribute(DATABASE_ID, leadsId, 'status', 255, false);
            await databases.createStringAttribute(DATABASE_ID, leadsId, 'assigned_to', 255, false);
            await databases.createBooleanAttribute(DATABASE_ID, leadsId, 'is_emergency', false);
            await databases.createIntegerAttribute(DATABASE_ID, leadsId, 'order', false);
            await databases.createStringAttribute(DATABASE_ID, leadsId, 'note', 2000, false);
            await databases.createStringAttribute(DATABASE_ID, leadsId, 'reminder', 500, false);
            await databases.createIntegerAttribute(DATABASE_ID, leadsId, 'reminder_time', false);
            await databases.createBooleanAttribute(DATABASE_ID, leadsId, 'is_completed', false);
            console.log('   ✅ Attributes added');
        } catch (e) {
            if (e.code === 409) {
                console.log('   ⚠️  Collection already exists');
            } else throw e;
        }

        // Create Customers Collection
        console.log('\n📁 Creating "customers" collection...');
        const customersId = process.env.NEXT_PUBLIC_CUSTOMERS_COLLECTION_ID || 'customers';
        try {
            await databases.createCollection(DATABASE_ID, customersId, 'Customers', [
                'read("any")', 'create("any")', 'update("any")', 'delete("any")'
            ]);
            console.log('   ✅ Collection created');

            // Add attributes
            await databases.createStringAttribute(DATABASE_ID, customersId, 'name', 255, true);
            await databases.createStringAttribute(DATABASE_ID, customersId, 'phone', 50, false);
            await databases.createStringAttribute(DATABASE_ID, customersId, 'email', 255, false);
            await databases.createStringAttribute(DATABASE_ID, customersId, 'details', 5000, false);
            console.log('   ✅ Attributes added');
        } catch (e) {
            if (e.code === 409) {
                console.log('   ⚠️  Collection already exists');
            } else throw e;
        }

        console.log('\n✅ Setup complete!');
        console.log('\n📝 Note: Attributes may take a few seconds to become "available".');
        console.log('   You can check the status in Appwrite Console.\n');

    } catch (error) {
        console.error('\n❌ Setup failed:', error.message);
        process.exit(1);
    }
}

setup();
