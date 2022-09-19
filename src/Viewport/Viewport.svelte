<script>
    import Header from "./Components/Header.svelte"


    

    let
        viewX = 0, viewY = 0,
        viewZoom = 1;
const   zoomBounds = [.2, 3]

    let viewportHeight, viewportWidth

    // GLOBALS

    let projectData = {
        "objects": {
            "headers": [
                {
                    "text": "",

                    "posX": 3,
                    "posY": 3,
                    "sizeX": 10,
                    "sizeY": 3,
                }
            ]
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
        let oldZoom = viewZoom
        viewZoom -= event.deltaY / 1000;
        viewZoom = Math.max(zoomBounds[0], Math.min(viewZoom, zoomBounds[1]));
        viewX = (viewX - viewportWidth/2) * viewZoom / oldZoom + (viewportWidth / 2)
        viewY = (viewY - viewportHeight/2) * viewZoom / oldZoom + (viewportHeight / 2)
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
    }

    function initObjectDrag(event, type, index) {
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
    }

    function dragOver(event) {
        event.preventDefault();
        if (event.dataTransfer.getData("command") != "move") return;

        // Update objectDrag
        objectDrag.delta.x = Math.round((event.clientX - objectDrag.start.x) / (window.innerHeight / 100 * 2 * viewZoom));
        objectDrag.delta.y = Math.round((event.clientY - objectDrag.start.y) / (window.innerHeight / 100 * 2 * viewZoom));
    }

    function drop(event) {
        event.preventDefault();

        switch (event.dataTransfer.getData("command")) {
            case "move":
                projectData.objects[event.dataTransfer.getData("objectType")][event.dataTransfer.getData("objectID")].posX += Math.round((event.clientX - event.dataTransfer.getData("startX")) / (window.innerHeight / 100 * 2 * viewZoom));
                projectData.objects[event.dataTransfer.getData("objectType")][event.dataTransfer.getData("objectID")].posY += Math.round((event.clientY - event.dataTransfer.getData("startY")) / (window.innerHeight / 100 * 2 * viewZoom));
            
                objectDrag.ongoing = false;
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
        on:mousewheel="{scroll}">
            <div
                class="dottedBackground"
                on:dragover="{dragOver}"
                on:drop="{drop}"
                style="
                background-position-x: {viewX + mouseDrag.delta.x}px;
                background-position-y: {viewY + mouseDrag.delta.y}px;
                background-size: {2 * viewZoom}vh;
            "
            >

            <!-- INSTANTIATE PROJECT OBJECTS -->
            {#each projectData.objects.headers as object, index}
                <Header
                    bind:text={object.text}
                    onDrag={(event) => {initObjectDrag(event, "headers", index)}}

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