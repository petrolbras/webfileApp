import path from 'path';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { SanitizeName } from '$lib/SanitizeName';
import { json } from '@sveltejs/kit';
import { GetAvailableName } from '$lib/getAvailableName';

const STORAGE_DIR = path.resolve('storage');
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const MAX_UPLOAD_SIZE = 100 * 1024 * 1024; // 100 MB

export async function POST({request}) {
    try {

        const formData = await request.formData();

        const files = formData.getAll('files') as File[] | null;
        const paths = formData.getAll('paths') as string[];
        const currentPath = String(formData.get('currentPath') || '');

        const resolvedRoot = path.resolve(STORAGE_DIR);
        const resolvedCurrentDir = path.resolve(STORAGE_DIR, currentPath);

        const uploadedFiles = [];

        let totalUploadSize = 0;

        for (const file of files ?? []) {

            if (!(file instanceof File)) {
                continue;
            }

            totalUploadSize += file.size;
        }

        if (totalUploadSize > MAX_UPLOAD_SIZE) {
            return json({ error: 'Upload size exceeds limit' }, { status: 400 });
        }

        if (!files || files.length === 0) {
            return json({ error: 'No files uploaded' }, { status: 400 });
        }

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const relativePath = paths[i] || file.name;

            if (!(file instanceof File)) {
                continue;
            }

            if (file.size > MAX_FILE_SIZE) {
                continue;
            }

            const normalizedRelativePath = path.normalize(relativePath);

            const resolvedFilePath = path.resolve(resolvedCurrentDir, normalizedRelativePath);

            if (!resolvedFilePath.startsWith(resolvedRoot)) {
                continue;
            }

            const originalName = path.basename(normalizedRelativePath);
            const SanitizedName = SanitizeName(originalName);

            const fileDir = path.dirname(resolvedFilePath);

            await fs.mkdir(fileDir, {
                recursive: true
            });

            const AvailableName = await GetAvailableName(fileDir, SanitizedName);

            const finalFilePath = path.join(fileDir, AvailableName);

            const readableStream = Readable.fromWeb(file.stream() as any);
            const writeStream = createWriteStream(finalFilePath);

            await pipeline(
                readableStream,
                writeStream
            );

            console.log("Saved:", finalFilePath);

            uploadedFiles.push({
                name: AvailableName,
                size: file.size,
                mime: file.type
            });
        }

        return json({
            message: 'Upload completed',
            files: uploadedFiles
        });
    } catch (err) {
        console.error("Upload error:", err);

        return json({ error: 'Internal server error' }, { status: 500 });
    }
}