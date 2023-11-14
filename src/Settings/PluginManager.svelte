<script>
    import { onMount } from "svelte";
    const { ipcRenderer, ipcMain } = require("electron");

    import PluginManagerEntry from "./PluginManagerEntry.svelte";


    let installedPlugins;
    onMount(() => {
        getInstalledPlugins();
    });
    function getInstalledPlugins() {
        installedPlugins = null;
        installedPlugins = ipcRenderer.sendSync("getPluginMap");
    }

    ipcRenderer.on("refreshPlugins", getInstalledPlugins);

    function initPluginInstall() {
        ipcRenderer.sendSync("installPlugin");
    }

    
</script>



<main>
    <div class="pluginWarningNotice">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
            <path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/>
        </svg>
        <p>
            Only install and use plugins from sources you trust!
            Using untrustworthy plugins might subject you to security risks.
        </p>
    </div>
    {#if installedPlugins}
    {#each Object.keys(installedPlugins) as pluginID}
        <PluginManagerEntry
            data={installedPlugins[pluginID]}
            pluginID={pluginID}
        />
    {/each}
    <button class="installButton" on:click={initPluginInstall}>
        <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512">
            <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
            <path d="M96 0C78.3 0 64 14.3 64 32v96h64V32c0-17.7-14.3-32-32-32zM288 0c-17.7 0-32 14.3-32 32v96h64V32c0-17.7-14.3-32-32-32zM32 160c-17.7 0-32 14.3-32 32s14.3 32 32 32v32c0 77.4 55 142 128 156.8V480c0 17.7 14.3 32 32 32s32-14.3 32-32V412.8c12.3-2.5 24.1-6.4 35.1-11.5c-2.1-10.8-3.1-21.9-3.1-33.3c0-80.3 53.8-148 127.3-169.2c.5-2.2 .7-4.5 .7-6.8c0-17.7-14.3-32-32-32H32zM432 512a144 144 0 1 0 0-288 144 144 0 1 0 0 288zm16-208v48h48c8.8 0 16 7.2 16 16s-7.2 16-16 16H448v48c0 8.8-7.2 16-16 16s-16-7.2-16-16V384H368c-8.8 0-16-7.2-16-16s7.2-16 16-16h48V304c0-8.8 7.2-16 16-16s16 7.2 16 16z"/>
        </svg>
        Install from .opb
    </button>
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

    .pluginWarningNotice {
        margin-top: 1.5vh;
        margin-bottom: 1.5vh;

        width: calc(100% - 10vh);
        height: 8vh;

        background-color: var(--red);
        border-radius: 2vh;

        display: flex;
        align-items: center;
        justify-content: space-evenly;
    }

    .pluginWarningNotice svg {
        height: 4vh;
        animation: fadeBlink .5s;
    }

    .pluginWarningNotice svg path {
        fill: var(--mainbg);
    }

    .pluginWarningNotice p {
        width: calc(100% - 16vh);
        flex-grow: 0;

        color: var(--mainbg);

        font-size: 1.75vh;
    }

    @keyframes fadeBlink {
        50% {
            opacity: .6;
        }
    }


    .installButton {
        all: unset;

        cursor: pointer;

        margin-top: 4vh;
        padding: 1.5vh 1.75vh 1.5vh 1.75vh;

        border-radius: 1.5vh;
        background-color: var(--red);

        display: flex;
        align-items: center;

        transition: transform .5s cubic-bezier(0, 0, 0, .9);

        justify-self: flex-end;

        font-size: 1.5vh;

        color: var(--mainbg);
    }

    .installButton:hover {
        transform: translateY(-.2vh);
    }

    .installButton svg {
        max-height: 1.5vh;
        margin-right: .75vh;
    }

    .installButton svg path {
        fill: var(--mainbg);
    }
</style>