<script>
    import Header from "./Components/Header.svelte"


    let
        viewX = 0, viewY = 0,
        viewZoom = 1;
const   zoomBounds = [.2, 3]

    let viewportHeight, viewportWidth;

    // GLOBALS

    let projectData = {
        "objects": {
            "header": [

            ]
        }
    }

    const objectPrototypes = {
        "header": {
            "text": "Lorem",
            "posX": 0,
            "posY": 0,
            "sizeX": 10,
            "sizeY": 3,
        }
    }


    // MOUSE

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
        viewZoom -= event.deltaY / 1000;
        viewZoom = Math.max(zoomBounds[0], Math.min(viewZoom, zoomBounds[1]));
    }


    // DRAG AND DROP
    
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
    }

    function initObjectDrag(event, type, index, width, height) {
        // Override default drag image
        /* let imageOverride = document.createElement("img");
        event.dataTransfer.setDragImage(imageOverride, 0, 0); */

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
        event.dataTransfer.setData("command", "resize");
        event.dataTransfer.setData("objectType", type);
        event.dataTransfer.setData("objectID", index);

        objectResize.start.x = event.clientX;
        objectResize.start.y = event.clientY;

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
        }
        if (objectResize.ongoing) {
            // Update objectResize

            objectResize.delta.x = Math.round((event.clientX - objectResize.start.x) / vhConverter);
            objectResize.delta.y = Math.round((event.clientY - objectResize.start.y) / vhConverter);
        }
    }

    function drop(event) {
        event.preventDefault();

        switch (event.dataTransfer.getData("command")) {
            case "move":
                projectData.objects[event.dataTransfer.getData("objectType")][event.dataTransfer.getData("objectID")].posX += Math.round((event.clientX - event.dataTransfer.getData("startX")) / (window.innerHeight / 100 * 2 * viewZoom));
                projectData.objects[event.dataTransfer.getData("objectType")][event.dataTransfer.getData("objectID")].posY += Math.round((event.clientY - event.dataTransfer.getData("startY")) / (window.innerHeight / 100 * 2 * viewZoom));
            
                projectData.objects[event.dataTransfer.getData("objectType")][event.dataTransfer.getData("objectID")].dragSimX = 0;
                projectData.objects[event.dataTransfer.getData("objectType")][event.dataTransfer.getData("objectID")].dragSimY = 0;

                objectDrag.ongoing = false;
                break;

            case "resize":
                objectResize.ongoing = false;

                projectData.objects[event.dataTransfer.getData("objectType")][event.dataTransfer.getData("objectID")].sizeX += objectResize.delta.x;
                projectData.objects[event.dataTransfer.getData("objectType")][event.dataTransfer.getData("objectID")].sizeY += objectResize.delta.y;
                
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
    }

</script>



<main>
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
            ">

            <!-- INSTANTIATE PROJECT OBJECTS -->
            {#each projectData.objects.header as object, index}
                <Header
                    bind:text={object.text}
                    onDrag={(event) => {initObjectDrag(event, "header", index, object.sizeX, object.sizeY)}}
                    onResize={(event) => {initObjectResize(event, "header", index)}}

                    posX={object.posX}
                    posY={object.posY}
                    offX={(viewX + mouseDrag.delta.x) / window.innerHeight * 50}
                    offY={(viewY + mouseDrag.delta.y) / window.innerHeight * 50}
                    zoom={viewZoom}
                    sizeX={object.sizeX}
                    sizeY={object.sizeY}
                    positionSmoothing={mouseDrag.ongoing}
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

        animation: test 10s linear infinite;

        transition: background-size .2s cubic-bezier(0, 0, 0, .9);
    }
</style>