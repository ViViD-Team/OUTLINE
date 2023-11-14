<script>
    const fs = require("fs");
    const path = require("path");

    const { ipcRenderer } = require("electron");

    import Toggle from "./inputTypes/Toggle.svelte";

    export let userSettings;


    /**
     * Calls main process to show a dir selection dialogue.
     * The selected directory will be added to `userSettings.devPluginDirs`.
     * The selected directory must be a valid plugin (include plugin.json). 
     */
    function addPluginDevDirectory() {
        const dirPath = ipcRenderer.sendSync("searchDevPluginDir");
        if (!dirPath || userSettings.devPluginDirs.includes(dirPath[0])) return;

        if (!fs.existsSync(path.join(dirPath[0], "plugin.json"))) {
            document.dispatchEvent(new CustomEvent("notificationEvent", {detail: {"type": "error", "message": "Selected path is not a plugin. Make sure to select a path containing a plugin.json!"}}));
            return;
        }

        userSettings.devPluginDirs = [...userSettings.devPluginDirs, dirPath[0]];
        userSettings.devPluginDirs = Object.assign([], userSettings.devPluginDirs);
    }

    /**
     * Removes the specified dirName from `userSettings.devPluginDirs`
     * 
     * @param {String} dirName The name of the directory to be removed
     */
    function removePluginDevDirectory(dirName) {
        userSettings.devPluginDirs = userSettings.devPluginDirs.filter((x) => {return x != dirName});
        userSettings.devPluginDirs = Object.assign([], userSettings.devPluginDirs);
    }
</script>



<main>
    {#if !userSettings.devModeEnabled}
        <div class="devWarningNotice">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
                <path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/>
            </svg>
            <p>
                These options are intended to be used by programmers only.
                Enabling the developer mode may significantly affect performance.
            </p>
        </div>
    {/if}
    <Toggle
        label="Enable Developer Mode"
        bind:value={userSettings.devModeEnabled}
    />
    {#if userSettings.devModeEnabled}
        <div class="devPluginDirsSelector">
            <h1>Development Plugins</h1>
            <div class="hr"></div>
            <div class="devDirList">
                {#each userSettings.devPluginDirs as dirName}
                    <div class="devDirEntry">
                        {#await new Promise((resolve, reject) => {
                            if (!fs.existsSync(path.join(dirName, "plugin.json"))) reject("404");
                            resolve(JSON.parse(fs.readFileSync(path.join(dirName, "plugin.json")))
                                .pluginName);
                        })}
                            <h3 class="loading" style="color: var(--text1);">
                                <span>.</span>
                                <span style="animation-delay: .2s;">.</span>
                                <span style="animation-delay: .4s;">.</span>
                            </h3>
                        {:then name} 
                            <h3>{name}</h3>
                        {:catch}
                            <h3 style="color: var(--red);">Not Found</h3>
                        {/await}

                        
                        
                        <p>{dirName}</p>
                        <div
                            class="devDirRemoveButton"
                            tabindex="0"
                            on:click={() => {removePluginDevDirectory(dirName)}}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                                <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
                                <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/>
                            </svg>
                        </div>
                    </div>
                {/each}
            </div>
            <div class="hr"></div>
            <div class="devDirAddButtonContainer">
                <div class="devDirAddButton" tabindex="0" on:click={addPluginDevDirectory}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                        <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
                        <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/>
                    </svg>
                </div>
            </div>
        </div>
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

    .devWarningNotice {
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

    .devWarningNotice svg {
        height: 4vh;
        animation: fadeBlink .5s;
    }

    .devWarningNotice svg path {
        fill: var(--mainbg);
    }

    .devWarningNotice p {
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


    div.hr {
        opacity: .5;

        width: calc(100% - 4vh);
        height: .2vh;

        border-radius: .1vh;
        background-color: var(--shadow2);
    }


    .devPluginDirsSelector {
        margin-top: 1.5vh;
        margin-bottom: 1.5vh;

        width: calc(100% - 10vh);
        min-height: 8vh;

        border-radius: 2vh;
        background-color: var(--shadow1);

        display: flex;
        flex-direction: column;

        align-items: center;
    }

    .devPluginDirsSelector h1 {
        margin-top: 1vh;
        margin-bottom: 1vh;

        height: 4vh;

        color: var(--red);
        font-size: 2.5vh;
    }

    .devDirList {
        padding-top: 2vh;
        padding-bottom: 2vh;
        width: 100%;
        min-height: 4vh;

        display: flex;
        flex-direction: column;
    }

    .devDirEntry {
        width: 100%;
        height: 4vh;

        display: flex;
        align-items: center;

        overflow: hidden;
    }

    .devDirEntry h3 {
        color: var(--velvet);
        font-size: 2vh;
        font-weight: 800;
        margin-left: 2vh;
    }

    @keyframes flash {
        from {
            transform: translateY(0);
        }
        50% {
            opacity: .2;
            transform: translateY(-.2vh);
        }
        to {
            transform: translateY(0);
        }
    }

    .devDirEntry h3.loading span {
        display: inline-block;
        animation: flash 1s infinite cubic-bezier(0, 0, 0, .9);
    }

    .devDirEntry p {
        margin-left: 2vh;
        font-size: 1.5vh;

        flex: 1;

        color: var(--text1);

        overflow: hidden;
    }

    .devDirRemoveButton {
        cursor: pointer;

        margin-right: 2vh;
        margin-left: 4vh;

        height: 4vh;
        width: 4vh;

        display: grid;
        place-items: center;
    }

    .devDirRemoveButton svg {
        height: 2vh;
    }

    .devDirRemoveButton svg path {
        fill: var(--text1);
        opacity: .5;

        transition:
            fill .5s cubic-bezier(0, 0, 0, .9),
            opacity .5s cubic-bezier(0, 0, 0, .9);
    }

    .devDirRemoveButton:hover svg path,
    .devDirRemoveButton:focus svg path {
        fill: var(--red);
        opacity: 1;
    }

    .devDirAddButtonContainer {
        width: 100%;
        height: 6vh;

        display: grid;
        place-items: center;
    }

    .devDirAddButton {
        cursor: pointer;

        width: 4vh;
        height: 4vh;

        border-radius: 2vh;
        background-color: var(--red);

        display: grid;
        place-items: center;

        transition: transform .5s cubic-bezier(0, 0, 0, .9);
    }

    .devDirAddButton:hover, .devDirAddButton:focus {
        transform: translateY(-.2vh);
    }

    .devDirAddButton svg {
        height: 2vh;
    }

    .devDirAddButton svg path {
        fill: var(--mainbg);
    }
</style>