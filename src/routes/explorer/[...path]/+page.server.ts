import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({params, fetch}) => {
    
    const currentPath = ((params as any).path || '').replace(/\/+$/, '');;

    const url = currentPath
    ? `/api/explorer/${currentPath}`
    : '/api/explorer';

    const res = await fetch(url);

    const data = await res.json();
    
    return {
        status: res.status,

        currentPath: data.currentPath || currentPath,

        files: data.files || [],

        error: data.error || null
    };
}