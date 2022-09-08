<script>
    let
        viewX = 0, viewY = 0,
        viewZoom = 1;
const   zoomBounds = [.2, 3]

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
        if (!mouseDrag.ongoing) return;
        mouseDrag.ongoing = false
        viewX += mouseDrag.delta.x;
        viewY += mouseDrag.delta.y;
        mouseDrag.delta = {"x": 0, "y": 0};
    }

    function scroll(event) {
        viewZoom -= event.deltaY / 1000;
        viewZoom = Math.max(zoomBounds[0], Math.min(viewZoom, zoomBounds[1]));
    }

</script>



<main>
    <div
        class="frame neuIndentShadow"
        on:mousedown="{mouseDown}"
        on:mousemove="{mouseMove}"
        on:mouseup="{mouseUp}"
        on:mouseleave="{mouseUp}"
        on:mousewheel="{scroll}">

        <div class="dottedBackground" style="
            background-position-x: {viewX + mouseDrag.delta.x}px;
            background-position-y: {viewY + mouseDrag.delta.y}px;
            background-size: {2 * viewZoom}vh;
        "></div>

        <h1>{viewZoom}</h1>
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
    }
</style>