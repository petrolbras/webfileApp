<script lang="ts">
    import type { PageData } from './$types';
    import { invalidateAll } from '$app/navigation';
    import { push } from '$lib/components/toast.svelte';
    import { faFile, faFolderOpen, faPlus } from '@fortawesome/free-solid-svg-icons';
    import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';

    let { data }: { data: PageData } = $props();

    let creatingFolder = $state(false);
    let newFolderName = $state('');
    let creatingFile = $state(false);
    let newFileName = $state('');

    $effect(() => {
        data.currentPath;

        creatingFolder = false;
        newFolderName = '';
    });

    let files = $derived.by(() => [...data.files]);

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

        if (file.type === 'folder') {
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

            files = files.filter(f => f.path !== file.path);

            push(`Deleted successfully.`, { duration: 3000 });
        } catch (err) {
            console.error("Delete error:", err);
            push(err instanceof Error ? err.message : "Failed to delete.", { duration: 3000 });
        }
    }

    async function handleUpload(event: Event) { 
        const input = event.target as HTMLInputElement;

        const files = Array.from(input.files || []);

        if (!files.length) {
            return;
        }

        const formData = new FormData();
        formData.append('currentPath', data.currentPath);

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

            push('Upload completed.', { duration: 3000 });
        } catch (err) {
            console.error("Upload error:", err);
            push(err instanceof Error ? err.message : "Upload failed.", { duration: 3000 });
        }
    }

    async function createFolder() {

        if (!newFolderName.trim()) {
            return;
        }

        if (newFolderName.includes('/')) {
            push("Folder name cannot contain '/'.", { duration: 3000 });
            return;
        }

        try {
            const res = await fetch('/api/create-folder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    newFolderName,
                    currentPath: data.currentPath
                })
            });

        const result = await res.json();

        if (!res.ok) {
            throw new Error(result.error);
        }

        newFolderName = '';

        creatingFolder = false;

        await invalidateAll();

        push('Folder created successfully.', { duration: 3000 });

        } catch (err) {
            console.error("Create folder error:", err);
            push(err instanceof Error ? err.message : "Failed to create folder.", { duration: 3000 });
        }
    }

    async function createFile() {

        if (!newFileName.trim()) {
            return;
        }

        if (newFileName.includes('/')) {
            push("File name cannot contain '/'.", { duration: 3000 });
            return;
        }

        try {
            const res = await fetch('/api/create-file', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    newFileName,
                    currentPath: data.currentPath
                })
            });

        const result = await res.json();

        if (!res.ok) {
            throw new Error(result.error);
        }

        newFileName = '';

        creatingFile = false;

        await invalidateAll();

        push('File created successfully.', { duration: 3000 });

        } catch (err) {
            console.error("Create file error:", err);
            push(err instanceof Error ? err.message : "Failed to create file.", { duration: 3000 });
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

                <div class="relative ml-auto flex flex-col items-center gap-2">
 
                    <div class="relative ml-auto flex items-end gap-2">

                        <button
                            class="w-10 h-10 flex items-center justify-center bg-zinc-800 rounded-lg hover:bg-zinc-700 border border-zinc-600 cursor-pointer"
                            aria-label="Create file"
                            title="Create file"
                            onclick={() => creatingFile = !creatingFile}
                        >
                            <FontAwesomeIcon icon={faFile} />
                        </button>

                        <div class="flex flex-col items-center gap-2">

                            <button
                                class="w-10 h-10 flex items-center justify-center bg-zinc-800 rounded-lg hover:bg-zinc-700 border border-zinc-600 cursor-pointer"
                                onclick={() => showMenu = !showMenu}
                            >
                                <FontAwesomeIcon icon={faPlus} />
                            </button>

                            <button
                                class="w-10 h-10 flex items-center justify-center bg-zinc-800 rounded-lg hover:bg-zinc-700 border border-zinc-600 cursor-pointer"
                                aria-label="Create folder"
                                title="Create folder"
                                onclick={() => creatingFolder = !creatingFolder}
                            >
                                <FontAwesomeIcon icon={faFolderOpen} />
                            </button>

                        </div>

                    </div>

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

                <a href="/explorer" class="hover:text-blue-400 transition-colors">
                    Home
                </a>

                {#each segments as segment, index}

                    {@const partialPath = segments.slice(0, index + 1).join('/')}

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

        {:else}

            <div class="rounded-xl border border-zinc-800 overflow-hidden">

                <ul class="divide-y divide-zinc-800">

                    {#if data.currentPath === ''}

                        <div class="flex items-center gap-3 px-5 py-4 text-zinc-400">
                            <span>This is the root folder.</span>
                        </div>

                    {:else}

                        <li>

                            <a
                                href={parentPath ? `/explorer/${parentPath}` : '/explorer'}
                                class="flex items-center gap-3 px-5 py-4 hover:bg-zinc-800 transition-colors text-zinc-300"
                            >

                                <span class="text-xl">◀</span>

                                <span class="mt-1">Back</span>

                            </a>

                        </li>

                    {/if}

                    {#if creatingFolder}

                        <li class="px-5 py-4">

                            <div class="flex items-center gap-4">

                                <span class="text-3xl">📁</span>

                                <input
                                    bind:value={newFolderName}
                                    onkeydown={(event) => {
                                        if (event.key === 'Enter') {
                                            createFolder();
                                        } else if (event.key === 'Escape') {
                                            creatingFolder = false;
                                        }
                                    }}
                                    class="bg-zinc-800 border border-zinc-600 rounded px-3 py-2 outline-none"
                                    placeholder="Folder name"
                                />

                            </div>

                        </li>

                    {/if}
                    
                    {#if creatingFile}

                        <li class="px-5 py-4">

                            <div class="flex items-center gap-4">

                                <span class="text-3xl">📄</span>

                                <input
                                    bind:value={newFileName}
                                    onkeydown={(event) => {
                                        if (event.key === 'Enter') {
                                            createFile();
                                        } else if (event.key === 'Escape') {
                                            creatingFile = false;
                                        }
                                    }}
                                    class="bg-zinc-800 border border-zinc-600 rounded px-3 py-2 outline-none"
                                    placeholder="File name"
                                />

                            </div>

                        </li>

                    {/if}

                    {#if data.files.length === 0}

                        <div class="rounded-xl overflow-hidden">
                            
                            <div class="p-6 text-zinc-400 bg-zinc-950">
                                Empty folder.
                            </div>

                        </div>

                    {/if}

                    {#each files as file}

                        <li>

                            {#if file.type === 'folder'}

                                <div class="flex items-center px-5 py-4 hover:bg-zinc-800 transition-colors">

                                    <a
                                        href={
                                            data.currentPath
                                                ? `/explorer/${data.currentPath}/${file.name}`
                                                : `/explorer/${file.name}`
                                        }
                                        class="flex items-center gap-4 flex-1 min-w-0"
                                    >

                                        <span class="text-3xl shrink-0">📁</span>

                                        <div class="flex flex-col min-w-0">

                                            <span class="text-xl text-zinc-100 break-all hover:text-blue-400">
                                                {file.name}
                                            </span>

                                            <div class="flex items-center gap-2 text-sm text-zinc-500">
                                                <span>{file.size}</span>
                                            </div>

                                        </div>

                                    </a>

                                    <button
                                        type="button"
                                        class="ml-4 shrink-0 bg-zinc-800 px-4 py-2 rounded-lg hover:bg-zinc-700 border border-zinc-600 cursor-pointer"
                                        onclick={(event) => {
                                            event.stopPropagation();
                                            event.preventDefault();
                                            deleteFile(file);
                                        }}
                                    >
                                        Delete
                                    </button>

                                </div>

                            {:else}

                                <div class="flex items-center gap-4 px-5 py-4 text-zinc-300">

                                    <span class="text-3xl shrink-0">📄</span>

                                    <div class="flex flex-col min-w-0">

                                        <span class="text-xl text-zinc-100 break-all">
                                            {file.name}
                                        </span>

                                        <div class="flex items-center gap-2 text-sm text-zinc-500">

                                            <span>{file.size}</span>

                                            <span>.{file.mime}</span>

                                        </div>

                                    </div>

                                    <button
                                        type="button"
                                        class="ml-auto bg-zinc-800 px-4 py-2 rounded-lg hover:bg-zinc-700 border border-zinc-600 cursor-pointer"
                                        onclick={(event) => {
                                            event.stopPropagation();
                                            event.preventDefault();
                                            deleteFile(file);
                                        }}
                                    >
                                        Delete
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