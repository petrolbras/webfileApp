<svelte:options runes={true} />

<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
    import Toast from '$lib/components/toast.svelte';
    import './app.css';

	let { children } = $props();
</script>

<Toast />

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>


{@render children()}