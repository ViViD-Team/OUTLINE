<script>
    export const sizeBounds = [ /* X */ [5, 30], /* Y */ [5, 30]]

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

    export let pluginID, widgetID;
</script>



<main on:mousedown={(event) => {event.stopPropagation();}} class="neuIndentShadow" style="
    left: {((posX + simX) * zoom + offX) * 2}vh;
    top: {((posY + simY) * zoom + offY) * 2}vh;

    width: {Math.max(sizeBounds[0][0], Math.min((sizeX + simResizeX), sizeBounds[0][1])) * 2 * zoom}vh;
    height: {Math.max(sizeBounds[1][0], Math.min((sizeY + simResizeY), sizeBounds[1][1])) * 2 * zoom}vh;

    border-radius: {1.5 * zoom}vh;

    transition:
        border-radius .2s cubic-bezier(0, 0, 0, .9),
">
    <div class="iconContainer" style="
        margin-top: {2*zoom}vh;
        margin-bottom: {2*zoom}vh;
    ">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="
            height: {2*zoom}vh;
        ">
            <!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
            <path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/>
        </svg>
    </div>
    <div class="textContainer" style="
        margin-left: {zoom}vh;
        margin-right: {zoom}vh;
        margin-bottom: {zoom}vh;
        width: calc(100% - {2*zoom}vh);
    ">
        <h1 style="
            font-size: {zoom}vh;
        ">
            The widget <span>{widgetID}</span> could not be loaded from <span>{pluginID}</span>.
            Make sure that the plugin is up to date and that it is both installed and enabled.
        </h1>
    </div>
    
    
    <div 
        class="dragHandle"
        draggable="true"

        on:dragstart="{drag}"
        
        style="
            width: {3*zoom}vh;
            height: {3*zoom}vh;

            
            display: none;
    ">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M278.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-64 64c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l9.4-9.4V224H109.3l9.4-9.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-64 64c-12.5 12.5-12.5 32.8 0 45.3l64 64c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-9.4-9.4H224V402.7l-9.4-9.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l64 64c12.5 12.5 32.8 12.5 45.3 0l64-64c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-9.4 9.4V288H402.7l-9.4 9.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l64-64c12.5-12.5 12.5-32.8 0-45.3l-64-64c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l9.4 9.4H288V109.3l9.4 9.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-64-64z"/></svg>
    </div>

    <div
        class="deleteAction"
        
        on:click={handleDelete}
        
        style="
            width: {3*zoom}vh;
            height: {3*zoom}vh;

            
            display: none;"
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

            display: none;
    ">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Pro 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M32 288c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 288zm0-128c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 160z"/></svg>
    </div>
</main>



<style>
    main {
        position: absolute;

        background-color: var(--mainbg);

        /* box-shadow:
            inset -.2vh -.2vh .2vh 0 var(--shadow1),
            inset .2vh .2vh .2vh 0 var(--shadow2); */

        display: flex;
        flex-direction: column;

        overflow: hidden;

/*         transition:
            width .2s cubic-bezier(0, 0, 0, .9),
            height .2s cubic-bezier(0, 0, 0, .9),
            border-radius .2s cubic-bezier(0, 0, 0, .9), */
    }

    h1 {
        color: var(--red);
        text-align: justify;
        font-weight: 300;
    }

    h1 span {
        color: var(--orange);
        text-decoration: dotted;
        font-weight: 800;
    }


    .iconContainer {
        width: 100%;
        flex: 1;

        display: grid;
        place-items: center;
    }

    .iconContainer svg {
        fill: var(--red);
    }

    .textContainer {
        flex: 3;

        display: grid;
        place-items: center;
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
        fill: var(--red);
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
        fill: var(--red);
        width: 50%;
    }
</style>