<script lang="ts">
    import type { PageData } from './$types';
    import { invalidateAll } from '$app/navigation';
    import { push } from '$lib/components/toast.svelte';

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

    let showMenu = $state(false);

    let fileInput: HTMLInputElement;
    let folderInput: HTMLInputElement;

    interface FileItem {
        name: string;
        type: 'file' | 'folder';
        size: string;
        mime: string | null;
        path: string;
    }

    async function deleteFile(file: FileItem) {

        console.log(file);

        if (fileInput.type === 'folder') {
            if (!confirm(`Are you sure you want to delete the folder "${file.path}" and all its contents?`)) {
                return;
            }
        } else {
            if (!confirm(`Are you sure you want to delete the file "${file.path}"?`)) {
                return;
            }
        }

        try {
            const res = await fetch('/api/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ path: file.path })
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error);
            }

            await invalidateAll();
        } catch (err) {
            console.error("Delete error:", err);
            alert("Failed to delete file.");
        }
    }

    async function handleUpload(event: Event) { 
        const input = event.target as HTMLInputElement;

        const files = Array.from(input.files || []);

        if (!files.length) { return; }

        const formData = new FormData();

        for (const file of files) {
            formData.append('files', file);
            formData.append('paths', file.webkitRelativePath || file.name);
        }

        try {
            const res = await fetch('/api/uploads', {
                method: 'POST',
                body: formData
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error);
            }

            await invalidateAll();
        } catch (err) {
            console.error("Upload error:", err);
            alert("Failed to upload files.");
        }
    }
</script>

<div class="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">

    <div class="w-full max-w-5xl rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl p-8">

        <div class="mb-8">

            <div class="flex items-center">

                <h1 class="text-5xl font-bold tracking-tight mb-3">Explorer</h1>
                
                <input
                    bind:this={fileInput}
                    type="file"
                    multiple
                    class="hidden"
                    onchange={handleUpload}
                />

                <input 
                    bind:this={folderInput}
                    type="file"
                    multiple
                    webkitdirectory
                    class="hidden"
                    onchange={handleUpload}
                />

                <div class="relative ml-auto">

                    <button
                        class="bg-zinc-800 px-4 py-2 rounded-lg hover:bg-zinc-700 border border-zinc-600 cursor-pointer"
                        onclick={() => showMenu = !showMenu}
                    >
                        +
                    </button>

                    {#if showMenu}

                        <div class="absolute top-0 right-full mr-3 bg-zinc-800 border border-zinc-600 rounded-lg shadow-lg py-2 min-w-48 z-50">

                        <button
                            class="w-full text-left px-4 py-2 hover:bg-zinc-700 cursor-pointer"
                            onclick={() => {
                            fileInput.click();
                            showMenu = false;
                            }}
                        >
                        Upload Files
                        </button>

                        <button
                            class="w-full text-left px-4 py-2 hover:bg-zinc-700 cursor-pointer"
                            onclick={() => {
                            folderInput.click();
                            showMenu = false;
                            }}
                        >
                        Upload Folder
                        </button>

                </div>

            {/if}

            </div>

            </div>

            <nav class="flex flex-wrap items-center text-lg text-zinc-400 gap-1">

                <a href="/explorer" class="hover:text-blue-400 transition-colors">Home</a>

                {#each segments as segment, index}

                    {@const partialPath = segments.slice(0, index + 1).join('/')}

                    <span class="text-zinc-600">/</span>

                    <a href={`/explorer/${partialPath}`} class="hover:text-blue-400 transition-colors">{segment}</a>

                {/each}

            </nav>

        </div>

        {#if data.error}

            <div class="rounded-xl bg-red-950 border border-red-800 p-4 text-red-300">{data.error}</div>

        {:else if data.files.length === 0}

            <div class="rounded-xl border border-zinc-800 overflow-hidden">

                <ul class="divide-y divide-zinc-800">

                    <li>

                        <a href={parentPath ? `/explorer/${parentPath}` : '/explorer'} class="flex items-center gap-3 px-5 py-4 hover:bg-zinc-800 transition-colors text-zinc-300">

                            <span class="text-xl">◀</span>

                            <span class="mt-1">Back</span>

                        </a>

                    </li>

                </ul>

                <div class="p-6 text-zinc-400 bg-zinc-950">Empty folder.</div>

            </div>

        {:else}

            <div class="rounded-xl border border-zinc-800 overflow-hidden">

                <ul class="divide-y divide-zinc-800">

                    {#if data.currentPath === ''}

                        <div class="flex items-center gap-3 px-5 py-4 text-zinc-600"><span>This is the root folder.</span></div>

                    {:else}

                        <li>

                            <a href={parentPath ? `/explorer/${parentPath}` : '/explorer'} class="flex items-center gap-3 px-5 py-4 hover:bg-zinc-800 transition-colors text-zinc-300">

                                <span class="text-xl"> ◀</span>

                                <span class="mt-1">Back</span>

                            </a>

                        </li>

                    {/if}

                    {#each data.files as file}

                        <li>

                            {#if file.type === 'folder'}

                                <div class="flex items-center px-5 py-4 hover:bg-zinc-800 transition-colors" >

                                    <a href={ data.currentPath ? `/explorer/${data.currentPath}/${file.name}` : `/explorer/${file.name}` } class="flex items-center gap-4 flex-1 min-w-0">

                                        <span class="text-3xl shrink-0"> 📁</span>

                                        <div class="flex flex-col min-w-0">

                                            <span class="text-xl text-zinc-100 break-all hover:text-blue-400">{file.name}</span>

                                            <div class="flex items-center gap-2 text-sm text-zinc-500"><span>{file.size}</span></div>

                                        </div>

                                    </a>

                                    <button
                                        class="ml-4 shrink-0 bg-zinc-800 px-4 py-2 rounded-lg hover:bg-zinc-700 border border-zinc-600 cursor-pointer"
                                        onclick={() => deleteFile(file)}
                                    >
                                        Delete
                                    </button>

                                </div>
                            {:else}

                                <div class="flex items-center gap-4 px-5 py-4 text-zinc-300">

                                    <span class="text-3xl shrink-0">📄</span>

                                    <div class="flex flex-col min-w-0">

                                        <span class="text-xl text-zinc-100 break-all">{file.name}</span>

                                        <div class="flex items-center gap-2 text-sm text-zinc-500">

                                            <span>{file.size}</span>

                                            <span>.{file.mime}</span>

                                        </div>

                                    </div>

                                    <button class="ml-auto bg-zinc-800 px-4 py-2 rounded-lg hover:bg-zinc-700 border border-zinc-600 cursor-pointer" onclick={(event) => {
                                        event.stopPropagation();
                                        deleteFile(file);
                                    }}>Delete
                                    </button>

                                </div>

                            {/if}

                        </li>

                    {/each}

                </ul>

            </div>

        {/if}

    </div>

</div>