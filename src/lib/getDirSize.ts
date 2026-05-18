import fs from 'fs/promises';
import path from 'path';

export async function getDirSize(dirPath: string): Promise<number> {
    let totalSize = 0;

    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        const sizes = await Promise.all(
            entries.map(async (entry) => {
                const fullPath = path.join(dirPath, entry.name);

                if (entry.isDirectory()) {
                    return getDirSize(fullPath);
                } else if (entry.isFile()) {
                    const stat = await fs.stat(fullPath);
                    return stat.size;
                }
                return 0;
            })
        );

        totalSize = sizes.reduce((acc, size) => acc + size, 0);
    } catch (err) {
        console.error(`Error calculating size for ${dirPath}:`, err);
    }

    return totalSize;
}