<script>

    // OBJECT SPECIFIC
    export const sizeBounds = [ /* X */ [10, 50], /* Y */ [10, 50]]

    export let title;

    export let numCols = 4, numRows = 9;
    export let colNames = [];

    export let sizeX = 5;
    export let sizeY = 2;
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
</script>



<main class="neuOutdentShadow" style="
    left: {((posX + simX) * zoom + offX) * 2}vh;
    top: {((posY + simY) * zoom + offY) * 2}vh;

    width: {Math.max(sizeBounds[0][0], Math.min((sizeX + simResizeX), sizeBounds[0][1])) * 2 * zoom}vh;
    height: {Math.max(sizeBounds[1][0], Math.min((sizeY + simResizeY), sizeBounds[1][1])) * 2 * zoom}vh;

    border-radius: {1.5 * zoom}vh;

    transition:
        border-radius .2s cubic-bezier(0, 0, 0, .9),
">

    <div class="titleStrip" style="
        height: {4 * zoom}vh;
    ">
        <h1 contenteditable="true" bind:textContent={title} style="
            font-size: {2 * zoom}vh;
            min-height: {2 * zoom}vh;
            min-width: {sizeX * zoom}vh;
            margin-left: {4 * zoom}vh;
        ">Title</h1>
    </div>


    <div class="contents">
        <div class="tableGrid">
            <!-- TODO: Refactor -->
            <div class="rowIndicatorContainer" style="
                width: {2*zoom}vh;
                margin-top: {2*zoom}vh;
            ">
                {#each Array(numRows) as y, index}
                    <div class="rowIndicator" style="
                        height: {3*zoom}vh;

                        border-top-left-radius: {.5*zoom}vh;
                        border-bottom-left-radius: {.5*zoom}vh;
                    ">
                        <p style="
                            font-size: {1.5*zoom}vh;
                            height: {1.5*zoom}vh;
                        ">
                            {index + 1}
                        </p>
                    </div>
                {/each}
            </div>

            {#each Array(numCols) as x, index}
                <div class="tableGridColumn" style="
                    width: {10*zoom}vh;
                ">
                <div class="columnIndicator" style="
                    border-top-left-radius: {.5*zoom}vh;
                    border-top-right-radius: {.5*zoom}vh;

                    height: {2*zoom}vh;
                ">
                    <p
                        contenteditable="true"
                        bind:textContent={colNames[index]}
                        style="
                            font-size: {1.2*zoom}vh;
                            height: {1.5*zoom}vh;
                        ">
                    </p>
                </div>

                    {#each Array(numRows) as y}
                        <div class="tableCell neuIndentShadowNarrow" style="
                            height: {3*zoom}vh;

                            border-radius: {.5*zoom}vh;
                        ">
                            
                        </div>
                    {/each}
                </div>
            {/each}
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

        background-color: var(--white);

        /* box-shadow:
            inset -.2vh -.2vh .2vh 0 var(--absolute-white),
            inset .2vh .2vh .2vh 0 var(--grey); */

        display: flex;
        flex-direction: column;

        overflow: hidden;

/*         transition:
            width .2s cubic-bezier(0, 0, 0, .9),
            height .2s cubic-bezier(0, 0, 0, .9),
            border-radius .2s cubic-bezier(0, 0, 0, .9), */
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

    .contents {
        width: 100%;
        height: 100%;

        display: grid;
        place-items: center;
    }

    .tableGrid {
        width: calc(100% - 2vh);
        height: calc(100% - 2vh);

        display: flex;

        align-items: center;
        justify-content: center;

        overflow: hidden;
    }

    .tableGridColumn {

        margin: 0 .2vh 0 .2vh;

        flex-shrink: 0;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .columnIndicator {
        width: 100%;

        margin-bottom: .5vh;

        background-color: var(--red);

        display: grid;
        place-content: center;

        overflow: hidden;
    }

    .rowIndicatorContainer {
        height: 100%;
        margin-right: .5vh;

        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
    }

    .rowIndicator {
        width: 100%;

        background-color: var(--red);
        
        margin: .2vh 0 .2vh 0;

        display: grid;
        place-items: center;
    }

    .tableCell {
        cursor: pointer;

        width: 100%;

        margin: .2vh 0 .2vh 0;

        flex-shrink: 0;

        background-color: var(--white);
    }

    h1 {
        color: var(--white);

        font-weight: 600;

        white-space: nowrap;

        text-overflow: ellipsis;

        /* transition: 
            font-size .2s cubic-bezier(0, 0, 0, .9); */
    }

    .columnIndicator p {
        color: var(--white);

        min-width: 4vh;

        font-weight: 800;

        text-align: center;

        overflow: hidden;
    }

    .rowIndicator p {
        color: var(--white);

        font-weight: 800;

        text-align: center;

        overflow: hidden;
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
        fill: var(--white);
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
        fill: var(--white);
        width: 50%;
    }
</style>