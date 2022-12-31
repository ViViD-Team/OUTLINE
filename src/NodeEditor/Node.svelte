<script>
    import { onMount } from "svelte";
    const path = require("path");


    export let posX = 0;
    export let posY = 0;
    export let offX = 0;
    export let offY = 0;
    export let zoom = 1;

    export let nodeData;
    export let context;

    export let nodeObject;

    onMount(() => {
        try {
            console.log(context)
            const classRef = require(path.join(__dirname, "../src/_NodeResources/NodeTypes/") + nodeData.id);
            nodeObject = new classRef(nodeData.outputs, context, nodeData);

            // Restore Input Connections
            for (let i = 0; i < nodeData.inputs.length; i++) {
                nodeObject.inputs[i].connect(nodeData.inputs[i]);
            }

            console.log("Node " +  nodeData.id + " subscribed outputs " + nodeObject.outputs, context);
        }
        catch (err) {
            console.error(err);
        }
    });
</script>


{#if nodeObject !== null && nodeObject !== undefined}
    <main class="neuOutdentShadowRim" style="
        left: {(posX * zoom + offX) * 2}vh;
        top: {(posY * zoom + offY) * 2}vh;

        width: {2 * nodeData.width * zoom}vh;
        height: {zoom * 4 + 3 * zoom * Math.max(nodeObject.inputs.length, nodeObject.outputs.length)}vh;

        border-radius: {zoom}vh;
    ">
        <div class="titleBar" style="
            height: {3*zoom}vh;
        ">
            <h1 style="
                font-size: {1.5*zoom}vh;
                margin-left: {zoom}vh;
            ">{nodeObject.title}</h1>
        </div>
        <div class="contents">
            <div style="padding-top: {.5*zoom}vh;" class="inputs">
                {#each nodeObject.inputs as input}
                    <div style="
                        height: {3*zoom}vh;
                    " class="inputTether">
                        <div style="width: {3*zoom}vh;" class="inputTetherCircleContainer">
                            <svg style="width: {2*zoom}vh; height: {2*zoom}vh;" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="2.5" y="2.5" width="10" height="10" rx="5" stroke="#999999" stroke-dasharray="2 2"/>
                                <rect x="5" y="5" width="5" height="5" rx="2.5" fill="#DB6239"/>
                            </svg>
                        </div>
                        <div class="inputTetherLabelContainer">
                            <p style="
                                font-size: {zoom}vh;
                            ">{input.label}</p>
                        </div>
                    </div>
                {/each}
            </div>


            <div style="padding-top: {.5*zoom}vh;" class="outputs">
                {#each nodeObject.outputs as output}
                    <div style="
                        height: {3*zoom}vh;
                    " class="outputTether">
                        <div style="width: {3*zoom}vh;" class="outputTetherCircleContainer">
                            <svg style="width: {2*zoom}vh; height: {2*zoom}vh;" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="2.5" y="2.5" width="10" height="10" rx="5" stroke="#999999" stroke-dasharray="2 2"/>
                                <rect x="5" y="5" width="5" height="5" rx="2.5" fill="#DB6239"/>
                            </svg>
                        </div>
                        <div class="outputTetherLabelContainer">
                            <p style="
                                font-size: {zoom}vh;
                            ">{output.label}</p>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </main>
{/if}


<style>
    main {
        position: absolute;

        background-color: var(--white);

        overflow: hidden;

        display: flex;
        flex-direction: column;
    }

    .titleBar {
        width: 100%;

        background-color: var(--orange);

        display: flex;
        align-items: center;
        justify-content: flex-start;
    }

    .titleBar h1 {
        color: var(--white);
        font-weight: 600;
    }



    .contents {
        width: 100%;
        flex: 1;

        display: flex;
    }


    .inputs {
        height: 100%;
        flex: 1;

        display: flex;
        flex-direction: column;
    }

    .inputTether {
        width: 100%;
        
        display: flex;
    }

    .inputTetherCircleContainer {
        height: 100%;

        display: grid;
        place-items: center;
    }

    .inputTetherLabelContainer {
        height: 100%;
        flex: 1;

        display: flex;
        align-items: center;
    }

    .inputTetherLabelContainer p {
        color: var(--orange);

        white-space: nowrap;
        font-weight: 800;
    }



    .outputs {
        height: 100%;
        flex: 1;

        display: flex;
        flex-direction: column;
    }

    .outputTether {
        width: 100%;
        
        display: flex;
        flex-direction: row-reverse;
    }

    .outputTetherCircleContainer {
        height: 100%;

        display: grid;
        place-items: center;
    }

    .outputTetherLabelContainer {
        height: 100%;
        flex: 1;

        display: flex;
        align-items: center;
        justify-content: flex-end;
    }

    .outputTetherLabelContainer p {
        color: var(--orange);

        white-space: nowrap;
        font-weight: 800;
    }
</style>