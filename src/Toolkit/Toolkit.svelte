<script>
    import { onMount } from "svelte";
    import CategoryButton from "./CategoryButton.svelte";
    import ToolkitWidget from "./ToolkitWidget.svelte";
    import PluginCategoryButton from "./PluginCategoryButton.svelte";
    import PluginToolkitWidget from "./PluginToolkitWidget.svelte";
    
    const fs = require("fs");
    const path = require("path");
    const { ipcRenderer } = require("electron");


    export let userSettings;


    const pluginsPath = path.join(ipcRenderer.sendSync("getSaveLocation"), ".plugins");

    let category = null;

    let activePlugins = [];
    function getActivatedPlugins() {
        activePlugins = ipcRenderer.sendSync("getActivatedPlugins");
        activePlugins = activePlugins.map(x => Object.assign(x, {
            "categoryIconSVG": String(fs.readFileSync(path.join(pluginsPath, x.pluginID, "icon.svg"))),
            "widgets": x.widgets.map(y => Object.assign(y, {"widgetIconSVG": String(fs.readFileSync(path.join(pluginsPath, x.pluginID, y.widgetID, `${y.widgetID}.svg`)))}))
        }));
    }
    onMount(() => {
        getActivatedPlugins();

        devPlugins = getDevPlugins();
    });

    ipcRenderer.on("refreshPlugins", getActivatedPlugins);


    let devPlugins = [];

    function getDevPlugins() {
        const out = [];

        userSettings.devPluginDirs.forEach(dir => {
            if (fs.existsSync(path.join(dir, "plugin.json"))) {
                out.push(Object.assign({"path": dir}, 
                    JSON.parse(String(fs.readFileSync(path.join(dir, "plugin.json"))))
                ));
            }
        });

        return out;
    }

    export function refreshDevPlugins() {
        devPlugins = getDevPlugins();
        document.dispatchEvent(new CustomEvent("notificationEvent", {detail: {"type": "note", "message": "Developlment plugins refreshed!"}}));
        console.log(devPlugins);
    }

    export function refreshDevPluginsSilent() {
        devPlugins = getDevPlugins();
    }

</script>



<main>
    {#if category == null}
        <div class="categoryButtonLayout">
            <CategoryButton
                onClick={() => {category = 0}}
                label="Text"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                    <path fill="var(--red)" d="M254 52.8C249.3 40.3 237.3 32 224 32s-25.3 8.3-30 20.8L57.8 416H32c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32h-1.8l18-48H303.8l18 48H320c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H390.2L254 52.8zM279.8 304H168.2L224 155.1 279.8 304z"/>
                </svg>
            </CategoryButton>

            <CategoryButton
                onClick={() => {category = 1}}
                label="Data"
            >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path fill="var(--red)" d="M64 256V160H224v96H64zm0 64H224v96H64V320zm224 96V320H448v96H288zM448 256H288V160H448v96zM64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64z"/>
            </svg>
            </CategoryButton>

            {#each activePlugins as p, index}
                <PluginCategoryButton
                    onClick={function() {category = index + 2}}
                    label={p.categoryLabel}
                    svgContents={p.categoryIconSVG}
                />
            {/each}

            {#if userSettings.devModeEnabled}
                {#each devPlugins as devPlugin, index}
                    <PluginCategoryButton
                        onClick={function() {category = index + 2 + activePlugins.length}}
                        label={devPlugin.pluginCategoryLabel}
                        svgContents={'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!-- Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M288 0H160 128C110.3 0 96 14.3 96 32s14.3 32 32 32V196.8c0 11.8-3.3 23.5-9.5 33.5L10.3 406.2C3.6 417.2 0 429.7 0 442.6C0 480.9 31.1 512 69.4 512H378.6c38.3 0 69.4-31.1 69.4-69.4c0-12.8-3.6-25.4-10.3-36.4L329.5 230.4c-6.2-10.1-9.5-21.7-9.5-33.5V64c17.7 0 32-14.3 32-32s-14.3-32-32-32H288zM192 196.8V64h64V196.8c0 23.7 6.6 46.9 19 67.1L309.5 320h-171L173 263.9c12.4-20.2 19-43.4 19-67.1z" fill="var(--red)"/></svg>'}
                    />
                {/each}
            {/if}
        </div>
    {:else}
        <div on:click={() => {category = null}} class="backButtonContainer neuOutdentShadow">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><!--! Font Awesome Pro 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>
        </div>
        <div class="listFrame neuOutdentShadow">

            {#if category == 0}
                <ToolkitWidget 
                    label="Header"
                    objectType="header"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                        <path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zM336 152V256 360c0 13.3-10.7 24-24 24s-24-10.7-24-24V280H160l0 80c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-208c0-13.3 10.7-24 24-24s24 10.7 24 24v80H288V152c0-13.3 10.7-24 24-24s24 10.7 24 24z"/>
                    </svg>
                </ToolkitWidget>
                <ToolkitWidget
                    label="Paragraph"
                    objectType="paragraph"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                        <path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zM336 152V256 360c0 13.3-10.7 24-24 24s-24-10.7-24-24V280H160l0 80c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-208c0-13.3 10.7-24 24-24s24 10.7 24 24v80H288V152c0-13.3 10.7-24 24-24s24 10.7 24 24z"/>
                    </svg>
                </ToolkitWidget>
            {/if}

            {#if category == 1}
                <ToolkitWidget
                    label="Smart Table"
                    objectType="table"
                >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm88 64v64H64V96h88zm56 0h88v64H208V96zm240 0v64H360V96h88zM64 224h88v64H64V224zm232 0v64H208V224h88zm64 0h88v64H360V224zM152 352v64H64V352h88zm56 0h88v64H208V352zm240 0v64H360V352h88z"/></svg>
                </ToolkitWidget>

                <ToolkitWidget
                    label="Result"
                    objectType="result"
                >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M342.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 178.7l-57.4-57.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l80 80c12.5 12.5 32.8 12.5 45.3 0l160-160zm96 128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 402.7 54.6 297.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l256-256z"/></svg>
                </ToolkitWidget>
            {/if}

            {#each activePlugins as p, index}
                {#if category == index + 2}
                    {#each p.widgets as w}
                        <PluginToolkitWidget
                            label={w.widgetName}
                            objectType={`${p.pluginID}:${w.widgetID}`}
                            svgContents={w.widgetIconSVG}
                        />
                    {/each}
                {/if}
            {/each}

            {#each devPlugins as p, index}
                {#if category == index + 2 + activePlugins.length}
                    {#each p.widgets as w}
                        <PluginToolkitWidget
                            label={w.widgetName}
                            objectType={`(DEV)${p.path}|${w.widgetID}`}
                            svgContents={w.widgetIconSVG}
                        />
                    {/each}
                {/if}
            {/each}
        </div>
    {/if}
</main>



<style>
    main {
        height: 100%;
        width: 15vh;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    /* CATEGORY SELECTION */
    .categoryButtonLayout {
        width: 100%;
        height: 100%;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        animation: flyInFromLeft .5s cubic-bezier(0, 0, 0, .9) .1s both;

    }

    .listFrame {
        width: calc(100% - 2vh);
        flex: 1;
        margin-top: 1vh;
        margin-bottom: 1vh;

        border-radius: 2vh;

        display: flex;
        flex-direction: column;
        align-items: center;

        animation: flyInFromLeft .5s cubic-bezier(0, 0, 0, .9) .1s both;
    }

    .listFrame svg {

        height: 75%;

        fill: var(--red);
    }

    .backButtonContainer {
        cursor: pointer;

        border-radius: 1vh;
        margin-top: 1vh;
        width: calc(100% - 2vh);
        height: 4vh;

        display: grid;
        place-items: center;

        animation: flyInFromLeft .5s cubic-bezier(0, 0, 0, .9) both;

        transition: box-shadow .5s cubic-bezier(0, 0, 0, .9);
    }

    .backButtonContainer:hover {
        box-shadow: none;
    }

    .backButtonContainer svg {
        width: 2.5vh;
        height: 2.5vh;

        fill: var(--red);
    }
</style>