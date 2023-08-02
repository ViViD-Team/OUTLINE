<script>
    import { onMount } from "svelte";
    const { ipcRenderer } = require("electron");

    import PluginManagerEntry from "./PluginManagerEntry.svelte";


    let installedPlugins;
    onMount(() => {
        installedPlugins = ipcRenderer.sendSync("getPluginMap");
    })
</script>



<main>
    {#if installedPlugins}
    {#each Object.keys(installedPlugins) as pluginID}
        <PluginManagerEntry
            data={installedPlugins[pluginID]}
            pluginID={pluginID}
        />
    {/each}
    {/if}
</main>



<style>
    main {
        width: 100%;
        height: 100%;

        display: flex;
        flex-direction: column;
        align-items: center;
    }
</style>