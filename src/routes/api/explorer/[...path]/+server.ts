import fs from 'fs/promises';
import path from 'path';

import { json } from '@sveltejs/kit';

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

        const files = entries.map((entry) => ({
            name: entry.name,
            type: entry.isDirectory() ? 'folder' : 'file',
        }))

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