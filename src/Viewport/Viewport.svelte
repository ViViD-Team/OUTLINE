<script>
    import Header from "./Components/Header.svelte"
    import Paragraph from "./Components/Paragraph.svelte"

    import Table from "./Components/Table.svelte"

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
const   zoomBounds = [.75, 3]

    let viewportHeight, viewportWidth;

    // GLOBALS
    export let projectData;

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
                "operator": []
            },

            "reference": undefined,
            "cellContents": undefined,

            "posX": 0,
            "posY": 0,
            "sizeX": 28,
            "sizeY": 21,
            "simX": 0,
            "simY": 0,
            "simResizeX": 0,
            "simResizeY": 0,
            "sizeBounds": [],
        }
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
        clearObjectDrag();
        clearObjectResize();

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

    function dragOver(event) {
        event.preventDefault();

        let vhConverter = (window.innerHeight / 100 * 2 * viewZoom);

        if (objectDrag.ongoing) {
            // Update objectDrag
            objectDrag.delta.x = Math.round((event.clientX - objectDrag.start.x) / vhConverter);
            objectDrag.delta.y = Math.round((event.clientY - objectDrag.start.y) / vhConverter);

            objectDrag.layer.x = event.layerX;
            objectDrag.layer.y = event.layerY;

            projectData.objects[objectDrag.objectInfo.type][objectDrag.objectInfo.ID].simX = objectDrag.delta.x;
            projectData.objects[objectDrag.objectInfo.type][objectDrag.objectInfo.ID].simY = objectDrag.delta.y;

        }
        if (objectResize.ongoing) {
            // Update objectResize

            objectResize.delta.x = Math.round((event.clientX - objectResize.start.x) / vhConverter);
            objectResize.delta.y = Math.round((event.clientY - objectResize.start.y) / vhConverter);

            projectData.objects[objectResize.objectInfo.type][objectResize.objectInfo.ID].simResizeX = objectResize.delta.x;
            projectData.objects[objectResize.objectInfo.type][objectResize.objectInfo.ID].simResizeY = objectResize.delta.y;
        }
    }

    function drop(event) {
        event.preventDefault();

        switch (event.dataTransfer.getData("command")) {
            case "move":
                projectData.objects[event.dataTransfer.getData("objectType")][event.dataTransfer.getData("objectID")].posX += Math.round((event.clientX - event.dataTransfer.getData("startX")) / (window.innerHeight / 100 * 2 * viewZoom));
                projectData.objects[event.dataTransfer.getData("objectType")][event.dataTransfer.getData("objectID")].posY += Math.round((event.clientY - event.dataTransfer.getData("startY")) / (window.innerHeight / 100 * 2 * viewZoom));
            
                projectData.objects[event.dataTransfer.getData("objectType")][event.dataTransfer.getData("objectID")].simX = 0;
                projectData.objects[event.dataTransfer.getData("objectType")][event.dataTransfer.getData("objectID")].simY = 0;

                objectDrag.ongoing = false;
                break;

            case "resize":
                objectResize.ongoing = false;

                let sizeX = projectData.objects[event.dataTransfer.getData("objectType")][event.dataTransfer.getData("objectID")].sizeX;
                let sizeY = projectData.objects[event.dataTransfer.getData("objectType")][event.dataTransfer.getData("objectID")].sizeY;

                let sizeBounds = projectData.objects[event.dataTransfer.getData("objectType")][event.dataTransfer.getData("objectID")].sizeBounds

                projectData.objects[event.dataTransfer.getData("objectType")][event.dataTransfer.getData("objectID")].sizeX = Math.max(sizeBounds[0][0], Math.min(sizeX + objectResize.delta.x, sizeBounds[0][1]));
                projectData.objects[event.dataTransfer.getData("objectType")][event.dataTransfer.getData("objectID")].sizeY = Math.max(sizeBounds[1][0], Math.min(sizeY + objectResize.delta.y, sizeBounds[1][1]));
                
                projectData.objects[event.dataTransfer.getData("objectType")][event.dataTransfer.getData("objectID")].simResizeX = 0;
                projectData.objects[event.dataTransfer.getData("objectType")][event.dataTransfer.getData("objectID")].simResizeY = 0;

                break;

            case "create":
                let type = event.dataTransfer.getData("objectType");
                let instanceIndex = projectData.objects[type].length;
                
                projectData.objects[type].push(
                    Object.assign({}, objectPrototypes[type])
                );

                
                
                projectData.objects[type][instanceIndex].posX = Math.round((-viewX + event.layerX) / (window.innerHeight / 100 * 2 * viewZoom) - projectData.objects[type][instanceIndex].sizeX / 2);
                projectData.objects[type][instanceIndex].posY = Math.round((-viewY + event.layerY) / (window.innerHeight / 100 * 2 * viewZoom) - projectData.objects[type][instanceIndex].sizeY / 2);
                
                break;
        }

        clearObjectDrag();
        clearObjectResize();
    }

    function deleteObject(type, index) {
        projectData.objects[type].splice(index, 1);

        projectData.objects[type] = Object.assign([], projectData.objects[type]);
    }

    //#endregion


    // Table Editing

    export let edited = null;  // null when outside of editmode,
                        // index of edited table when inside of editmode.

    

    // EXPORTED FUNCTIONS

    export function centerView() {
        viewX = 0;
        viewY = 0;
    }

    export function resetZoom() {
        viewZoom = 1;
    }

</script>



<main>

    <!-- Ellens requested a waypoint system kek -->

    <div
        class="frame neuIndentShadow"

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

                    lockedCells={[]}

                    onDrag={(event) => {initObjectDrag(event, "table", index, object.sizeX, object.sizeY)}}
                    onResize={(event) => {initObjectResize(event, "table", index)}}
                    onDelete={() => {deleteObject("table", index); if (edited == index) edited = null}}
                    onEdit={() => {edited = edited == null ? index : edited != index ? index : null}}

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

        background-color: var(--white);

        overflow: hidden;
    }

    .dottedBackground {
        position: absolute;
        width: 100%;
        height: 100%;

        background-image: url("../svg/Background_Dot.svg");
        background-repeat: repeat;

        /* transition: background-size .2s cubic-bezier(0, 0, 0, .9); */
    }
</style>