<script>
    export let text;
    export let sizeX = 5;
    export let sizeY = 2;
    export let posX = 0;
    export let posY = 0;
    export let offX = 0;
    export let offY = 0;
    export let zoom = 1;
    export let positionSmoothing = false;
</script>



<main style="
    left: {(posX * zoom + offX) * 2}vh;
    top: {(posY * zoom + offY) * 2}vh;

    width: {sizeX * 2 * zoom}vh;
    height: {sizeY * 2 * zoom}vh;

    border-radius: {1.5 * zoom}vh;

    transition:
        width .2s cubic-bezier(0, 0, 0, .9),
        height .2s cubic-bezier(0, 0, 0, .9),
        border-radius .2s cubic-bezier(0, 0, 0, .9),
        top {positionSmoothing ? "0s" : ".2s"} cubic-bezier(0, 0, 0, .9),
        left {positionSmoothing ? "0s" : ".2s"} cubic-bezier(0, 0, 0, .9);
">
    <h1 contenteditable="true" bind:textContent="{text}" style="
        font-size: {3 * zoom}vh;
        min-height: {2 * zoom}vh;
        min-width: {sizeX * zoom}vh;
    ">Title</h1>
</main>



<style>
    main {
        position: absolute;

        background-color: var(--red);

        display: grid;
        place-items: center;

        overflow: hidden;

/*         transition:
            width .2s cubic-bezier(0, 0, 0, .9),
            height .2s cubic-bezier(0, 0, 0, .9),
            border-radius .2s cubic-bezier(0, 0, 0, .9), */
    }

    h1 {
        color: var(--white);

        white-space: nowrap;

        text-align: center;

        transition: 
            font-size .2s cubic-bezier(0, 0, 0, .9);
    }
</style>