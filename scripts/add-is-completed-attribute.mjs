/**
 * Add is_completed attribute to leads collection
 * Run this if you already have the leads collection but need to add the is_completed field
 * 
 * Usage: node scripts/add-is-completed-attribute.mjs
 */

import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_SECRET;
const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID || 'crm_db';
const LEADS_COLLECTION_ID = process.env.NEXT_PUBLIC_LEADS_COLLECTION_ID || 'leads';

if (!PROJECT_ID || !API_KEY) {
    console.error('❌ Missing NEXT_PUBLIC_APPWRITE_PROJECT_ID or APPWRITE_API_SECRET in .env.local');
    process.exit(1);
}

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

async function addAttribute() {
    console.log('🔧 Adding is_completed attribute to leads collection...');

    try {
        await databases.createBooleanAttribute(
            DATABASE_ID,
            LEADS_COLLECTION_ID,
            'is_completed',
            false, // not required
            false  // default value
        );
        console.log('✅ is_completed attribute added successfully!');
        console.log('⏳ Note: It may take a few seconds for the attribute to become "available".');
    } catch (e) {
        if (e.code === 409) {
            console.log('⚠️  Attribute is_completed already exists');
        } else {
            console.error('❌ Failed to add attribute:', e.message);
            process.exit(1);
        }
    }
}

addAttribute();
