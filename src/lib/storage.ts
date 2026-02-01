import { storage, ID } from './appwrite';

const BUCKET_ID = process.env.NEXT_PUBLIC_DOCUMENTS_BUCKET_ID || 'customer-documents';

export async function uploadFile(file: File): Promise<string> {
    const response = await storage.createFile(BUCKET_ID, ID.unique(), file);
    return response.$id;
}

export async function deleteFile(fileId: string): Promise<void> {
    await storage.deleteFile(BUCKET_ID, fileId);
}

export function getFilePreviewUrl(fileId: string): string {
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    return `${endpoint}/storage/buckets/${BUCKET_ID}/files/${fileId}/preview?project=${projectId}`;
}

export function getFileDownloadUrl(fileId: string): string {
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    return `${endpoint}/storage/buckets/${BUCKET_ID}/files/${fileId}/download?project=${projectId}`;
}
