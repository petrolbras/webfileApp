import { json } from '@sveltejs/kit';
import path from 'path';
import fs from 'fs/promises';

const STORAGE_DIR = path.resolve('storage');

export async function DELETE({request}) {
    try {

        const { path: relativePath } = await request.json();

        if (!relativePath || typeof relativePath !== 'string') {
            return json({ error: 'Invalid path' }, { status: 400 });
        }

        const targetPath = path.resolve(STORAGE_DIR, relativePath);
        const BaseDir = path.resolve(STORAGE_DIR);

        if (!targetPath.startsWith(BaseDir)) {
            return json({ error: 'Access denied' }, { status: 403 });
        }

        try {
            const stat = await fs.stat(targetPath);

            if (!stat.isFile()) {
                return json({ error: 'Target is not a file' }, { status: 400 });
            }

            await fs.unlink(targetPath);

            return json({ message: 'File deleted successfully' });

        } catch (err: any) {
            console.error("Delete error:", err);

            if (err.code === 'ENOENT') {
                return json({ error: 'File not found' }, { status: 404 });
            }

            console.error("Error deleting file:", err);

            return json({ error: 'Error deleting file' }, { status: 500 });
        }
    } catch (err) {
        console.error("Request error:", err);
        return json({ error: 'Invalid request' }, { status: 400 });
    }
}