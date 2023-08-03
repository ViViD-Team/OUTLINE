<script>
    import Header from "./Components/Header.svelte"
    import Paragraph from "./Components/Paragraph.svelte"
    import Result from "./Components/Result.svelte";

    import Table from "./Components/Table.svelte"

    import PluginWrapper from "./Components/PluginWrapper.svelte";
    import PluginFallback from "./Components/PluginFallback.svelte";
    import { onMount } from "svelte";

    const { ipcRenderer } = require("electron");

    // Exports
    export let debObjectDrag, debObjectResize;

    $: debObjectDrag = [objectDrag.ongoing, 
                        objectDrag.start.x, 
                        objectDrag.start.y, 
                        objectDrag.delta.x, 
                        objectDrag.delta.y, 
                        objectDrag.layer.x, 
                        objectDrag.layer.y, 
                        objectDrag.objectInfo.ID, 
                        objectDrag.objectInfo.type]
    $: debObjectResize = [  objectResize.ongoing, 
                            objectResize.start.x, 
                            objectResize.start.y, 
                            objectResize.delta.x, 
                            objectResize.delta.y, 
                            objectResize.objectInfo.ID, 
                            objectResize.objectInfo.type]



let
        viewX = 0, viewY = 0,
        viewZoom = 1;
const   zoomBounds = [.3, 5]

    let viewportHeight, viewportWidth;
    let viewportRef;

    // GLOBALS
    export let projectData;

    export let userSettings;

    const objectPrototypes = {
        "header": {
            "text": "Lorem",
            "posX": 0,
            "posY": 0,
            "sizeX": 10,
            "sizeY": 3,
            "simX": 0,
            "simY": 0,
            "simResizeX": 0,
            "simResizeY": 0,
            "sizeBounds": [],
        },
        "paragraph": {
            "text": "Lorem ipsum",
            "posX": 0,
            "posY": 0,
            "sizeX": 8,
            "sizeY": 8,
            "simX": 0,
            "simY": 0,
            "simResizeX": 0,
            "simResizeY": 0,
            "sizeBounds": [],
        },

        "table": {
            "title": "New Table",
            "nodes": {
                "input": [],
                "output": [],
                "literal": [],
                "operator": [],
                "annotation": [],
                "result": [],
            },

            "reference": undefined,
            "cellContents": undefined,
            "colNames": undefined,

            "posX": 0,
            "posY": 0,
            "sizeX": 28,
            "sizeY": 21,
            "simX": 0,
            "simY": 0,
            "simResizeX": 0,
            "simResizeY": 0,
            "sizeBounds": [],
        },
        "result": {
            "title": "Result",
            "value": undefined,
            "posX": 0,
            "posY": 0,
            "sizeX": 10,
            "sizeY": 3,
            "simX": 0,
            "simY": 0,
            "simResizeX": 0,
            "simResizeY": 0,
            "sizeBounds": [],
        },
    }


    // MOUSE

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
        clearObjectDrag();
        clearObjectResize();

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


    // DRAG AND DROP

    //#region dragAndDrop
    
    let objectDrag = {
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
            "plugin": null
        },
    }

    function clearObjectDrag() {
        objectDrag = {
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
            "plugin": null
        },
    }
    }

    let objectResize = {
        "ongoing": false,
        "start": {
            "x": 0,
            "y": 0,
        },
        "delta": {
            "x": 0,
            "y": 0,
        },
        "objectInfo": {
            "type": "",
            "ID": 0,
            "plugin": null
        }
    }

    function clearObjectResize() {
        objectResize = {
        "ongoing": false,
        "start": {
            "x": 0,
            "y": 0,
        },
        "delta": {
            "x": 0,
            "y": 0,
        },
        "objectInfo": {
            "type": "",
            "ID": 0,
            "plugin": null
        }
    }
    }

    function initObjectDrag(event, type, index, width, height) {
        clearObjectDrag();
        clearObjectResize();
        // Override default drag image
        let imageOverride = document.createElement("img");
        event.dataTransfer.setDragImage(imageOverride, 0, 0);

        // Append necessary info
        event.dataTransfer.setData("command", "move");
        event.dataTransfer.setData("objectID", index);
        event.dataTransfer.setData("objectType", type);
        event.dataTransfer.setData("startX", event.clientX);
        event.dataTransfer.setData("startY", event.clientY);

        // Update objectDrag
        objectDrag.ongoing = true;
        objectDrag.start.x = event.clientX;
        objectDrag.start.y = event.clientY;
        objectDrag.objectInfo.type = type;
        objectDrag.objectInfo.ID = index;
        objectDrag.objectInfo.width = width;
        objectDrag.objectInfo.height = height;
    }

    function initPluginObjectDrag(event, plugin, type, index, width, height) {
        clearObjectDrag();
        clearObjectResize();
        // Override default drag image
        let imageOverride = document.createElement("img");
        event.dataTransfer.setDragImage(imageOverride, 0, 0);

        // Append necessary info
        event.dataTransfer.setData("command", "pluginMove");
        event.dataTransfer.setData("objectID", index);
        event.dataTransfer.setData("objectType", type);
        event.dataTransfer.setData("objectPlugin", plugin);
        event.dataTransfer.setData("startX", event.clientX);
        event.dataTransfer.setData("startY", event.clientY);

        // Update objectDrag
        objectDrag.ongoing = true;
        objectDrag.start.x = event.clientX;
        objectDrag.start.y = event.clientY;
        objectDrag.objectInfo.type = type;
        objectDrag.objectInfo.ID = index;
        objectDrag.objectInfo.width = width;
        objectDrag.objectInfo.height = height;
        objectDrag.objectInfo.plugin = plugin;
    }

    function initObjectResize(event, type, index) {
        clearObjectDrag();
        clearObjectResize();
        // Override default drag image
        let imageOverride = document.createElement("img");
        event.dataTransfer.setDragImage(imageOverride, 0, 0);

        event.dataTransfer.setData("command", "resize");
        event.dataTransfer.setData("objectType", type);
        event.dataTransfer.setData("objectID", index);

        objectResize.start.x = event.clientX;
        objectResize.start.y = event.clientY;
        objectResize.objectInfo.type = type;
        objectResize.objectInfo.ID = index;

        objectResize.ongoing = true;
    }

    function initPluginObjectResize(event, plugin, type, index) {
        clearObjectDrag();
        clearObjectResize();
        // Override default drag image
        let imageOverride = document.createElement("img");
        event.dataTransfer.setDragImage(imageOverride, 0, 0);

        event.dataTransfer.setData("command", "pluginResize");
        event.dataTransfer.setData("objectType", type);
        event.dataTransfer.setData("objectID", index);
        event.dataTransfer.setData("objectPlugin", plugin);

        objectResize.start.x = event.clientX;
        objectResize.start.y = event.clientY;
        objectResize.objectInfo.type = type;
        objectResize.objectInfo.ID = index;

        objectResize.ongoing = true;
        objectResize.objectInfo.plugin = plugin;
    }


    // Viewport events

    function dragOver(event) {
        event.preventDefault();

        let vhConverter = (window.innerHeight / 100 * 2 * viewZoom);

        if (objectDrag.ongoing) {
            // Update objectDrag
            objectDrag.delta.x = Math.round((event.clientX - objectDrag.start.x) / vhConverter);
            objectDrag.delta.y = Math.round((event.clientY - objectDrag.start.y) / vhConverter);

            objectDrag.layer.x = event.layerX;
            objectDrag.layer.y = event.layerY;

            const [plugin, type, ID] = [
                objectDrag.objectInfo.plugin,
                objectDrag.objectInfo.type,
                objectDrag.objectInfo.ID
            ];
            if (plugin == null) {
                const target = projectData.objects[type][ID];
                target.simX = objectDrag.delta.x;
                target.simY = objectDrag.delta.y;

                projectData.objects[type][ID] = Object.assign({}, target);
            }
            else {
                const target = projectData.pluginObjects[plugin][type][ID];
                target.simX = objectDrag.delta.x;
                target.simY = objectDrag.delta.y;
                projectData.pluginObjects[plugin][type][ID] = Object.assign({}, target);
            }
        }
        if (objectResize.ongoing) {
            // Update objectResize

            objectResize.delta.x = Math.round((event.clientX - objectResize.start.x) / vhConverter);
            objectResize.delta.y = Math.round((event.clientY - objectResize.start.y) / vhConverter);


            const [plugin, type, ID] = [
                objectResize.objectInfo.plugin,
                objectResize.objectInfo.type,
                objectResize.objectInfo.ID
            ];
            if (plugin == null) {
                const target = projectData.objects[type][ID];
                target.simResizeX = objectResize.delta.x;
                target.simResizeY = objectResize.delta.y;

                projectData.objects[type][ID] = Object.assign({}, target);
            }
            else {
                const target = projectData.pluginObjects[plugin][type][ID]
                target.simResizeX = objectResize.delta.x;
                target.simResizeY = objectResize.delta.y;

                projectData.pluginObjects[plugin][type][ID] = Object.assign({}, target);
            }
        }
    }

    function drop(event) {
        event.preventDefault();

        switch (event.dataTransfer.getData("command")) {
            case "move":
                moveObject(event);
                break;

            case "resize":
                resizeObject(event);
                break;

            case "pluginMove":
                movePluginObject(event);
                break;

            case "pluginResize":
                resizePluginObject(event);
                break;

            case "create":
                // Plugin Object Pattern Matching
                const stripped = event.dataTransfer.getData("objectType").split(":");
                if (stripped.length > 1) {
                    const [p, w] = stripped;
                    createPluginObject(p, w, event);
                    return;
                }

                createObject(event);
                break;
        }

        clearObjectDrag();
        clearObjectResize();
    }

    // Object Manipulation

    function moveObject(event) {
        const [objectType, objectID, startX, startY] = [
            event.dataTransfer.getData("objectType"),
            event.dataTransfer.getData("objectID"),
            event.dataTransfer.getData("startX"),
            event.dataTransfer.getData("startY")
        ];

        const target = projectData.objects[objectType][objectID];

        target.posX += Math.round((event.clientX - startX) / (window.innerHeight / 100 * 2 * viewZoom));
        target.posY += Math.round((event.clientY - startY) / (window.innerHeight / 100 * 2 * viewZoom));
    
        target.simX = 0;
        target.simY = 0;

        objectDrag.ongoing = false;
    }

    function resizeObject(event) {
        const [objectType, objectID] = [
            event.dataTransfer.getData("objectType"),
            event.dataTransfer.getData("objectID")
        ]
        const target = projectData.objects[objectType][objectID];

        objectResize.ongoing = false;

        let sizeX = target.sizeX;
        let sizeY = target.sizeY;

        let [[minX, maxX], [minY, maxY]] = target.sizeBounds;

        target.sizeX = Math.max(minX, Math.min(sizeX + objectResize.delta.x, maxX));
        target.sizeY = Math.max(minY, Math.min(sizeY + objectResize.delta.y, maxY));
        
        target.simResizeX = 0;
        target.simResizeY = 0;
    }

    function movePluginObject(event) {
        const [objectPlugin, objectType, objectID, startX, startY] = [
            event.dataTransfer.getData("objectPlugin"),
            event.dataTransfer.getData("objectType"),
            event.dataTransfer.getData("objectID"),
            event.dataTransfer.getData("startX"),
            event.dataTransfer.getData("startY")
        ];
        const target = projectData.pluginObjects[objectPlugin][objectType][objectID];

        target.posX += Math.round((event.clientX - startX) / (window.innerHeight / 100 * 2 * viewZoom));
        target.posY += Math.round((event.clientY - startY) / (window.innerHeight / 100 * 2 * viewZoom));
    
        target.simX = 0;
        target.simY = 0;

        objectDrag.ongoing = false;
    }

    function resizePluginObject(event) {
        const [objectPlugin, objectType, objectID] = [
            event.dataTransfer.getData("objectPlugin"),
            event.dataTransfer.getData("objectType"),
            event.dataTransfer.getData("objectID")
        ];
        const target = projectData.pluginObjects[objectPlugin][objectType][objectID];

        objectResize.ongoing = false;

        let sizeX = target.sizeX;
        let sizeY = target.sizeY;

        let [[minX, maxX], [minY, maxY]] = target.sizeBounds;

        target.sizeX = Math.max(minX, Math.min(sizeX + objectResize.delta.x, maxX));
        target.sizeY = Math.max(minY, Math.min(sizeY + objectResize.delta.y, maxY));
        
        target.simResizeX = 0;
        target.simResizeY = 0;
    }


    // Object Deletion

    function deleteObject(type, index) {
        projectData.objects[type].splice(index, 1);

        projectData.objects[type] = Object.assign([], projectData.objects[type]);
    }

    function deletePluginObject(plugin, type, index) {
        projectData.pluginObjects[plugin][type].splice(index, 1);

        projectData.pluginObjects[plugin][type] = Object.assign([], projectData.pluginObjects[plugin][type]);
    }

    // Object Creation

    function createObject(event) {
        const type = event.dataTransfer.getData("objectType");
        const instanceIndex = projectData.objects[type].length;
        
        // Instance and insert object
        projectData.objects[type].push(
            JSON.parse(JSON.stringify(objectPrototypes[type]))
        );

        const instance = projectData.objects[type][instanceIndex];
        
        instance.posX = Math.round((-viewX + event.layerX) / (window.innerHeight / 100 * 2 * viewZoom) - instance.sizeX / 2);
        instance.posY = Math.round((-viewY + event.layerY) / (window.innerHeight / 100 * 2 * viewZoom) - instance.sizeY / 2);
    
        // Trigger svelte update
        projectData.objects[type] = Object.assign([], projectData.objects[type]);
    }

    function createPluginObject(pluginID, widgetID, event) {
        // Create subobjects in projectData if not already existant
        if (!(pluginID in projectData.pluginObjects)) projectData.pluginObjects[pluginID] = {};

        if (!(widgetID in projectData.pluginObjects[pluginID]))
            projectData.pluginObjects[pluginID][widgetID] = [];

        // Fetch and clone prototype
        const prototype = ipcRenderer.sendSync("getPluginMap")[pluginID].widgets.filter(x => x.widgetID == widgetID)[0].prototype;
        const instance = JSON.parse(JSON.stringify(prototype));
        
        // Insert instance into list
        const list = projectData.pluginObjects[pluginID][widgetID];

        list.push(instance);

        // Set position of new instance to cursor position
        instance.posX = Math.round((-viewX + event.layerX) / (window.innerHeight / 100 * 2 * viewZoom) - prototype.sizeX / 2);
        instance.posY = Math.round((-viewY + event.layerY) / (window.innerHeight / 100 * 2 * viewZoom) - prototype.sizeY / 2);

        // Trigger svelte update
        projectData.pluginObjects[pluginID][widgetID] = Object.assign([], list);
    }

    //#endregion



    // Table Editing

    export let edited = null;   // null when outside of editmode,
                                // index of edited table when inside of editmode.

    

    // EXPORTED FUNCTIONS

    export function centerView() {
        viewX = 0;
        viewY = 0;
    }

    export function resetZoom() {
        viewZoom = 1;
    }

    export let invokeTableProcess;

    let activePlugins;
    function getActivatedPlugins() {
        let active = ipcRenderer.sendSync("getActivatedPlugins");
        
        let buffer = {};
        active.forEach(x => {
            buffer[x.pluginID] = x;
        });
        activePlugins = buffer;
    }
    onMount(() => {
        getActivatedPlugins();
    });
    ipcRenderer.on("refreshPlugins", getActivatedPlugins);

</script>



<main>
    <div
        class="frame neuIndentShadow"

        bind:this="{viewportRef}"
        bind:offsetHeight="{viewportHeight}"
        bind:offsetWidth="{viewportWidth}"

        on:mousedown="{mouseDown}"
        on:mousemove="{mouseMove}"
        on:mouseup="{mouseUp}"
        on:mouseleave="{mouseUp}"
        on:mousewheel="{scroll}"
        
        on:dragover="{dragOver}"
        on:drop="{drop}">
            <div
                class="dottedBackground"
                style="
                background-position-x: {viewX + mouseDrag.delta.x}px;
                background-position-y: {viewY + mouseDrag.delta.y}px;
                background-size: {2 * viewZoom}vh;
            "
            >

            <!-- INSTANTIATE PROJECT OBJECTS -->
            {#each projectData.objects.header as object, index}
                <Header
                    bind:text={object.text}
                    bind:sizeBounds={object.sizeBounds}

                    onDrag={(event) => {initObjectDrag(event, "header", index, object.sizeX, object.sizeY)}}
                    onResize={(event) => {initObjectResize(event, "header", index)}}
                    onDelete={() => {deleteObject("header", index)}}

                    posX={object.posX}
                    posY={object.posY}
                    offX={(viewX + mouseDrag.delta.x) / window.innerHeight * 50}
                    offY={(viewY + mouseDrag.delta.y) / window.innerHeight * 50}
                    zoom={viewZoom}
                    sizeX={object.sizeX}
                    sizeY={object.sizeY}

                    simX={object.simX}
                    simY={object.simY}
                    simResizeX={object.simResizeX}
                    simResizeY={object.simResizeY}
                />
            {/each}

            {#each projectData.objects.paragraph as object, index}
                <Paragraph
                    bind:text={object.text}
                    bind:sizeBounds={object.sizeBounds}

                    onDrag={(event) => {initObjectDrag(event, "paragraph", index, object.sizeX, object.sizeY)}}
                    onResize={(event) => {initObjectResize(event, "paragraph", index)}}
                    onDelete={() => {deleteObject("paragraph", index)}}

                    posX={object.posX}
                    posY={object.posY}
                    offX={(viewX + mouseDrag.delta.x) / window.innerHeight * 50}
                    offY={(viewY + mouseDrag.delta.y) / window.innerHeight * 50}
                    zoom={viewZoom}
                    sizeX={object.sizeX}
                    sizeY={object.sizeY}

                    simX={object.simX}
                    simY={object.simY}
                    simResizeX={object.simResizeX}
                    simResizeY={object.simResizeY}
                />
            {/each}

            {#each projectData.objects.table as object, index}
                <Table
                    bind:title={object.title}
                    bind:sizeBounds={object.sizeBounds}

                    editmode={edited == index}

                    bind:this={object.reference}
                    bind:cellContents={object.cellContents}
                    bind:colNames={object.colNames}

                    lockedCells={[]}

                    onDrag={(event) => {initObjectDrag(event, "table", index, object.sizeX, object.sizeY)}}
                    onResize={(event) => {initObjectResize(event, "table", index)}}
                    onDelete={() => {deleteObject("table", index); if (edited == index) edited = null}}
                    onEdit={() => {edited = edited == null ? index : null}}

                    posX={object.posX}
                    posY={object.posY}
                    offX={(viewX + mouseDrag.delta.x) / window.innerHeight * 50}
                    offY={(viewY + mouseDrag.delta.y) / window.innerHeight * 50}
                    zoom={viewZoom}
                    sizeX={object.sizeX}
                    sizeY={object.sizeY}

                    simX={object.simX}
                    simY={object.simY}
                    simResizeX={object.simResizeX}
                    simResizeY={object.simResizeY}

                    onInput={invokeTableProcess}
                />
            {/each}

            {#each projectData.objects.result as object, index}
                <Result
                    bind:widgetData={object}
                    bind:projectData={projectData}
                    bind:sizeBounds={object.sizeBounds}


                    onDrag={(event) => {initObjectDrag(event, "result", index, object.sizeX, object.sizeY)}}
                    onResize={(event) => {initObjectResize(event, "result", index)}}
                    onDelete={() => {deleteObject("result", index);}}

                    posX={object.posX}
                    posY={object.posY}
                    offX={(viewX + mouseDrag.delta.x) / window.innerHeight * 50}
                    offY={(viewY + mouseDrag.delta.y) / window.innerHeight * 50}
                    zoom={viewZoom}
                    sizeX={object.sizeX}
                    sizeY={object.sizeY}

                    simX={object.simX}
                    simY={object.simY}
                    simResizeX={object.simResizeX}
                    simResizeY={object.simResizeY}
                />
            {/each}

            <!--! Plugin Handling -->
            
            {#each Object.keys(projectData.pluginObjects) as plugin}
                {#each Object.keys(projectData.pluginObjects[plugin]) as widgetType}
                    {#each projectData.pluginObjects[plugin][widgetType] as w, index}
                        {#if activePlugins[plugin] != null}
                            <PluginWrapper
                                bind:sizeBounds={w.sizeBounds}

                                posX={w.posX}
                                posY={w.posY}
                                sizeX={w.sizeX}
                                sizeY={w.sizeY}
                                simX={w.simX}
                                simY={w.simY}
                                simResizeX={w.simResizeX}
                                simResizeY={w.simResizeY}

                                offX={(viewX + mouseDrag.delta.x) / window.innerHeight * 50}
                                offY={(viewY + mouseDrag.delta.y) / window.innerHeight * 50}

                                zoom={viewZoom}

                                widgetData={projectData.pluginObjects[plugin][widgetType][index]}
                                projectData={projectData}

                                pluginID={plugin}
                                widgetID={widgetType}

                                onDrag={(event) => {initPluginObjectDrag(event, plugin, widgetType, index, w.sizeX, w.sizeY)}}
                                onResize={(event) => {initPluginObjectResize(event, plugin, widgetType, index)}}
                                onDelete={() => {deletePluginObject(plugin, widgetType, index)}}
                            />
                        {:else}
                            <PluginFallback
                                posX={w.posX}
                                posY={w.posY}
                                sizeX={w.sizeX}
                                sizeY={w.sizeY}
                                simX={w.simX}
                                simY={w.simY}
                                simResizeX={w.simResizeX}
                                simResizeY={w.simResizeY}

                                offX={(viewX + mouseDrag.delta.x) / window.innerHeight * 50}
                                offY={(viewY + mouseDrag.delta.y) / window.innerHeight * 50}

                                zoom={viewZoom}

                                pluginID={plugin}
                                widgetID={widgetType}
                            />
                        {/if}
                    {/each}
                {/each}
            {/each}

            </div>
    </div>
</main>



<style>
    main {
        height: 100%;
        flex: 1;

        display: grid;
        place-items: center;
    }

    .frame {
        position: relative;

        width: calc(100% - 2vh);
        height: calc(100% - 2vh);

        border-radius: 2vh;

        background-color: var(--mainbg);

        overflow: hidden;
    }

    .dottedBackground {
        position: absolute;
        width: 100%;
        height: 100%;

        background-image: var(--dotted-background);
        background-repeat: repeat;

        /* transition: background-size .2s cubic-bezier(0, 0, 0, .9); */
    }
</style>