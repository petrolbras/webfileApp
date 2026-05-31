import { json } from '@sveltejs/kit';
import path from 'path';
import fs from 'fs/promises';
import { SanitizeName } from '$lib/SanitizeName';
import { GetAvailableName } from '$lib/getAvailableName';

const STORAGE_DIR = path.resolve('storage');

export async function POST({request}) {
    try {
        const { newFileName, currentPath } = await request.json();

        const sanitizedFileName = SanitizeName(newFileName);

        if (!sanitizedFileName) {
            return json({ error: 'Invalid file name' }, { status: 400 });
        }
        
        const targetPath = path.resolve(STORAGE_DIR, currentPath, sanitizedFileName);

        if (!targetPath.startsWith(STORAGE_DIR)) {
            return json({ error: 'Invalid path' }, { status: 400 });
        }

        const availableFileName = await GetAvailableName(path.resolve(STORAGE_DIR, currentPath), sanitizedFileName);

        const finalFilePath = path.resolve(STORAGE_DIR, currentPath, availableFileName);

        await fs.mkdir(path.dirname(finalFilePath), {
            recursive: true
        });

        await fs.writeFile(path.resolve(finalFilePath), '');

        return json({ success: true, fileName: availableFileName });
    } catch (err) {
        console.error('Error creating file:', err);
        return json({ error: 'Failed to create file' }, { status: 500 });
    }
}