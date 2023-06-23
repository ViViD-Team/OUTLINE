<script>
    import { onMount } from "svelte";

// OBJECT SPECIFIC
    export const sizeBounds = [ /* X */ [7, 50], /* Y */ [6, 6]]

    export let widgetData;
    export let projectData;

    export let sizeX = 5;
    export let sizeY = 6;
    export let posX = 0;
    export let posY = 0;
    export let offX = 0;
    export let offY = 0;
    export let zoom = 1;

    export let simX;
    export let simY;
    export let simResizeX;
    export let simResizeY;

    export let onDrag;
    export let onResize;
    export let onDelete;

    function drag(event) {
        onDrag(event);
    }

    function resize(event) {
        onResize(event);
    }

    function handleDelete() {
        onDelete();
    }

    onMount(() => {
        widgetData.update = function(value) {
            this.value = value;
            /* let me = projectData.objects.result[projectData.objects.result.indexOf(this)];
            me = Object.assign({}, me); */
            projectData.objects.result = Object.assign([], projectData.objects.result);
        }
    })
</script>



<main on:mousedown={(event) => {event.stopPropagation();}} class="neuOutdentShadowRim" style="
    left: {((posX + simX) * zoom + offX) * 2}vh;
    top: {((posY + simY) * zoom + offY) * 2}vh;

    width: {Math.max(sizeBounds[0][0], Math.min((sizeX + simResizeX), sizeBounds[0][1])) * 2 * zoom}vh;
    height: {Math.max(sizeBounds[1][0], Math.min((sizeY + simResizeY), sizeBounds[1][1])) * 2 * zoom}vh;

    border-radius: {1.5 * zoom}vh;

    transition:
        border-radius .2s cubic-bezier(0, 0, 0, .9),
">

    <div class="titleStrip" style="
        height: {4*zoom}vh;
    ">
        <h1 
            contenteditable="true" 
            bind:textContent={widgetData.title}
            on:keypress={(event) => {
                // Prevent Multiline
                if (event.key == "Enter") event.preventDefault();
            }}
        style="
            font-size: {2 * zoom}vh;
            min-height: {2 * zoom}vh;
            min-width: {sizeX * zoom}vh;
            margin-left: {4 * zoom}vh;
        ">Title</h1>
    </div>

    <div class="content">
        <div class="valueDisplay neuIndentShadowNarrow" style="
            height: {4*zoom}vh;
            width: calc(100% - {4*zoom}vh);

            border-radius: {zoom}vh;
        ">
            <h1 style="font-size: {2*zoom}vh; margin-left: {zoom}vh">{widgetData.value}</h1>
        </div>
    </div>


<div 
    class="dragHandle"
    draggable="true"

    on:dragstart="{drag}"

    style="
        width: {3*zoom}vh;
        height: {3*zoom}vh;
    ">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M278.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-64 64c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l9.4-9.4V224H109.3l9.4-9.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-64 64c-12.5 12.5-12.5 32.8 0 45.3l64 64c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-9.4-9.4H224V402.7l-9.4-9.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l64 64c12.5 12.5 32.8 12.5 45.3 0l64-64c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-9.4 9.4V288H402.7l-9.4 9.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l64-64c12.5-12.5 12.5-32.8 0-45.3l-64-64c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l9.4 9.4H288V109.3l9.4 9.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-64-64z"/></svg>
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

<div
    class="resizeHandle"
    draggable="true"

    on:dragstart="{resize}"

    style="
        width: {3*zoom}vh;
        height: {3*zoom}vh;
">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Pro 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M32 288c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 288zm0-128c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 160z"/></svg>
</div>
</main>



<style>
    main {
        position: absolute;

        background-color: var(--mainbg);

        display: flex;
        flex-direction: column;

        overflow: hidden;
    }

    .titleStrip {
        width: 100%;

        background-color: var(--red);

        display: flex;
        align-items: center;
        justify-items: flex-start;

        overflow: hidden;

        flex-shrink: 0;
    }

    .titleStrip h1 {
        color: var(--mainbg);

        font-weight: 600;

        white-space: nowrap;

        text-overflow: ellipsis;
    }



    .resizeHandle {
        cursor: se-resize;

        position: absolute;
        bottom: 0;
        right: 0;

        transform: translate(100%, 100%);

        transition: transform .25s cubic-bezier(0, 0, 0, .9);

        display: grid;
        place-items: center;
    }

    main:hover .resizeHandle {
        transform: translate(0, 0);
    }

    .resizeHandle svg {
        fill: var(--red);
        width: 50%;
    }


    .content {
        width: 100%;
        flex: 1;

        display: grid;
        place-items: center;
    }

    .valueDisplay {
        display: flex;
        align-items: center;

        overflow: hidden;
    }

    .valueDisplay h1 {
        color: var(--red);
    }


    


    .dragHandle {
        cursor: move;

        position: absolute;
        top: 0;
        left: 0;

        transform: translate(-100%, -100%);

        transition: transform .25s cubic-bezier(0, 0, 0, .9);

        display: grid;
        place-items: center;
    }

    main:hover .dragHandle {
        transform: translate(0, 0);
    }

    .dragHandle svg {
        fill: var(--mainbg);
        width: 50%;
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

    .deleteAction svg {
        fill: var(--mainbg);
        width: 50%;
    }
</style>