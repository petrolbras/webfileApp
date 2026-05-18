<script lang="ts">
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();

    const segments = $derived.by(() =>
        data.currentPath ? data.currentPath.split('/') : []
    );
</script>

<div class="flex flex-col h-screen justify-center items-center padding-4 gap-4 text-4xl">
    <h1 class="text-6xl font-bold mb-5">Explorer</h1>
    
    <nav class="flex items-center gap-0.5 text-3xl text-blue-600 mb-5">
    
        <a href="/explorer" class="hover:underline">
            Home
        </a>
    
        {#each segments as segment, index}
    
            {@const partialPath = segments
                .slice(0, index + 1)
                .join('/')}
    
            <span>&nbsp;/&nbsp;</span>
    
            <a href={`/explorer/${partialPath}`} class="hover:underline">
                {segment}
            </a>
    
        {/each}
    
    </nav>
    

    {#if data.error}
    
        <p>{data.error}</p>
    
    {:else if data.files.length === 0}
    
        <p>Empty folder.</p>
    
    {:else}
    
        <ul>
    
            {#each data.files as file}
    
                <li class="text-2xl">
    
                    {#if file.type === 'folder'}
    
                        <a href={
                            data.currentPath
                                ? `/explorer/${data.currentPath}/${file.name}`
                                : `/explorer/${file.name}`
                        } class="hover:underline">
                            📁 {file.name}
                        </a>
    
                    {:else}
    
                        📄 {file.name}
    
                    {/if}
    
                </li>
    
            {/each}
    
        </ul>
    
    {/if}
</div>