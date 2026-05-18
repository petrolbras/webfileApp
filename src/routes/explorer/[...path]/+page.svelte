<script lang="ts">
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();

    const segments = $derived.by(() =>
        data.currentPath ? data.currentPath.split('/') : []
    );

    const parentPath = $derived.by(() => {

        if (!data.currentPath) {
            return '';
        }

        return data.currentPath
            .split('/')
            .slice(0, -1)
            .join('/');

    });
</script>

<div class="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">

    <div class="w-full max-w-5xl rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl p-8">

        <div class="mb-8">

            <h1 class="text-5xl font-bold tracking-tight mb-3">
                Explorer
            </h1>

            <nav class="flex flex-wrap items-center text-lg text-zinc-400 gap-1">

                <a
                    href="/explorer"
                    class="hover:text-blue-400 transition-colors"
                >
                    Home
                </a>

                {#each segments as segment, index}

                    {@const partialPath = segments
                        .slice(0, index + 1)
                        .join('/')}

                    <span class="text-zinc-600">/</span>

                    <a
                        href={`/explorer/${partialPath}`}
                        class="hover:text-blue-400 transition-colors"
                    >
                        {segment}
                    </a>

                {/each}

            </nav>

        </div>

        {#if data.error}

            <div class="rounded-xl bg-red-950 border border-red-800 p-4 text-red-300">
                {data.error}
            </div>

        {:else if data.files.length === 0}

            <div class="rounded-xl border border-zinc-800 overflow-hidden">

                <ul class="divide-y divide-zinc-800">

                    <li>

                        <a
                            href={parentPath ? `/explorer/${parentPath}` : '/explorer'}
                            class="flex items-center gap-3 px-5 py-4 hover:bg-zinc-800 transition-colors text-zinc-300"
                        >

                            <span class="text-xl">
                                ◀
                            </span>

                            <span class="mt-1">
                                Back
                            </span>

                        </a>

                    </li>

                </ul>

                <div class="p-6 text-zinc-400 bg-zinc-950">
                    Empty folder.
                </div>

            </div>

        {:else}

            <div class="rounded-xl border border-zinc-800 overflow-hidden">

                <ul class="divide-y divide-zinc-800">

                    {#if data.currentPath === ''}

                        <div
                            class="flex items-center gap-3 px-5 py-4 text-zinc-600"
                        >
                            <span>
                                This is the root folder.
                            </span>
                        </div>

                    {:else}

                        <li>

                            <a
                                href={parentPath ? `/explorer/${parentPath}` : '/explorer'}
                                class="flex items-center gap-3 px-5 py-4 hover:bg-zinc-800 transition-colors text-zinc-300"
                            >

                                <span class="text-xl">
                                    ◀
                                </span>

                                <span class="mt-1">
                                    Back
                                </span>

                            </a>

                        </li>

                    {/if}

                    {#each data.files as file}

                        <li>

                            {#if file.type === 'folder'}

                                <a
                                    href={
                                        data.currentPath
                                            ? `/explorer/${data.currentPath}/${file.name}`
                                            : `/explorer/${file.name}`
                                    }
                                    class="flex items-center gap-4 px-5 py-4 hover:bg-zinc-800 transition-colors"
                                >

                                    <span class="text-3xl shrink-0">
                                        📁
                                    </span>

                                    <div class="flex flex-col min-w-0">

                                        <span class="text-xl text-zinc-100 break-all hover:text-blue-400">
                                            {file.name}
                                        </span>

                                        <div class="flex items-center gap-2 text-sm text-zinc-500">

                                            <span>
                                                {file.size}
                                            </span>

                                        </div>

                                    </div>

                                </a>

                            {:else}

                                <div
                                    class="flex items-center gap-4 px-5 py-4 text-zinc-300"
                                >

                                    <span class="text-3xl shrink-0">
                                        📄
                                    </span>

                                    <div class="flex flex-col min-w-0">

                                        <span class="text-xl text-zinc-100 break-all">
                                            {file.name}
                                        </span>

                                        <div class="flex items-center gap-2 text-sm text-zinc-500">

                                            <span>
                                                {file.size}
                                            </span>

                                            <span>
                                                .{file.mime}
                                            </span>

                                        </div>

                                    </div>

                                </div>

                            {/if}

                        </li>

                    {/each}

                </ul>

            </div>

        {/if}

    </div>

</div>