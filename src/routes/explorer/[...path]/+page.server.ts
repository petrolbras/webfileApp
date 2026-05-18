import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({params, fetch}) => {
    let data = null;

    try {
        const currentPath = ((params as any).path || '').replace(/\/+$/, '');;

        const url = currentPath
        ? `/api/explorer/${currentPath}`
        : '/api/explorer';

        const res = await fetch(url);

        data = await res.json();
    
        return {
            status: res.status,

            currentPath: data.currentPath || currentPath,

            files: data.files || [],

            error: data.error || null
        };
    } catch (err) {
        data = {
            message: 'An error occurred while fetching the directory contents.',

            error: err instanceof Error ? err.message : String(err)
        }
    }
}