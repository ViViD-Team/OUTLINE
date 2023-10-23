<script>
    export let projectData;

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
                                        style="{dataIndex % 2 == 0 ? "background-color: var(--shadow2);" : ""}"
                                    >
                                        {#if key != "params"}
                                            <p>{key}</p>
                                            <p style="text-align: right;">{typeof(val) != "object" ? val : JSON.stringify(val)}</p>
                                        {:else}
                                            <div class="paramsWrapper">
                                                <div class="paramsHeader">Custom Params</div>
                                                {#each Object.entries(val) as [pKey, pVal]}
                                                    <div
                                                        class="dataRow"
                                                        style="{dataIndex % 2 == 0 ? "background-color: var(--shadow2);" : ""}"
                                                    >
                                                        <p>{pKey}</p>
                                                        <p style="text-align: right;">{typeof(pVal) != "object" ? pVal : JSON.stringify(pVal)}</p>
                                                    </div>
                                                {/each}
                                            </div>
                                        {/if}
                                    </div>
                                {/each}
                            </details>
                        {/each}
                    </details>
                {/each}
            </details>
        {/each}
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
        background-color: var(--shadow2);
    }

    details.widget {
        margin-left: 2vh;
        padding: 0;
        padding-bottom: 2vh;

        border-radius: 2vh;
        background-color: var(--shadow1);
    }

    summary {
        cursor: pointer;
    }

    summary.plugin {
        padding-left: 2vh;

        height: 4vh;

        display: flex;
        align-items: center;

        background-color: var(--red);
        border-top-right-radius: 2vh;
        border-top-left-radius: 2vh;

        color: var(--text1);

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

        color: var(--text1);
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

        color: var(--text1);
    }


    .dataRow {
        width: 100%;
        min-height: 3vh;

        display: flex;
        align-items: center;
        justify-content: space-between;
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
    
</style>