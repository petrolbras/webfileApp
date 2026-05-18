import path from 'path';
import fs from 'fs/promises';

export async function GetAvailableName(dirPath: string, name: string): Promise<string> {
    try {
        const resolvedDir = path.resolve(dirPath);
        const fullPath = path.join(dirPath, name);
        const resolvedPath = path.resolve(fullPath);

        if (!resolvedPath.startsWith(resolvedDir)) {
            throw new Error('Invalid name');
        }

        const exists = await fs.stat(fullPath).then(() => true).catch(() => false);

        if (!exists) {
            return name;
        }

        const ext = path.extname(name);
        const baseName = path.basename(name, ext);

        let counter = 1;
        let newName;

        do {
            newName = `${baseName}(${counter})${ext}`;
            counter++;
        } while (await fs.stat(path.join(dirPath, newName)).then(() => true).catch(() => false));

        return newName;
    } catch (err) {
        console.error(`Error checking name availability for ${name} in ${dirPath}:`, err);
        throw err;
    }
}