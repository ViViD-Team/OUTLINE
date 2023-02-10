<script>
    import { onMount } from "svelte";
    import Node from "./Node.svelte"
    import NodeEditorSlot from "./NodeEditorSlot.svelte";

    const path = require("path")


    let viewX = 0, viewY = 0, viewZoom = 1;
    const zoomBounds = [.6, 3];

    let viewportHeight, viewportWidth;

    export let nodeData;
    export let tableRef;

    let context = {};
    
    //#region mouse

    let mouseDrag = {
        "ongoing": false,
        "start": {
            "x": 0,
            "y": 0,
        },
        "delta": {
            "x": 0,
            "y": 0,
        }
    }

    function mouseDown(event) {
        if (event.button != 1) return;
        mouseDrag.ongoing = true;
        mouseDrag.start.x = event.clientX;
        mouseDrag.start.y = event.clientY;
    }

    function mouseMove(event) {
        if (!mouseDrag.ongoing) return;
        mouseDrag.delta.x = event.clientX - mouseDrag.start.x;
        mouseDrag.delta.y = event.clientY - mouseDrag.start.y;
    }

    function mouseUp(event) {

        if (!mouseDrag.ongoing || event.button != 1) return;
        mouseDrag.ongoing = false
        viewX += mouseDrag.delta.x;
        viewY += mouseDrag.delta.y;
        mouseDrag.delta = {"x": 0, "y": 0};
    }

    function scroll(event) {
        let oldZoom = viewZoom
        viewZoom -= event.deltaY / 1000;
        viewZoom = Math.max(zoomBounds[0], Math.min(viewZoom, zoomBounds[1]));
        viewX = (viewX - viewportWidth/2) * viewZoom / oldZoom + (viewportWidth / 2)
        viewY = (viewY - viewportHeight/2) * viewZoom / oldZoom + (viewportHeight / 2)
    }

    //#endregion

    function makeid(length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    function getNewId() {
        let newId;
        do {
            newId = makeid(4);
        } while (context[newId] != undefined);
        context[newId] = "Pending...";
        return newId;
    }


    let nodeDrag = {
        "ongoing": false,
        "start": {
            "x": 0,
            "y": 0,
        },
        "delta": {
            "x": 0,
            "y": 0,
        },
        "layer": {
            "x": 0,
            "y": 0,
        },
        "objectInfo": {
            "type": "",
            "ID": 0,
            "width": 0,
            "height": 0,
        },
    }
    function clearNodeDrag() {
        nodeDrag = {
        "ongoing": false,
        "start": {
            "x": 0,
            "y": 0,
        },
        "delta": {
            "x": 0,
            "y": 0,
        },
        "layer": {
            "x": 0,
            "y": 0,
        },
        "objectInfo": {
            "type": "",
            "ID": 0,
        },
    }
    }
    function initNodeDrag(event, type, index) {
        clearNodeDrag();
        
        // Override default drag image
        let imageOverride = document.createElement("img");
        event.dataTransfer.setDragImage(imageOverride, 0, 0);

        // Append necessary info
        event.dataTransfer.setData("command", "moveNode");
        event.dataTransfer.setData("nodeID", index);
        event.dataTransfer.setData("nodeType", type);
        event.dataTransfer.setData("startX", event.clientX);
        event.dataTransfer.setData("startY", event.clientY);

        // Update nodeDrag
        nodeDrag.ongoing = true;
        nodeDrag.start.x = event.clientX;
        nodeDrag.start.y = event.clientY;
        nodeDrag.objectInfo.type = type;
        nodeDrag.objectInfo.ID = index;
    }
    function dragOver(event) {
        event.preventDefault();
        event.stopPropagation();

        let vhConverter = (window.innerHeight / 100 * 2 * viewZoom);

        if (nodeDrag.ongoing) {
            // Update objectDrag
            nodeDrag.delta.x = Math.round((event.clientX - nodeDrag.start.x) / vhConverter);
            nodeDrag.delta.y = Math.round((event.clientY - nodeDrag.start.y) / vhConverter);

            nodeDrag.layer.x = event.layerX;
            nodeDrag.layer.y = event.layerY;

            nodeData[nodeDrag.objectInfo.type][nodeDrag.objectInfo.ID].simX = nodeDrag.delta.x;
            nodeData[nodeDrag.objectInfo.type][nodeDrag.objectInfo.ID].simY = nodeDrag.delta.y;
        }
    }

    function drop(event) {
        event.stopPropagation();

        switch (event.dataTransfer.getData("command")) {
            case "createNode":
                try { 
                    const classRef = require(path.join(__dirname, "../src/_NodeResources/NodeTypes/") + event.dataTransfer.getData("nodeID"));
                    let nodeObject = new classRef([""], {});

                    let inputs = nodeObject.inputs.map(x => null);
                    let outputs = nodeObject.outputs.map(x => getNewId());

                    let newObj = {
                        "id": event.dataTransfer.getData("nodeID"),
                        "posX": Math.round((-viewX + event.layerX) / (window.innerHeight / 100 * 2 * viewZoom)),
                        "posY": Math.round((-viewY + event.layerY) / (window.innerHeight / 100 * 2 * viewZoom)),
                        "simX": 0,
                        "simY": 0,
                        "width": 6,
                        "reference": null,
                        "inputs": inputs,
                        "outputs": outputs,
                        "color": "var(--orange)"
                    };

                    nodeData[event.dataTransfer.getData("nodeType")].push(newObj);
                }
                catch (err) {
                    console.error(err);
                }
                break;
            
            case "moveNode":

                nodeData[event.dataTransfer.getData("nodeType")][event.dataTransfer.getData("nodeID")].posX += Math.round((event.clientX - event.dataTransfer.getData("startX")) / (window.innerHeight / 100 * 2 * viewZoom));
                nodeData[event.dataTransfer.getData("nodeType")][event.dataTransfer.getData("nodeID")].posY += Math.round((event.clientY - event.dataTransfer.getData("startY")) / (window.innerHeight / 100 * 2 * viewZoom));
            
                nodeData[event.dataTransfer.getData("nodeType")][event.dataTransfer.getData("nodeID")].simX = 0;
                nodeData[event.dataTransfer.getData("nodeType")][event.dataTransfer.getData("nodeID")].simY = 0;

                clearNodeDrag();

                recalculateConnections();

                break;
        }
    }

    // Generate Connection Display Objects
    let connections = [];
    onMount(() => {
        nodeData.operator.forEach((n) => {
            for (let i = 0; i < n.inputs.length; i++) {
                if (n.inputs[i] != null) {
                    addConnection(n, n.inputs[i], i);
                }
            }
        });

        connections = Object.assign([], connections);
    });

    function recalculateConnections() {
        connections = [];

        nodeData.operator.forEach((n) => {
            for (let i = 0; i < n.inputs.length; i++) {
                if (n.inputs[i] != null) {
                    addConnection(n, n.inputs[i], i);
                }
            }
        });

        connections = Object.assign([], connections);
    }

    function addConnection(node, output, index) {
        let destData = context[output].superNode.rawNodeData;
        let newConnection = {
            "posX": (node.posX + node.simX) + .75,
            "posY": (node.posY + node.simY) + (1 + (index + 1)*1.5),
            "destX": (destData.posX + destData.simX) + destData.width - .75,
            "destY": (destData.posY + destData.simY) + (1 + (destData.outputs.indexOf(output) + 1) * 1.5),
            "width": (destData.posX + destData.width - .75) - (node.posX + .75),
            "height": (destData.posY + (1 + (destData.outputs.indexOf(output) + 1) * 1.5)) - (node.posY + (1 + (index + 1)*1.5)),
            "originColor": node.color,
            "destColor": destData.color
        };

        connections.push(newConnection);

        console.log(newConnection, destData);

        connections = Object.assign([], connections);
    }

    function mutateConnection(connection, io, index, newX, newY, nodeWidth) {
        if (!io) {
            let oldPosX = connection.posX;
            let oldPosY = connection.posY;

            connection.posX = newX + .75;
            connection.posY = newY + (1 + (index + 1) * 1.5);

            connection.width = (connection.width - (oldPosX - connection.posX));
            connection.height = (connection.height - (oldPosY - connection.posY));
        }
        else {
            let oldDestX = connection.destX;
            let oldDestY = connection.destY;

            connection.destX = newX + nodeWidth - .75;
            connection.destY = newY + (1 + (index + 1) * 1.5);

            connection.width = (connection.width - (oldDestX - connection.destX));
            connection.height = (connection.height - (oldDestY - connection.destY));
        }

        /* let newConnection = {
            "posX": node.posX + .75,
            "posY": node.posY + (1 + (index + 1)*1.5),
            "destX": destData.posX + destData.width - .75,
            "destY": destData.posY + (1 + (destData.outputs.indexOf(input) + 1) * 1.5),
            "width": (destData.posX + destData.width - .75) - (node.posX + .75),
            "height": (destData.posY + (1 + (destData.outputs.indexOf(input) + 1) * 1.5)) - (node.posY + (1 + (index + 1)*1.5)),
            "originColor": node.color,
            "destColor": destData.color
        }; */

        console.log(newConnection, destData);

        connections = Object.assign([], connections);
    }

    function deleteNode(type, index) {
        nodeData[type].splice(index, 1);
        nodeData[type] = Object.assign([], nodeData[type]);

        recalculateConnections();
    }

</script>



<main>
    <div class="frame neuIndentShadow"
        bind:offsetHeight="{viewportHeight}"
        bind:offsetWidth="{viewportWidth}"

        on:mousedown="{mouseDown}"
        on:mousemove="{mouseMove}"
        on:mouseup="{mouseUp}"
        on:mouseleave="{mouseUp}"
        on:mousewheel="{scroll}"

        on:drop={drop}
        on:dragover={dragOver}
    >
        <div class="crossBackground" style="
            background-position-x: {viewX + mouseDrag.delta.x}px;
            background-position-y: {viewY + mouseDrag.delta.y}px;
            background-size: {2 * viewZoom}vh;
        ">

        {#each nodeData.operator as node, index}
            <Node
                bind:nodeObject={node.reference}

                onDrag={(event) => initNodeDrag(event, "operator", index)}
                onDelete={() => {deleteNode("operator", index)}}

                posX={node.posX}
                posY={node.posY}
                offX={(viewX + mouseDrag.delta.x) / window.innerHeight * 50}
                offY={(viewY + mouseDrag.delta.y) / window.innerHeight * 50}
                simX={node.simX}
                simY={node.simY}
                zoom={viewZoom}

                nodeData={node}
                context={context}

                connectionCallback={addConnection}
            />

            {#each connections as c}
                    <div style="
                        left: {2 * (c.posX * viewZoom + (viewX + mouseDrag.delta.x) / window.innerHeight * 50)}vh;
                        top: {2 * (c.posY * viewZoom + (viewY + mouseDrag.delta.y) / window.innerHeight * 50)}vh;
                    
                        width: {Math.abs(c.width) * viewZoom * 2}vh;
                        height: {Math.abs(c.height) * viewZoom * 2}vh;

                        transform:  translate({c.posX > c.destX ? "-100%" : "0"},
                            {c.posY > c.destY ? "-100%" : "0"}) scale(1,  {c.destY > c.posY ? "-" : ""}1);


                    " class="inputFlowContainer">
                        <svg style="
                            width: 100%; height: calc(100% + {viewZoom}px);
                            transform: translateY(-{.5 * viewZoom}px);
                        " preserveAspectRatio="none" viewBox="0 0 100 102" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 1C47.3934 1 52.6066 101 100 101" stroke="url(#paint0_linear_102_1243)" stroke-width="{2*viewZoom}"/>
                            <defs>
                                <linearGradient id="paint0_linear_102_1243" x1="0" y1="1" x2="103.056" y2="4.25514" gradientUnits="userSpaceOnUse">
                                <stop stop-color="{c.originColor}"/>
                                <stop offset="1" stop-color="{c.destColor}"/>
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
            {/each}
        {/each}
        

    </div>

    <div class="nodePickerFrame neuOutdentShadow">
        <div class="nodePickerHeader">
            <div class="nodePickerIcon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M7.724 65.49C13.36 55.11 21.79 46.47 32 40.56C39.63 36.15 48.25 33.26 57.46 32.33C59.61 32.11 61.79 32 64 32H448C483.3 32 512 60.65 512 96V416C512 451.3 483.3 480 448 480H64C28.65 480 0 451.3 0 416V96C0 93.79 .112 91.61 .3306 89.46C1.204 80.85 3.784 72.75 7.724 65.49V65.49zM48 416C48 424.8 55.16 432 64 432H448C456.8 432 464 424.8 464 416V224H48V416z"/></svg>            
            </div>
            <div class="nodePickerTitle">
                <h2>Node Picker</h2>
            </div>
        </div>
        <div class="nodePickerContents">
            <div class="nodePickerGroupTitle">
                <h2>Math - Basic</h2>
            </div>

            <NodeEditorSlot
                id="Sum"
                type="operator"
            />
        </div>
    </div>
</main>



<style>
    main {
        width: 100%;
        flex: 1;

        display: grid;
        place-items: center;

        animation: mainScale .5s cubic-bezier(0, 0, 0, .9) backwards;
    }

    @keyframes mainScale {
        from {
            flex: 0;
        }
    }

    .frame {
        position: relative;

        width: calc(100% - 2vh);
        height: calc(100% - 2vh);

        border-radius: 2vh;

        background-color: var(--white);

        overflow: hidden;
    }

    .crossBackground {
        position: absolute;
        width: 100%;
        height: 100%;

        background-image: url("../svg/Background_Cross.svg");
        background-repeat: repeat;
    }

    .nodePickerFrame {
        position: absolute;

        left: 2vh;
        top: 50%;
        transform: translateY(-50%);

        width: 6vh;
        height: 6vh;

        background-color: var(--white);

        border-radius: 3vh;

        animation: nodePickerAppear .5s cubic-bezier(0, 0, 0, .9) both .5s;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        overflow: none;

        transition: width .5s cubic-bezier(0, 0, 0, .9),
                    height .5s cubic-bezier(0, 0, 0, .9);
    }

    @keyframes nodePickerAppear {
        from {
            opacity: 0;
        }
    }

    .nodePickerFrame:hover {
        width: 24vh;
        height: calc(100% - 4vh);
    }

    .nodePickerHeader {
        position: relative;

        width: 100%;
        flex: 1;

        display: flex;
        
    }

    .nodePickerHeader .nodePickerIcon {
        height: 100%;
        flex: 1;

        transition: margin-left .5s cubic-bezier(0, 0, 0, .9);

        display: grid;
        place-items: center;
    }

    .nodePickerFrame:hover .nodePickerIcon {
        margin-left: 2vh;
    }

    .nodePickerIcon svg {
        height: 40%;

        fill: var(--blue);
    }

    .nodePickerTitle {
        height: 100%;
        flex: 0;

        overflow: hidden;

        transition: flex .5s cubic-bezier(0, 0, 0, .9);

        display: flex;
        align-items: center;
    }

    .nodePickerTitle h2 {
        white-space: nowrap;

        opacity: 0;

        width: 100%;

        font-size: 1.5vh;

        color: var(--blue);

        transition: opacity .5s cubic-bezier(0, 0, 0, .9);
    }

    .nodePickerFrame:hover .nodePickerTitle h2 {
        opacity: 1;
    }

    .nodePickerFrame:hover .nodePickerTitle {
        flex: 4;
    }

    .nodePickerContents {
        width: 100%;
        flex: 0;

        opacity: 0;

        display: flex;
        flex-direction: column;

        overflow: hidden;
        overflow-y: scroll;

        transition: flex .5s cubic-bezier(0, 0, 0, .9), opacity .1s;
    }

    .nodePickerContents::-webkit-scrollbar {
        display: none;
    }

    .nodePickerFrame:hover .nodePickerContents {
        flex: 5;

        opacity: 1;

        transition: flex .5s cubic-bezier(0, 0, 0, .9), opacity .5s .5s;
    }


    .nodePickerGroupTitle {
        width: 100%;
        height: 2vh;

        display: grid;
        place-items: center;
    }

    .nodePickerGroupTitle h2 {
        font-size: 1.2vh;
        color: var(--orange);
        font-weight: 500;
    }


    .inputFlowContainer {
        position: absolute;

        overflow: visible;
    }

    .inputFlowContainer svg {
        overflow: visible;
    }

</style>