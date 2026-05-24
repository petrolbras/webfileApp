import fs from 'fs/promises';
import path from 'path';
import { getDirSize } from '$lib/getDirSize';

import { json } from '@sveltejs/kit';
import { formatBytes } from '$lib/FormatBytes.js';

const STORAGE_DIR = path.resolve('storage');

export async function GET({params}) {
    try {
        const relativepath = params.path || '';

        const unsafepath = path.join(STORAGE_DIR, relativepath);

        const fullpath = path.resolve(unsafepath);

        if (!fullpath.startsWith(STORAGE_DIR)) {

            return json({
                error: 'Access denied'
            }, {
                status: 403
            });
        }

        const entries = await fs.readdir(fullpath, { withFileTypes: true });

        const files = await Promise.all(
            entries.map(async (entry) => ({
                name: entry.name,
                type: entry.isDirectory() ? 'folder' : 'file',
                size: entry.isDirectory()
                    ? formatBytes(await getDirSize(path.join(fullpath, entry.name)))
                    : formatBytes((await fs.stat(path.join(fullpath, entry.name))).size),
                mime: entry.isDirectory() ? null : path.extname(entry.name).slice(1),
                path: relativepath
                    ? `${relativepath}/${entry.name}`
                    : entry.name

            }))
        );
        

        return json({ 
            currentPath: relativepath, 
            files 
        });
    } catch (err: any) {

        if (err.code === 'ENOENT') {

            return json({
                error: 'Folder not found'
            }, {
                status: 404
            });

        }

        console.error(err);
        

        return json({
            error: 'Internal server error'
        }, {
            status: 500
        });
    }
}