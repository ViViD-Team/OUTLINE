<script>
    import Node from "./Node.svelte"


    let viewX = 0, viewY = 0, viewZoom = 1;
    const zoomBounds = [.6, 3];

    let viewportHeight, viewportWidth;

    export let nodeData;
    export let tableRef;
    
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
    >
        <div class="crossBackground" style="
            background-position-x: {viewX + mouseDrag.delta.x}px;
            background-position-y: {viewY + mouseDrag.delta.y}px;
            background-size: {2 * viewZoom}vh;
        ">

        {#each nodeData.operator as node}
            <Node
                posX={node.posX}
                posY={node.posY}
                offX={(viewX + mouseDrag.delta.x) / window.innerHeight * 50}
                offY={(viewY + mouseDrag.delta.y) / window.innerHeight * 50}
                zoom={viewZoom}

                nodeData={node}
            />
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

        transition: flex .5s cubic-bezier(0, 0, 0, .9);
    }

    .nodePickerFrame:hover .nodePickerContents {
        display: flex;
        flex: 5;
    }
</style>