<script>
    import { onMount } from "svelte";
    const { ipcRenderer } = require("electron");
    
    const fs = require('fs');
    const path = require('path');

    export let sizeBounds = [ /* X */ [5, 30], /* Y */ [5, 30]];

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



    // For Plugin Loading

    export let projectData, widgetData, widgetID, resourcePath;
    let _main;

    let controller;
    
    onMount(() => {
        try {
            // Load HTML

            const html = String(fs.readFileSync(
                path.join(resourcePath, widgetID, `${widgetID}.html`
            )));

            _main.innerHTML = html;


            // Load CSS

            const css = String(fs.readFileSync(
                path.join(resourcePath, widgetID, `${widgetID}.css`
            )));

            let styleElement = document.createElement("style");
            styleElement.innerHTML = css;
            _main.appendChild(styleElement);


            // Load js module

            const classModule = require(
                path.join(resourcePath, widgetID, `${widgetID}.js`
            ));
            controller = new classModule(_main, projectData, widgetData, update);
        }
        catch (err) {
            console.error(err);
        }
    });

    function update() {
        if (!controller) return;
        widgetData = controller._widgetData;
    }

    $: if (controller) {
        controller._widgetData = widgetData;
        controller.update();
    }

    $: widgetData, reassignWidgetData();

    function reassignWidgetData() {
        if (!controller) return;
        controller._widgetData = widgetData;
        controller.update();
    }


    function reload() {
        try {
            // Load HTML

            const html = String(fs.readFileSync(
                path.join(resourcePath, widgetID, `${widgetID}.html`
            )));

            _main.innerHTML = html;


            // Load CSS

            const css = String(fs.readFileSync(
                path.join(resourcePath, widgetID, `${widgetID}.css`
            )));

            let styleElement = document.createElement("style");
            styleElement.innerHTML = css;
            _main.appendChild(styleElement);


            // Load js module

            const classModule = require(
                path.join(resourcePath, widgetID, `${widgetID}.js`
            ));
            controller = new classModule(_main, projectData, widgetData, update);

			document.dispatchEvent(new CustomEvent("notificationEvent", {detail: {"type": "note", "message": "Reload performed!"}}));
        }
        catch (err) {
            console.error(err);
			document.dispatchEvent(new CustomEvent("notificationEvent", {detail: {"type": "error", "message": "Error while reloading!"}}));
        }
    }
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

    <div bind:this={_main} class="wrapper" style="--unit: {2*zoom}vh">

    </div>


    <div 
        class="dragHandle"
        draggable="true"

        on:dragstart="{drag}"
        
        style="
            width: {3*zoom}vh;
            height: {3*zoom}vh;

            --col: {
                widgetData.actionButtonColors && widgetData.actionButtonColors.topLeft ?
                    widgetData.actionButtonColors.topLeft :
                    "var(--red)"
            };
    ">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M278.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-64 64c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l9.4-9.4V224H109.3l9.4-9.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-64 64c-12.5 12.5-12.5 32.8 0 45.3l64 64c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-9.4-9.4H224V402.7l-9.4-9.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l64 64c12.5 12.5 32.8 12.5 45.3 0l64-64c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-9.4 9.4V288H402.7l-9.4 9.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l64-64c12.5-12.5 12.5-32.8 0-45.3l-64-64c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l9.4 9.4H288V109.3l9.4 9.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-64-64z"/></svg>
    </div>

    <div
        class="deleteAction"
        
        on:click={handleDelete}
        
        style="
            width: {3*zoom}vh;
            height: {3*zoom}vh;

            --col: {
                widgetData.actionButtonColors && widgetData.actionButtonColors.topRight ?
                    widgetData.actionButtonColors.topRight :
                    "var(--red)"
            };
        "
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

            --col: {
                widgetData.actionButtonColors && widgetData.actionButtonColors.bottomRight ?
                    widgetData.actionButtonColors.bottomRight :
                    "var(--red)"
            };
    ">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Pro 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M32 288c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 288zm0-128c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 160z"/></svg>
    </div>

    <div 
        class="resizeAction"

        on:click={reload}
        
        style="
            width: {3*zoom}vh;
            height: {3*zoom}vh;
    ">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M142.9 142.9c62.2-62.2 162.7-62.5 225.3-1L327 183c-6.9 6.9-8.9 17.2-5.2 26.2s12.5 14.8 22.2 14.8H463.5c0 0 0 0 0 0H472c13.3 0 24-10.7 24-24V72c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2L413.4 96.6c-87.6-86.5-228.7-86.2-315.8 1C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5c7.7-21.8 20.2-42.3 37.8-59.8zM16 312v7.6 .7V440c0 9.7 5.8 18.5 14.8 22.2s19.3 1.7 26.2-5.2l41.6-41.6c87.6 86.5 228.7 86.2 315.8-1c24.4-24.4 42.1-53.1 52.9-83.7c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.2 62.2-162.7 62.5-225.3 1L185 329c6.9-6.9 8.9-17.2 5.2-26.2s-12.5-14.8-22.2-14.8H48.4h-.7H40c-13.3 0-24 10.7-24 24z"/></svg>
    </div>
</main>


<style>
    main {
        position: absolute;

        background-color: var(--mainbg);

        /* box-shadow:
            inset -.2vh -.2vh .2vh 0 var(--shadow1),
            inset .2vh .2vh .2vh 0 var(--shadow2); */

        display: grid;
        place-items: center;

        overflow: hidden;

/*         transition:
            width .2s cubic-bezier(0, 0, 0, .9),
            height .2s cubic-bezier(0, 0, 0, .9),
            border-radius .2s cubic-bezier(0, 0, 0, .9), */
    }

    .wrapper {
        position: absolute;

        top: 0;
        left: 0;

        width: 100%;
        height: 100%;
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
        fill: var(--col);
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
        fill: var(--col);
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
        fill: var(--col);
        width: 50%;
    }

    .resizeAction {
        cursor: pointer;

        position: absolute;
        top: 0;
        right: 50%;

        transform: translate(50%, -100%);

        transition: transform .25s cubic-bezier(0, 0, 0, .9);

        display: grid;
        place-items: center;

        border-radius: 50%;
        background-color: var(--velvet);
    }

    main:hover .resizeAction {
        transform: translate(50%, 0);
    }

    .resizeAction svg {
        fill: var(--mainbg);
        width: 50%;
    }
</style>