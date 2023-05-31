<script>
    import { onMount } from "svelte";

    import Node from "./Node.svelte"
    import InputNode from "./InputNode.svelte";
    import OutputNode from "./OutputNode.svelte";

    import NodePickerSlot from "./NodePickerSlot.svelte";
    import LiteralNode from "./LiteralNode.svelte";

    const path = require("path");
    const fs = require("fs");


    let viewX = 0, viewY = 0, viewZoom = 1;
    const zoomBounds = [.3, 5];

    let viewportHeight, viewportWidth, viewportTop, viewportLeft;
    let viewportRef;

    export let nodeData;
    export let tableRef;
    export let tableData;

    export let userSettings;

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
        if (userSettings.preferred_navigation_mb !== 3 && event.button != userSettings.preferred_navigation_mb) return;
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
        if (!mouseDrag.ongoing || event.button != userSettings.preferred_navigation_mb && userSettings.preferred_navigation_mb !== 3) return;
        mouseDrag.ongoing = false
        viewX += mouseDrag.delta.x;
        viewY += mouseDrag.delta.y;
        mouseDrag.delta = {"x": 0, "y": 0};
    }

    function scroll(event) {
        let oldZoom = viewZoom
        viewZoom -= event.deltaY / 1000;
        viewZoom = Math.max(zoomBounds[0], Math.min(viewZoom, zoomBounds[1]));
        if (viewZoom == zoomBounds[0] || viewZoom == zoomBounds[1]) {
            viewZoom = oldZoom
            return
        }
        viewX = (viewX - viewportWidth/2) * viewZoom / oldZoom + (viewportWidth / 2) + (((event.clientX - viewportRef.offsetLeft) - (viewportWidth / 2)) * Math.sign(event.deltaY)) / oldZoom / 10
        viewY = (viewY - viewportHeight/2) * viewZoom / oldZoom + (viewportHeight / 2) + (((event.clientY - viewportRef.offsetTop) - (viewportHeight / 2)) * Math.sign(event.deltaY)) / oldZoom / 10
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

            connections.forEach((c) => {
                c.update();
            });
        }

        if (simConnection.shown) {
            simConnection.update(event);
            simConnection = Object.assign({}, simConnection);
        }
    }

    function drop(event) {
        event.stopPropagation();

        switch (event.dataTransfer.getData("command")) {
            case "createNode":
                switch (event.dataTransfer.getData("nodeType")) {
                    case "input": {
                        let newObj = {
                            "posX": Math.round((-viewX + event.layerX) / (window.innerHeight / 100 * 2 * viewZoom)),
                            "posY": Math.round((-viewY + event.layerY) / (window.innerHeight / 100 * 2 * viewZoom)),
                            "simX": 0,
                            "simY": 0,
                            "width": 6,
                            "outputID": getNewId(),
                            "color": "var(--red)",
                            "textcolor": "var(--text1)",
                            "selectedCol": 0,
                            "selectedRow": 0,
                        };

                        nodeData[event.dataTransfer.getData("nodeType")].push(newObj);
                        return;
                    }

                    case "output": {
                        let newObj = {
                            "posX": Math.round((-viewX + event.layerX) / (window.innerHeight / 100 * 2 * viewZoom)),
                            "posY": Math.round((-viewY + event.layerY) / (window.innerHeight / 100 * 2 * viewZoom)),
                            "simX": 0,
                            "simY": 0,
                            "width": 6,
                            "input": null,
                            "color": "var(--purple)",
                            "textcolor": "var(--text1)",
                            "selectedCol": 0,
                            "selectedRow": 0,
                        };

                        nodeData[event.dataTransfer.getData("nodeType")].push(newObj);
                        nodeData[event.dataTransfer.getData("nodeType")] = Object.assign([], nodeData[event.dataTransfer.getData("nodeType")]);
                        return;
                    }

                    case "literal": {
                        let newObj = {
                            "posX": Math.round((-viewX + event.layerX) / (window.innerHeight / 100 * 2 * viewZoom)),
                            "posY": Math.round((-viewY + event.layerY) / (window.innerHeight / 100 * 2 * viewZoom)),
                            "simX": 0,
                            "simY": 0,
                            "width": 6,
                            "outputID": getNewId(),
                            "color": "var(--velvet)",
                            "textcolor": "var(--text1)",
                            "id": event.dataTransfer.getData("nodeID"),
                            "value": undefined,
                        };

                        nodeData[event.dataTransfer.getData("nodeType")].push(newObj);
                        return;
                    }

                    default:
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
                            let newObj = {
                                "id": event.dataTransfer.getData("nodeID"),
                                "posX": Math.round((-viewX + event.layerX) / (window.innerHeight / 100 * 2 * viewZoom)),
                                "posY": Math.round((-viewY + event.layerY) / (window.innerHeight / 100 * 2 * viewZoom)),
                                "simX": 0,
                                "simY": 0,
                                "width": 6,
                                "reference": null,
                                "inputs": [],
                                "outputs": [],
                                "color": "var(--red)"
                            };

                            nodeData[event.dataTransfer.getData("nodeType")].push(newObj);
                            nodeData[event.dataTransfer.getData("nodeType")] = Object.assign([], nodeData[event.dataTransfer.getData("nodeType")]);
                            console.error(err);
                        }
                        return;
                }
            
            case "moveNode":

                nodeData[event.dataTransfer.getData("nodeType")][event.dataTransfer.getData("nodeID")].posX += Math.round((event.clientX - event.dataTransfer.getData("startX")) / (window.innerHeight / 100 * 2 * viewZoom));
                nodeData[event.dataTransfer.getData("nodeType")][event.dataTransfer.getData("nodeID")].posY += Math.round((event.clientY - event.dataTransfer.getData("startY")) / (window.innerHeight / 100 * 2 * viewZoom));
            
                nodeData[event.dataTransfer.getData("nodeType")][event.dataTransfer.getData("nodeID")].simX = 0;
                nodeData[event.dataTransfer.getData("nodeType")][event.dataTransfer.getData("nodeID")].simY = 0;

                clearNodeDrag();

                //recalculateConnections();

                break;
        }
    }

    // Generate Connection Display Objects
    let connections = [];
    onMount(() => {
        console.log(nodeData);

        recalculateConnections();

        constructNodePicker();
    });

    let nodeConfig = {};
    let nodeCategories = [];
    async function constructNodePicker() {
        fs.readFile(path.join(__dirname, "../src/config/nodesConfig.json"), (err, file) => {
            if (err) return;
            nodeConfig = JSON.parse(file);
            nodeCategories = Object.keys(nodeConfig);
        });
    }

    let simConnection = {
        "shown": false,
        "node": null,
        "index": 0,

        "destX": 0,
        "destY": 0,
        "posX": 0,
        "posY": 0,
        "width": 0,
        "height": 0,

        "opacity": 0,

        "update": function(event) {
            console.log(event.pageY - viewportRef.offsetTop)
            let mouseX = (-viewX + (event.pageX - viewportRef.offsetLeft)) / (window.innerHeight / 100 * 2 * viewZoom);
            let mouseY = (-viewY + (event.pageY - viewportRef.offsetTop)) / (window.innerHeight / 100 * 2 * viewZoom);

            this.posX = mouseX;
            this.posY = mouseY;

            this.destX = ((this.node.posX + this.node.simX) + this.node.width - .75);
            this.destY = ((this.node.posY + this.node.simY) + (1 + (this.index + 1) * 1.5));

            this.width = this.posX - this.destX;
            this.height = this.posY - this.destY;
        },
    }

    function initSimConnection(node, outputIndex) {
        simConnection.node = node;
        simConnection.index = outputIndex;
        simConnection.shown = true;
    }

    function terminateSimConnection() {
        simConnection.shown = false;
        simConnection.node = null;
        simConnection.index = 0;
    }

    function recalculateConnections(needsRefresh) {
        connections = [];

        nodeData.operator.forEach((n) => {
            for (let i = 0; i < n.inputs.length; i++) {
                if (n.inputs[i] != null) {
                    addConnection(n, n.inputs[i], i);
                }
            }
        });

        nodeData.output.forEach((n) => {
            if (n.input != null) {
                addConnection(n, n.input, 0);
            }
        });

        connections = Object.assign([], connections);

        if (needsRefresh) invokeOutputs();

        console.log(connections);
    }

    function addConnection(node, output, index) {
        try {
            let destData = context[output].superNode.rawNodeData;
            let newConnection = {
                "posX": (node.posX + node.simX) + .75,
                "posY": (node.posY + node.simY) + (1 + (index + 1)*1.5),
                "destX": (destData.posX + destData.simX) + destData.width - .75,
                "destY": (destData.posY + destData.simY) + (1 + (destData.outputs.indexOf(output) + 1) * 1.5),
                "width": (destData.posX + destData.width - .75) - (node.posX + .75),
                "height": (destData.posY + (1 + (destData.outputs.indexOf(output) + 1) * 1.5)) - (node.posY + (1 + (index + 1)*1.5)),
                "originColor": node.color,
                "destColor": destData.color,

                "inputHolder": node,
                "outputHolder": context[output].superNode.rawNodeData,
                "inputIndex": index,
                "outputIndex": destData.outputs.indexOf(output),

                "update": function() {
                    this.posX = (this.inputHolder.posX + this.inputHolder.simX) + .75;
                    this.posY = (this.inputHolder.posY + this.inputHolder.simY) + (1 + (this.inputIndex + 1)*1.5);
                    this.destX = (this.outputHolder.posX + this.outputHolder.simX) + this.outputHolder.width - .75;
                    this.destY = (this.outputHolder.posY + this.outputHolder.simY) + (1 + (this.outputIndex + 1) * 1.5);
                    this.width = this.posX - this.destX;
                    this.height = this.posY - this.destY;
                    connections[connections.indexOf(this)] = Object.assign({}, this);
                },
            };

            connections.push(newConnection);

            invokeOutputs();

            connections = Object.assign([], connections);
        }
        catch (err) {
            console.error(err);
        }
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

    let outputProcessCallbacks = [];
    export function invokeOutputs() {
        outputProcessCallbacks.forEach((callback) => {
            try {
                callback();
            }
            catch (err) {console.error(err);}
        });
    }

    // Node Picker Navigator
    let categoryLabels = [];

    function navJump(index) {
        console.log(categoryLabels[index]);
        if (!categoryLabels[index]) return;
        categoryLabels[index].scrollIntoView({
            behavior: "smooth"
        });
    }

</script>



<main>
    <div class="frame neuIndentShadow"
        bind:this="{viewportRef}"
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
            {#if node}
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

                    onInitConnect={initSimConnection}
                    onConnectDrop={terminateSimConnection}

                    connectionCallback={(node, output, index, removeOld) => {
                        addConnection(node, output, index);
                        if (removeOld) recalculateConnections();
                    }}
                />
            {/if}
        {/each}

        {#each nodeData.literal as node, index}
            {#if node}
                <LiteralNode
                    onDrag={(event) => initNodeDrag(event, "literal", index)}
                    onDelete={() => {deleteNode("literal", index)}}

                    onChange={invokeOutputs}

                    posX={node.posX}
                    posY={node.posY}
                    offX={(viewX + mouseDrag.delta.x) / window.innerHeight * 50}
                    offY={(viewY + mouseDrag.delta.y) / window.innerHeight * 50}
                    simX={node.simX}
                    simY={node.simY}
                    zoom={viewZoom}

                    outputID={node.outputID}

                    nodeData={node}
                    context={context}

                    onInitConnect={initSimConnection}
                    onConnectDrop={terminateSimConnection}

                    connectionCallback={recalculateConnections}
                />
            {/if}
        {/each}
        
        {#each nodeData.input as node, index}
            {#if node}
                <InputNode
                    onDrag={(event) => initNodeDrag(event, "input", index)}
                    onDelete={() => {deleteNode("input", index)}}

                    posX={node.posX}
                    posY={node.posY}
                    offX={(viewX + mouseDrag.delta.x) / window.innerHeight * 50}
                    offY={(viewY + mouseDrag.delta.y) / window.innerHeight * 50}
                    simX={node.simX}
                    simY={node.simY}
                    zoom={viewZoom}

                    outputID={node.outputID}

                    nodeData={node}
                    context={context}

                    tableRef={tableRef}
                    tableData={tableData}

                    onInitConnect={initSimConnection}
                    onConnectDrop={terminateSimConnection}

                    connectionCallback={addConnection}
                />
            {/if}
        {/each}

        {#each nodeData.output as node, index}
            {#if node}
                <OutputNode
                    onDrag={(event) => initNodeDrag(event, "output", index)}
                    onDelete={() => {deleteNode("output", index)}}

                    posX={node.posX}
                    posY={node.posY}
                    offX={(viewX + mouseDrag.delta.x) / window.innerHeight * 50}
                    offY={(viewY + mouseDrag.delta.y) / window.innerHeight * 50}
                    simX={node.simX}
                    simY={node.simY}
                    zoom={viewZoom}

                    nodeData={node}
                    context={context}

                    tableData={tableData}

                    connectionCallback={(node, output, index, removeOld) => {
                        addConnection(node, output, index);
                        if (removeOld) recalculateConnections();
                    }}

                    bind:process={outputProcessCallbacks[index]}
                />
            {/if}
        {/each}

        {#each connections as c, index}
            <div style="
                left: {2 * (c.posX * viewZoom + (viewX + mouseDrag.delta.x) / window.innerHeight * 50)}vh;
                top: {2 * (c.posY * viewZoom + (viewY + mouseDrag.delta.y) / window.innerHeight * 50)}vh;
            
                width: {Math.abs(c.width) * viewZoom * 2}vh;
                height: {Math.abs(c.height != 0 ? c.height : 1) * viewZoom * 2}vh;

                transform:  translate({c.posX > c.destX ? "-100%" : "0"},
                    {c.posY > c.destY ? "-100%" : "0"}) scale({c.destX > c.posX ? "-" : ""}1,  {c.destY > c.posY ? "-" : ""}1);


            " class="inputFlowContainer">
                <svg style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%; height: calc(100%);
                " preserveAspectRatio="none" viewBox="0 0 {Math.abs(c.width)} {c.height != 0 ? Math.abs(c.height) : 1}" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0 C {Math.abs(c.width / 2)} 0 {Math.abs(c.width / 2)} {Math.abs(c.height)} {Math.abs(c.width)} {Math.abs(c.height)}" stroke="url(#paint0_linear_102_1243_{index})" stroke-width=".15"/>
                    <defs>
                        <linearGradient id="paint0_linear_102_1243_{index}" x1="0" y1="1" x2="{Math.abs(c.width)}" y2="1" gradientUnits="userSpaceOnUse">
                        <stop stop-color="{c.destColor}"/>
                        <stop offset="1" stop-color="{c.originColor}"/>
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        {/each}

        {#if simConnection.shown}
            <div style="

                left: {2 * (simConnection.posX * viewZoom + (viewX + mouseDrag.delta.x) / window.innerHeight * 50)}vh;
                top: {2 * (simConnection.posY * viewZoom + (viewY + mouseDrag.delta.y) / window.innerHeight * 50)}vh;
            
                width: {Math.abs(simConnection.width) * viewZoom * 2}vh;
                height: {Math.abs(simConnection.height != 0 ? simConnection.height : 1) * viewZoom * 2}vh;

                transform:  translate({simConnection.posX > simConnection.destX ? "-100%" : "0"},
                    {simConnection.posY > simConnection.destY ? "-100%" : "0"}) scale({simConnection.destX > simConnection.posX ? "-" : ""}1,  {simConnection.destY > simConnection.posY ? "-" : ""}1);


            " class="inputFlowContainer">
                <svg style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%; height: calc(100%);
                " preserveAspectRatio="none" viewBox="0 0 {Math.abs(simConnection.width)} {simConnection.height != 0 ? Math.abs(simConnection.height) : 1}" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path style="pointer-events: none;" d="M0 0 C {Math.abs(simConnection.width / 2)} 0 {Math.abs(simConnection.width / 2)} {Math.abs(simConnection.height)} {Math.abs(simConnection.width)} {Math.abs(simConnection.height)}" stroke="url(#paint0_linear_102_1243_SIM)" stroke-width=".15"/>
                    <defs>
                        <linearGradient id="paint0_linear_102_1243_SIM" x1="0" y1="1" x2="{Math.abs(simConnection.width)}" y2="1" gradientUnits="userSpaceOnUse">
                        <stop stop-color="{simConnection.node.color}"/>
                        <stop offset="1" stop-color="{simConnection.node.color}"/>
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        {/if}
    </div>

    <div class="nodePickerFrame neuOutdentShadow"
        on:mousedown={(event) => {event.stopPropagation();}}
        on:mousewheel={/* Disable Node Editor Scroll on Hover*/
            (event) => {event.stopPropagation();}
        }
    >
        <div class="nodePickerHeader">
            <div class="nodePickerIcon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M7.724 65.49C13.36 55.11 21.79 46.47 32 40.56C39.63 36.15 48.25 33.26 57.46 32.33C59.61 32.11 61.79 32 64 32H448C483.3 32 512 60.65 512 96V416C512 451.3 483.3 480 448 480H64C28.65 480 0 451.3 0 416V96C0 93.79 .112 91.61 .3306 89.46C1.204 80.85 3.784 72.75 7.724 65.49V65.49zM48 416C48 424.8 55.16 432 64 432H448C456.8 432 464 424.8 464 416V224H48V416z"/></svg>            
            </div>
            <div class="nodePickerTitle">
                <h2>Node Picker</h2>
            </div>
        </div>
        <div class="nodePickerContents">
            <div class="slotScrollContainer">
            <div bind:this={categoryLabels[0]} class="nodePickerGroupTitle">
                <h2 style="color: var(--red)" >I/O</h2>
            </div>

            <NodePickerSlot
                id="Input"
                type="input"
                color="var(--red)"
            />

            <NodePickerSlot
                id="Output"
                type="output"
                color="var(--blue)"
            />

            <div bind:this={categoryLabels[1]} class="nodePickerGroupTitle">
                <h2 style="color: var(--velvet)" >Literals</h2>
            </div>

            <NodePickerSlot
                id="Number"
                type="literal"
                color="var(--velvet)"
            />

            <NodePickerSlot
                id="Text"
                type="literal"
                color="var(--velvet)"
            />

            {#each nodeCategories as category, index}
                <div bind:this={categoryLabels[index + 2]} class="nodePickerGroupTitle">
                    <h2>{category}</h2>
                </div>
                {#each nodeConfig[category] as id}
                    <NodePickerSlot
                        id="{id}"
                        type="operator"
                        color="var(--orange)"
                    />
                {/each}
            {/each}
            </div>

            <div class="verticalSeparator"></div>

            <div class="navigationPannel">
                <div on:click={() => {navJump(0)}} class="nodePickerGroupTitle navigationLabel">
                    <h2 style="color: var(--red);">I/O</h2>
                </div>
                <div on:click={() => {navJump(1)}} class="nodePickerGroupTitle navigationLabel">
                    <h2 style="color: var(--velvet);">Literals</h2>
                </div>
                {#each nodeCategories as category, index}
                    <div on:click={() => {navJump(index + 2)}} class="nodePickerGroupTitle navigationLabel">
                        <h2>{category}</h2>
                    </div>
                {/each}
            </div>
            
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

        background-color: var(--mainbg);

        overflow: hidden;
    }

    .crossBackground {
        position: absolute;
        width: 100%;
        height: 100%;

        background-image: var(--cross-background);
        background-repeat: repeat;

        overflow: hidden;
    }

    .nodePickerFrame {
        position: absolute;

        left: 2vh;
        top: 50%;
        transform: translateY(-50%);

        width: 6vh;
        height: 6vh;

        background-color: var(--mainbg);

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
        width: 36vh;
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
        flex-direction: row;

        align-items: center;

        overflow: hidden;

        transition: flex .5s cubic-bezier(0, 0, 0, .9), opacity .1s;
    }

    .nodePickerFrame:hover .nodePickerContents {
        flex: 5;

        opacity: 1;

        transition: flex .5s cubic-bezier(0, 0, 0, .9), opacity .5s .5s;
    }

    .slotScrollContainer {
        height: 100%;
        flex: 2;

        display: flex;
        flex-direction: column;

        overflow: hidden;
        overflow-y: scroll;
    }

    .slotScrollContainer::-webkit-scrollbar {
        display: none;
    }


    .verticalSeparator {
        height: 90%;
        width: .1vh;

        border-radius: .05vh;
        background-color: var(--orange);
    }


    .navigationPannel {
        height: 100%;
        flex: 1;

        display: flex;
        flex-direction: column;

        overflow: hidden;
        overflow-y: scroll;
    }

    .navigationPannel::-webkit-scrollbar {
        display: none;
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

    .navigationLabel {
        cursor: pointer;
        margin-bottom: .2vh;

        transition: 
            transform .5s cubic-bezier(0, 0, 0, .9);
    }

    .navigationLabel:hover {
        transform: translateY(-.2vh);
    }


    .inputFlowContainer {
        position: absolute;

        overflow: visible;
        pointer-events: none;
    }

    .inputFlowContainer svg {
        overflow: visible;

        pointer-events: none;
    }

    .inputFlowContainer svg path {
        pointer-events: visibleStroke;
    }


</style>