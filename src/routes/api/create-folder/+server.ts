import { json } from '@sveltejs/kit';
import path from 'path';
import fs from 'fs/promises';
import { SanitizeName } from '$lib/SanitizeName';
import { GetAvailableName } from '$lib/getAvailableName';

const STORAGE_DIR = path.resolve('storage');

export async function POST({request}) {
    try {
        const { newFolderName, currentPath } = await request.json();

        const sanitizedFolderName = SanitizeName(newFolderName);

        if (!sanitizedFolderName) {
            return json({ error: 'Invalid folder name' }, { status: 400 });
        }
        
        const targetPath = path.resolve(STORAGE_DIR, currentPath, sanitizedFolderName);

        if (!targetPath.startsWith(STORAGE_DIR)) {
            return json({ error: 'Invalid path' }, { status: 400 });
        }

        const availableFolderName = await GetAvailableName(targetPath, sanitizedFolderName);

        const finalFolderPath = path.resolve(STORAGE_DIR, currentPath, availableFolderName);

        await fs.mkdir(path.resolve(finalFolderPath));

        return json({ success: true, folderName: availableFolderName });
    } catch (err) {
        console.error('Error creating folder:', err);
        return json({ error: 'Failed to create folder' }, { status: 500 });
    }
}