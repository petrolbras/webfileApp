import path from 'path';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import { Readable } from 'stream';
import { SanitizeName } from '$lib/SanitizeName';
import { json } from '@sveltejs/kit';
import { GetAvailableName } from '$lib/getAvailableName';

const STORAGE_DIR = path.resolve('storage');
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

export async function POST({request}) {
    try {

        const formData = await request.formData();
        const file = formData.get('file');

        const relativepath = (formData.get('path') as string) || '';
        const resolvedRoot = path.resolve(STORAGE_DIR);
        const destinationDir = path.resolve(path.join(STORAGE_DIR, relativepath));
        const resolvedDestination = path.resolve(destinationDir);
    
        if (!resolvedDestination.startsWith(resolvedRoot)) {
            return json({ error: 'Access denied' }, { status: 400 });
        }

        if (!(file instanceof File)) {
            return json({ error: 'No file uploaded' }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return json({ error: 'File exceeds 100MB limit' }, { status: 400 });
        }

        const SanitizedName = SanitizeName(file.name);
        const AvailableName = await GetAvailableName(destinationDir, SanitizedName);
        const finalFilePath = path.join(destinationDir, AvailableName);

        if (!finalFilePath.startsWith(resolvedDestination)) {
            return json({ error: 'Invalid file name' }, { status: 400 });
        }

        await fs.mkdir(destinationDir, { recursive: true });

        const nodeReadableStream = Readable.fromWeb(file.stream() as any);
        const writeStream = createWriteStream(finalFilePath);

        await new Promise((resolve, reject) => {
            nodeReadableStream.pipe(writeStream);
            nodeReadableStream.on('error', reject);
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });

        console.log("Saving to:", finalFilePath);

        return json({
            message: 'File uploaded successfully',
            file: {
                name: AvailableName,
                size: file.size,
                mime: file.type,
                createdAt: new Date().toISOString()
            }
        });

    } catch (err) {
        console.error("Upload error:", err);

        return json({ error: 'Internal server error' }, { status: 500 });
    }
}