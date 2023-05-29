<script>
    import { onMount } from "svelte";
    const path = require("path");


    export let posX = 0;
    export let posY = 0;
    export let offX = 0;
    export let offY = 0;
    export let simX = 0;
    export let simY = 0;
    export let zoom = 1;

    export let nodeData;
    export let context;

    export let nodeObject;

    let renderReady = false;
    let error = false;

    onMount(() => {
        // Load Node on the fly and subscribe to outputs
        try {
            console.log(context)
            const classRef = require(path.join(__dirname, "../src/_NodeResources/NodeTypes/") + nodeData.id);
            nodeObject = new classRef(nodeData.outputs, context, nodeData);

            // Restore Input Connections
            for (let i = 0; i < nodeData.inputs.length; i++) {
                nodeObject.inputs[i].connect(nodeData.inputs[i]);
            }

            console.log("Node " +  nodeData.id + " subscribed outputs " + nodeObject.outputs, context);
            renderReady = true;
        }
        catch (err) {
            error = true;
            console.error(err);
        }
    });

    let dragState = null;

    function initConnectionDrag(event, id, index) {
        // Clear default drag image
        let imageOverride = document.createElement("img");
        event.dataTransfer.setDragImage(imageOverride, 0, 0);

        event.dataTransfer.setData("command", "connectNode");
        event.dataTransfer.setData("outputID", id);

        dragState = index;
    }

    function clearDrag() {
        dragState = null;
    }

    function dragOver(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    export let connectionCallback;

    function handleConnect(event, index) {
        event.preventDefault();
        event.stopPropagation();

        console.log("connected");
        switch (event.dataTransfer.getData("command")) {
            case "connectNode":
                let removeOld = nodeData.inputs[index] != null;
                let outputId = event.dataTransfer.getData("outputID");

                nodeObject.inputs[index].connect(outputId);

                nodeData.inputs[index] = outputId;
                connectionCallback(nodeData, outputId, index, removeOld);

                break;
        }
    }


    export let onDrag;
    export let onDelete;

    function drag(event) {
        onDrag(event);
    }

    function handleDelete() {
        for (let i = 0; i < nodeData.outputs.length; i++) {
            nodeObject.outputs[i].dismount();
        }
        onDelete();
    }
</script>


{#if nodeObject !== null && nodeObject !== undefined && renderReady && !error}
    <main on:mousedown={(event) => {event.stopPropagation();}} class="neuOutdentShadowRim" style="
        left: {((posX + simX) * zoom + offX) * 2}vh;
        top: {((posY + simY) * zoom + offY) * 2}vh;

        width: {2 * nodeData.width * zoom}vh;
        height: {zoom * 4 + 3 * zoom * Math.max(nodeObject.inputs.length, nodeObject.outputs.length)}vh;

        border-radius: {zoom}vh;
    ">
        <div
            class="titleBar"
        
            draggable="true"
            on:dragstart="{drag}"

            style="
                height: {3*zoom}vh;
                background-color: {nodeData.color};
        ">
            <h1 style="
                font-size: {1.5*zoom}vh;
                margin-left: {zoom}vh;
            ">{nodeObject.title}</h1>
        </div>
        <div class="contents">
            <div style="padding-top: {.5*zoom}vh;" class="inputs">
                {#each nodeObject.inputs as input, index}
                    <div style="
                        height: {3*zoom}vh;
                    " 
                        class="inputTether"
                        on:dragover="{dragOver}"
                        on:drop="{(event) => {handleConnect(event, index)}}"
                    >
                        <div style="width: {3*zoom}vh;" class="inputTetherCircleContainer">
                            <svg style="width: {2*zoom}vh; height: {2*zoom}vh;" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="2.5" y="2.5" width="10" height="10" rx="5" stroke="#999999" stroke-dasharray="2 2"/>
                                <rect x="5" y="5" width="5" height="5" rx="2.5" fill="{nodeData.color}"/>
                            </svg>
                        </div>
                        <div class="inputTetherLabelContainer">
                            <p style="
                                font-size: {zoom}vh;
                                color: {nodeData.color};
                            ">{input.label}</p>
                        </div>
                    </div>
                {/each}
            </div>


            <div style="padding-top: {.5*zoom}vh;" class="outputs">
                {#each nodeObject.outputs as output, index}
                    <div style="
                        height: {3*zoom}vh;
                    "
                        class="outputTether"

                        draggable="true"
                        on:dragstart={(event) => initConnectionDrag(event, output.id, index)}
                        on:dragend={clearDrag}
                    >
                        <div style="width: {3*zoom}vh;" class="outputTetherCircleContainer">
                            <svg style="
                                width: {2*zoom}vh;
                                height: {2*zoom}vh;
                                {dragState === index ? "transform: scale(1.5) rotate(360deg);" : ""}
                                transition: transform .5s cubic-bezier(0, 0, 0, .9);
                            " viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="2.5" y="2.5" width="10" height="10" rx="5" stroke="#999999" stroke-dasharray="2 2"/>
                                <rect x="5" y="5" width="5" height="5" rx="2.5" fill="{nodeData.color}"/>
                            </svg>
                        </div>
                        <div class="outputTetherLabelContainer">
                            <p style="
                                font-size: {zoom}vh;
                                color: {nodeData.color};
                            ">{output.label}</p>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    

        <div
            class="deleteAction"
            
            on:click={handleDelete}
            
            style="
                width: {3*zoom}vh;
                height: {3*zoom}vh;"
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Pro 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg>
        </div>
    
    </main>
{/if}
{#if error}
<main on:mousedown={(event) => {event.stopPropagation();}} class="neuOutdentShadowRim" style="
    left: {((posX + simX) * zoom + offX) * 2}vh;
    top: {((posY + simY) * zoom + offY) * 2}vh;

    width: {2 * nodeData.width * zoom}vh;
    height: {zoom * 4 + 3 * zoom * 2}vh;

    border-radius: {zoom}vh;
">
    <div
        class="titleBar"
    
        draggable="true"
        on:dragstart="{drag}"

        style="
            height: {3*zoom}vh;
            background-color: var(--red);
    ">
        <svg style="
            height: {1.5*zoom}vh;
            margin-left: {zoom}vh;
        " xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/></svg>
        <h1 style="
            font-size: {1.5*zoom}vh;
            margin-left: {zoom}vh;
        ">Error</h1>
    </div>
    <div style="align-items: center; justify-content: center;" class="contents">
        <p style="
            font-size: {zoom}vh;
        ">Node resource could not be located.</p>
    </div>


    <div
        class="deleteAction"
        
        on:click={handleDelete}
        
        style="
            width: {3*zoom}vh;
            height: {3*zoom}vh;"
    >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Pro 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg>
    </div>

</main>
{/if}


<style>
    main {
        position: absolute;

        background-color: var(--mainbg);

        overflow: hidden;

        display: flex;
        flex-direction: column;
    }

    .titleBar {
        width: 100%;

        /* background-color: var(--orange); */

        display: flex;
        align-items: center;
        justify-content: flex-start;
    }

    .titleBar svg {
        fill: var(--mainbg);
    }

    .titleBar h1 {
        color: var(--mainbg);
        font-weight: 600;
    }



    .contents {
        width: 100%;
        flex: 1;

        display: flex;
    }

    .contents p {
        color: var(--red);
        width: 80%;
        text-align: center;
        font-weight: 500;
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

        background-color: var(--mainbg);
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
        /* color: var(--orange); */

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

        cursor: pointer;
        
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
        /* color: var(--orange); */

        white-space: nowrap;
        font-weight: 800;
    }



    .deleteAction {
        cursor: pointer;

        position: absolute;
        top: 0;
        right: 0;

        transform: translate(100%, -100%);

        transition: transform .25s cubic-bezier(0, 0, 0, .9);

        display: grid;
        place-items: center;
    }

    main:hover .deleteAction {
        transform: translate(0, 0);
    }

    .deleteAction:hover .deleteAction {
        transform: translate(0, 0);
    }

    .deleteAction svg {
        fill: var(--mainbg);
        width: 50%;
    }
</style>