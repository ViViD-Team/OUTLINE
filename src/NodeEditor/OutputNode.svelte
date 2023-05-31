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

    export let tableRef;
    export let tableData;

    let dragState = null;

/*     //5000 iq
    export let superNode = this;
    export let rawNodeData = nodeData; */
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
        //event.stopPropagation();
    }

    export let connectionCallback;

    function handleConnect(event, index) {
        event.preventDefault();
        event.stopPropagation();

        console.log("connected");
        switch (event.dataTransfer.getData("command")) {
            case "connectNode":
                let removeOld = nodeData.input != null;
                let outputId = event.dataTransfer.getData("outputID"); 

                nodeData.input = outputId;
                connectionCallback(nodeData, outputId, index, removeOld);

                break;
        }

        process();
    }


    export let onDrag;
    export let onDelete;

    function drag(event) {
        onDrag(event);
    }

    function handleDelete() {
        try {
            delete context[outputID];
        }
        catch (err) {console.log(err)}
        onDelete();
    }

    // THIS IS SPECIFIC FOR INPUT NODES
    // As they only have one output tether the class can be simulated

    /* export let outputID;
    onMount(() => {

        console.log("Input Node mounted with tether ID " + outputID);

        let simObject = {
            "process": process,
            "superNode": {
                "rawNodeData": Object.assign(nodeData, {"outputs": [outputID]}),
            },
        }

        context[outputID] = simObject;

        console.log(context[outputID]);
    }); */


    export async function process() {
        context[nodeData.input].process()
            .then((value) => {
                tableData.cellContents[nodeData.selectedCol][nodeData.selectedRow] = value;
                tableData.reference.rerender();
            })
            .catch((err) => {console.error(err)});
    }

</script>



<main on:mousedown={(event) => {event.stopPropagation();}} class="neuOutdentShadowRim" style="
    left: {((posX + simX) * zoom + offX) * 2}vh;
    top: {((posY + simY) * zoom + offY) * 2}vh;

    width: {2 * nodeData.width * zoom}vh;
    height: {zoom * 12}vh;

    border-radius: {zoom}vh;
">
    <div
        class="titleBar"
    
        draggable="true"
        on:dragstart="{drag}"
        on:dragend="{() => {
            nodeData.posX += nodeData.simX;
            nodeData.posY += nodeData.simY;

            nodeData.simX = 0;
            nodeData.simY = 0;
            clearDrag();
        }}"

        style="
            height: {3*zoom}vh;
            background-color: {nodeData.color};
    ">
        <h1 style="
            font-size: {1.5*zoom}vh;
            margin-left: {zoom}vh;
        ">Output</h1>
    </div>
    <div class="contents">
        <div class="tetherContainer" style="
            height: {4*zoom}vh;
        ">
            <div style="padding-top: {.5*zoom}vh;" class="inputs">
                <div style="
                    height: {3*zoom}vh;
                " 
                    class="inputTether"
                    on:dragover="{dragOver}"
                    on:drop="{(event) => {handleConnect(event, 0)}}"
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
                        ">Data</p>
                    </div>
                </div>
            </div>
    
    
            <div style="padding-top: {.5*zoom}vh;" class="outputs">
    
                
    
            </div>
        </div>

        <div class="settingsContainer">
            <div class="setting">
                <h2 style="
                    font-size: {zoom}vh;
                    margin-left: {zoom}vh;
                    margin-right: {.5*zoom}vh;
                    color: {nodeData.color};
                ">Column</h2>
                <input type="number" name="col" min="0" bind:value={nodeData.selectedCol} style="
                    width: {4*zoom}vh;
                    height: {1.5*zoom}vh;
                    margin-right: {zoom}vh;
                    font-size: {zoom}vh;
                    color: {nodeData.textcolor};
                    border-radius: {.5*zoom}vh;
                ">
            </div>
            <div class="setting">
                <h2 style="
                    font-size: {zoom}vh;
                    margin-left: {zoom}vh;
                    margin-right: {.5*zoom}vh;
                    color: {nodeData.color};
                ">Row</h2>
                <input type="number" name="row" min="0" bind:value={nodeData.selectedRow} style="
                    width: {4*zoom}vh;
                    height: {1.5*zoom}vh;
                    margin-right: {zoom}vh;
                    font-size: {zoom}vh;
                    color: {nodeData.textcolor};
                    border-radius: {.5*zoom}vh;
                ">
            </div>
            
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

    .titleBar h1 {
        color: var(--mainbg);
        font-weight: 600;
    }



    .contents {
        width: 100%;
        flex: 1;

        display: flex;
        flex-direction: column;
    }

    .tetherContainer {
        width: 100%;
        display: flex;
    }

    .settingsContainer {
        width: 100%;
        flex: 1;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .settingsContainer .setting {
        width: 100%;
        flex: 1;

        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .setting input {
        border: none;
        background-color: var(--textbg1);
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