/**
 * Add customer document fields and storage bucket
 * Run this to add passport/aadhaar/pan fields and members field
 * 
 * Usage: node scripts/add-customer-document-fields.mjs
 */

import { Client, Databases, Storage } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_SECRET;
const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID || 'crm_db';
const CUSTOMERS_COLLECTION_ID = process.env.NEXT_PUBLIC_CUSTOMERS_COLLECTION_ID || 'customers';
const BUCKET_ID = 'customer-documents';

if (!PROJECT_ID || !API_KEY) {
    console.error('❌ Missing NEXT_PUBLIC_APPWRITE_PROJECT_ID or APPWRITE_API_SECRET in .env.local');
    process.exit(1);
}

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);
const storage = new Storage(client);

async function setup() {
    console.log('🚀 Adding customer document fields...\n');

    // Create Storage Bucket
    console.log('📦 Creating storage bucket for documents...');
    try {
        await storage.createBucket(
            BUCKET_ID,
            'Customer Documents',
            [
                'read("any")',
                'create("any")',
                'update("any")',
                'delete("any")'
            ],
            false, // fileSecurity
            true,  // enabled
            10000000, // 10MB max file size
            ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'] // allowed types
        );
        console.log('   ✅ Storage bucket created');
    } catch (e) {
        if (e.code === 409) {
            console.log('   ⚠️  Bucket already exists');
        } else {
            console.error('   ❌ Error:', e.message);
        }
    }

    // Add document file ID fields
    console.log('\n📁 Adding document fields to customers collection...');

    const fields = [
        { key: 'passport_file_id', size: 255 },
        { key: 'aadhaar_file_id', size: 255 },
        { key: 'pan_file_id', size: 255 },
        { key: 'assigned_users', size: 5000 }, // JSON array of user IDs
    ];

    for (const field of fields) {
        try {
            await databases.createStringAttribute(
                DATABASE_ID,
                CUSTOMERS_COLLECTION_ID,
                field.key,
                field.size,
                false // not required
            );
            console.log(`   ✅ Added ${field.key}`);
        } catch (e) {
            if (e.code === 409) {
                console.log(`   ⚠️  ${field.key} already exists`);
            } else {
                console.error(`   ❌ Error adding ${field.key}:`, e.message);
            }
        }
    }

    console.log('\n✅ Setup complete!');
    console.log('\n📝 Add this to your .env.local:');
    console.log(`NEXT_PUBLIC_DOCUMENTS_BUCKET_ID=${BUCKET_ID}`);
}

setup();
