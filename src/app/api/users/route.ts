import { Client, Users } from 'node-appwrite';
import { NextResponse } from 'next/server';

// Server-side Appwrite client with API key
function createServerClient() {
    const client = new Client();

    client
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

    if (process.env.APPWRITE_API_SECRET) {
        client.setKey(process.env.APPWRITE_API_SECRET);
    }

    return client;
}

export async function GET() {
    try {
        const users = new Users(createServerClient());
        const response = await users.list();

        // Return simplified user data for assignment dropdown
        const simplifiedUsers = response.users.map(user => ({
            $id: user.$id,
            name: user.name,
            email: user.email,
        }));

        return NextResponse.json({ users: simplifiedUsers });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users', users: [] },
            { status: 500 }
        );
    }
}
