<script lang="ts">
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();

    const segments = $derived.by(() =>
        data.currentPath ? data.currentPath.split('/') : []
    );
</script>

<h1>Explorer</h1>

<nav>

    <a href="/explorer">
        Home
    </a>

    {#each segments as segment, index}

        {@const partialPath = segments
            .slice(0, index + 1)
            .join('/')}

        <span>&nbsp;/</span>

        <a href={`/explorer/${partialPath}`}>
            {segment}
        </a>

    {/each}

</nav>

<p>Current path: {data.currentPath}</p>

{#if data.error}

    <p>{data.error}</p>

{:else if data.files.length === 0}

    <p>Empty folder.</p>

{:else}

    <ul>

        {#each data.files as file}

            <li>

                {#if file.type === 'folder'}

                    <a href={
                        data.currentPath
                            ? `/explorer/${data.currentPath}/${file.name}`
                            : `/explorer/${file.name}`
                    }>
                        📁 {file.name}
                    </a>

                {:else}

                    📄 {file.name}

                {/if}

            </li>

        {/each}

    </ul>

{/if}