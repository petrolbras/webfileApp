import fs from 'fs/promises';
import path from 'path';
import { getDirSize } from '$lib/getDirSize';

import { json } from '@sveltejs/kit';
import { formatBytes } from '$lib/FormatBytes.js';

const ROOT_DIR = path.resolve('storage');

export async function GET({params}) {
    try {
        const relativepath = params.path || '';

        const unsafepath = path.join(ROOT_DIR, relativepath);

        const fullpath = path.resolve(unsafepath);

        if (!fullpath.startsWith(ROOT_DIR)) {

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
                mime: entry.isDirectory() ? null : path.extname(entry.name).slice(1)
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