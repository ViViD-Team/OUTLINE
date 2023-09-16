<script>
    import { onMount } from "svelte";
    const { ipcRenderer } = require("electron");
    const path = require("path");
    const fs = require("fs");

    export let data;
    export let pluginID;

    let enabled = data.enabled;

    function toggleEnabledState() {
        enabled = !enabled;

        ipcRenderer.sendSync("setPluginActiveState", {"pluginID": pluginID, "state": enabled});
    }

    let iconContainer;

    onMount(() => {
        const pluginsPath = path.join(ipcRenderer.sendSync("getSaveLocation"), ".plugins");

        let iconSVG = String(fs.readFileSync(path.join(pluginsPath, pluginID, "icon.svg")));

        iconContainer.innerHTML = iconSVG;
        let svg = iconContainer.querySelector("svg");
        svg.style.height = "6vh";
        svg.querySelector("path").setAttribute("fill", "var(--red)");
    })
</script>



<main>
    <div bind:this={iconContainer} class="iconContainer">

    </div>
    <div class="detailsContainer">
        <div class="detailsStrip titleStrip">
            <h1>{data.name}</h1>
        </div>
        <div class="detailsStrip descriptionStrip">
            <p>{data.description}</p>
        </div>
        <div class="detailsStrip infoStrip">
            <h2>{data.author}</h2>
            <div class="dot"></div>
            <h2>{data.version}</h2>
        </div>
    </div>
    <div class="activeToggleContainer">
        <div class="toggle" on:click={toggleEnabledState}>
            <div style="
                background-color: {enabled ? "var(--red)" : "var(--text1)"};
                opacity: {enabled ? "1" : ".5"};
                {enabled || true ? "" : "filter: brightness(.5) saturate(.5);"}
            " class="toggleRail">

                <div style="
                    margin-left: {enabled ? "3.25" : ".25"}vh;
                    background-color: {enabled ? "var(--text1)" : "var(--mainbg)"};
                " class="toggleHandle"></div>
            
            </div>
        </div>
    </div>
</main>



<style>
    main {
        margin-bottom: 2vh;

        width: calc(100% - 4vh);
        height: 12vh;


        display: flex;
    }

    h1 {
        font-size: 2vh;
        color: var(--red);
        font-weight: 600;
    }

    h2 {
        font-size: 1vh;
        color: var(--text1);
        font-weight: 300;
        opacity: .5;
    }

    p {
        font-size: 1.5vh;
        color: var(--text1);
        font-weight: 400;
    }

    .iconContainer {
        width: 12vh;
        height: 12vh;

        display: grid;
        place-items: center;
    }

    .detailsContainer {
        height: 100%;
        flex: 1;

        display: flex;
        flex-direction: column;
    }

    .activeToggleContainer {
        width: 12vh;
        height: 12vh;

        display: grid;
        place-items: center;
    }


    .detailsStrip {
        margin-left: 2vh;

        width: 100%;

        display: flex;
        align-items: center;
    }

    .titleStrip {
        flex: 2;
    }

    .descriptionStrip {
        flex: 3;
    }

    .infoStrip {
        flex: 2;
    }

    .infoStrip .dot {
        margin-left: 1vh;
        margin-right: 1vh;

        width: .5vh;
        height: .5vh;
        
        background-color: var(--text1);
        opacity: .5;

        border-radius: .25vh;
    }


    .toggle {
        cursor: pointer;

        width: 8vh;
        height: 4vh;


        border-radius: 2vh;

        display: grid;
        place-items: center;
    }

    .toggleRail {
        width: 6vh;
        height: 3vh;

        border-radius: 1.5vh;

        transition: 
            background-color .5s,
            filter .5s,
            opacity .5s;

        display: flex;
        align-items: center;
    }

    .toggleHandle {
        margin: .25vh;

        width: 2.5vh;
        height: 2.5vh;

        background-color: var(--text1);
        border-radius: 1.5vh;

        transition: margin-left .5s cubic-bezier(0, 0, 0, .9), background-color .5s cubic-bezier(0, 0, 0, .9);
    }
</style>