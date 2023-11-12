<script>
    export let projectData;
    export let devPluginObjects;
</script>



<main>
    <div class="frame neuIndentShadow">
        {#each Object.keys(projectData.pluginObjects) as plugin}
            <details class="plugin">
                <summary class="plugin">PLUGIN - {plugin}</summary>
                {#each Object.keys(projectData.pluginObjects[plugin]) as widgetType}
                    <details class="widgetType">
                        <summary class="widgetType">TYPE - {widgetType}</summary>
                        {#each projectData.pluginObjects[plugin][widgetType] || [] as w, index}
                            <details class="widget">
                                <summary class="widget">{widgetType}[{index}]</summary>
                                {#each Object.entries(w) as [key, val], dataIndex}
                                    <div
                                        class="dataRow"
                                        style="{dataIndex % 2 == 0 ? "background-color: var(--mainbg);" : ""}"
                                    >
                                        {#if key != "actionButtonColors"}
                                            {#if key != "params"}
                                                <p>{key}</p>
                                                <p style="text-align: right;">{typeof(val) != "object" ? val : JSON.stringify(val)}</p>
                                            {:else}
                                                <div class="paramsWrapper">
                                                    <div class="paramsHeader">Custom Params</div>
                                                    {#each Object.entries(val) as [pKey, pVal], paramIndex}
                                                        <div
                                                            class="dataRow"
                                                            style="{paramIndex % 2 == 0 ? "background-color: var(--mainbg);" : ""}"
                                                        >
                                                            <p>{pKey}</p>
                                                            <p style="text-align: right;">{typeof(pVal) != "object" ? pVal : JSON.stringify(pVal)}</p>
                                                        </div>
                                                    {/each}
                                                </div>
                                            {/if}
                                        {/if}
                                    </div>
                                {/each}
                            </details>
                        {/each}
                    </details>
                {/each}
            </details>
        {/each}

        <!-- DEV MODE PLUGINS -->
        <details class="plugin">
            <summary class="plugin">Dev Plugins</summary>
                {#each devPluginObjects || [] as w, index}
                    <details class="widget">
                        <summary class="widget">{w.widgetID}[{index}]</summary>
                        {#each Object.entries(w) as [key, val], dataIndex}
                            <div
                                class="dataRow"
                                style="{dataIndex % 2 == 0 ? "background-color: var(--mainbg);" : ""}"
                            >
                                {#if key != "actionButtonColors"}
                                    {#if key != "params"}
                                        <p>{key}</p>
                                        <p style="text-align: right;">{typeof(val) != "object" ? val : JSON.stringify(val)}</p>
                                    {:else}
                                        <div class="paramsWrapper">
                                            <div class="paramsHeader">Custom Params</div>
                                            {#each Object.entries(val) as [pKey, pVal], paramIndex}
                                                <div
                                                    class="dataRow"
                                                    style="{paramIndex % 2 == 0 ? "background-color: var(--mainbg);" : ""}"
                                                >
                                                    <p>{pKey}</p>
                                                    <p style="text-align: right;">{typeof(pVal) != "object" ? pVal : JSON.stringify(pVal)}</p>
                                                </div>
                                            {/each}
                                        </div>
                                    {/if}
                                {/if}
                            </div>
                        {/each}
                    </details>
                {/each}
        </details>
    </div>
</main>



<style>
    main {
        height: 100%;
        flex: .4;

        display: grid;
        place-items: center;

        font-size: 1.5vh;

        overflow: hidden;
    }

    .frame {
        width: calc(100% - 2vh);
        height: calc(100% - 2vh);

        border-radius: 2vh;

        background-color: var(--mainbg);

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;

        overflow: hidden;
        overflow-y: scroll;
    }

    .frame::-webkit-scrollbar {
        display: none;
    }

    details {
        margin-top: 2vh;
        width: calc(100% - 4vh);

        display: flex;
        flex-direction: column;
        align-items: center;

        overflow: hidden;
    }

    details.plugin {
        padding-bottom: 2vh;

        border-radius: 2vh;
        background-color: var(--shadow1);

        box-shadow: inset 0 0 0 .2vh var(--red);

        overflow: visible;
    }

    details.plugin:last-child {
        margin-bottom: 2vh;
    }

    details.widgetType {
        margin-left: 2vh;
        padding: 0;
        padding-bottom: 2vh;

        border-radius: 2vh;
        background-color: var(--mainbg);
        box-shadow: inset 0 0 0 .2vh var(--orange);
    }

    details.widget {
        margin-left: 2vh;
        padding: 0;
        padding-bottom: 2vh;

        border-radius: 2vh;
        background-color: var(--shadow1);
        box-shadow: inset 0 0 0 .2vh var(--velvet);
    }

    summary {
        cursor: pointer;

        color: var(--mainbg);
    }

    summary.plugin {
        padding-left: 2vh;

        height: 4vh;

        display: flex;
        align-items: center;

        background-color: var(--red);
        border-top-right-radius: 2vh;
        border-top-left-radius: 2vh;

    }

    summary.widgetType {
        padding-left: 2vh;

        width: calc(100% - 2vh);
        height: 3vh;

        display: flex;
        align-items: center;

        background-color: var(--orange);
        border-top-right-radius: 1vh;
        border-top-left-radius: 1vh;
    }

    summary.widget {
        padding-left: 2vh;

        width: calc(100% - 2vh);
        height: 3vh;

        display: flex;
        align-items: center;

        background-color: var(--velvet);
        border-top-right-radius: 1vh;
        border-top-left-radius: 1vh;
    }


    .dataRow {
        width: calc(100% - .4vh);
        min-height: 3vh;

        display: flex;
        align-items: center;
        justify-content: space-between;

        border-right: .2vh solid var(--velvet);
        border-left: .2vh solid var(--velvet);
    }

    .dataRow p {
        margin: .875vh;
        margin-left: 1vh;
        margin-right: 1vh;

        font-size: 1.25vh;
        font-weight: 600;

        color: var(--text1);
    }

    .paramsWrapper {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .paramsHeader {
        width: 100%;
        height: 3vh;
        
        display: grid;
        place-items: center;

        color: var(--text1);
        font-weight: 800;
    }

    .paramsWrapper .dataRow {
        width: 100%;
        border: none;
    }
    
</style>