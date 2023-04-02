<svelte:options accessors />

<script>
    import { onMount } from "svelte";




    // OBJECT SPECIFIC
    export const sizeBounds = [ /* X */ [10, 50], /* Y */ [10, 50]]

    export let title;

    export let numCols = 4, numRows = 9;
    export let colNames;

    const alphabet = [  "a", "b", "c",
                        "d", "e", "f",
                        "g", "h", "i",
                        "j", "k", "l",
                        "m", "n", "o",
                        "p", "q", "r",
                        "s", "t", "u",
                        "v", "w", "x",
                        "y", "z"
                    ]
    function alphabeticColName(index) {
        return alphabet[index % 26];
    }


    export let lockedCells = [];

    function scanLocked(x, y) {
        let out = false;
        lockedCells.forEach((element) => {
            if (element[0] === x && element[1] === y) out = true;
        });
        return out;
    }
    

    export let cellContents;

    onMount(() => {
        if (!cellContents)
        cellContents = Array.from(Array(numCols), () => Array.from(new Array(numRows), () => ""));

        if (!colNames)
        colNames = [];
    });

    export function getCellContents() {
        return cellContents;
    }

    export function setCell(col, row, val) {
        cellContents[col][row] = val;
    }

    export let editmode = false;

    function deleteColumn(index) {
        if (numCols <= 1) return;
        cellContents.splice(index, 1);
        numCols--;
        cellContents = Object.assign([], cellContents);
    }

    function insertColumn(index) {
        cellContents.splice(index + 1, 0, Array.from(new Array(numRows), () => ""))
        numCols++;
        cellContents = Object.assign([], cellContents);
    }

    function moveColumnRight(index) {
        const buffer = cellContents[index + 1];
        cellContents[index + 1] = cellContents[index];
        cellContents[index] = buffer;
        cellContents = Object.assign([], cellContents);
    }

    function moveColumnLeft(index) {
        const buffer = cellContents[index - 1];
        cellContents[index - 1] = cellContents[index];
        cellContents[index] = buffer;
        cellContents = Object.assign([], cellContents);
    }

    function deleteRow(index) {
        if (numRows <= 1) return;
        cellContents.forEach((col) => {
            col.splice(index, 1);
        })
        numRows--;
        cellContents = Object.assign([], cellContents);
    }

    function insertRow(index) {
        cellContents.forEach((col) => {
            col.splice(index + 1, 0, "");
        })
        numRows++;
        cellContents = Object.assign([], cellContents);
    }

    function moveRowUp(index) {
        cellContents.forEach((col) => {
            const buffer = col[index - 1];
            col[index - 1] = col[index];
            col[index] = buffer;
        })
        cellContents = Object.assign([], cellContents);
    }

    function moveRowDown(index) {
        cellContents.forEach((col) => {
            const buffer = col[index + 1];
            col[index + 1] = col[index];
            col[index] = buffer;
        })
        cellContents = Object.assign([], cellContents);
    }

    export function rerender() {
        cellContents = Object.assign([], cellContents);
    }


    // PPROTOTYPE
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
    export let onEdit;

    export let onInput;

    function drag(event) {
        onDrag(event);
    }

    function resize(event) {
        onResize(event);
    }

    function handleDelete() {
        onDelete();
    }

    function edit() {
        onEdit();
    }
</script>



<main class="neuOutdentShadowRim" style="
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
        <h1 
            contenteditable="true" 
            bind:textContent={title}
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


    <div class="contents">
        <div class="tableGrid" style="
            width: calc(100% - {4*zoom}vh);
            height: calc(100% - {4*zoom}vh);
        ">

            <div class="rowIndicatorContainer" style="
                width: {(editmode ? 10 : 2)*zoom}vh;
                margin-top: {2*zoom}vh;
            ">
                {#each Array(numRows) as y, index}
                    <div class="rowIndicator" style="
                        height: {3*zoom}vh;

                        margin: {.2*zoom}vh 0 {.2*zoom}vh 0;

                        {editmode ? "cursor: pointer;" : ""}

                        border-top-left-radius: {.5*zoom}vh;
                        border-bottom-left-radius: {.5*zoom}vh;
                    ">
                        {#if !editmode}
                            <p style="
                                font-size: {1.5*zoom}vh;
                                height: {1.5*zoom}vh;
                            ">
                                {index + 1}
                            </p>
                        {:else}
                            <div class="editmodeRowIndicatorButtonContainer">
                                <div on:click={() => {if (editmode && index > 0) {moveRowUp(index)}}} class="editmodeRowIndicatorButton">
                                    {#if index > 0}
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Pro 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M201.4 137.4c12.5-12.5 32.8-12.5 45.3 0l160 160c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L224 205.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l160-160z"/></svg>                                
                                    {/if}
                                </div>
                                <div on:click={() => {if (editmode) {insertRow(index)}}} class="editmodeRowIndicatorButton">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Pro 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/></svg>                                </div>
                                <div on:click={() => {if (editmode) {deleteRow(index)}}} class="editmodeRowIndicatorButton">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Pro 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"/></svg>                                </div>
                                <div on:click={() => {if (editmode && index < numRows - 1) {moveRowDown(index)}}} class="editmodeRowIndicatorButton">
                                    {#if index < numRows - 1}
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Pro 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M201.4 374.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 306.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/></svg>                                
                                    {/if}
                                </div>
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>

            {#if cellContents}
                {#each cellContents as x, indexX}
                    <div class="tableGridColumn" style="
                        width: {10*zoom}vh;
                    ">
                    <div
                        class="columnIndicator" style="
                        border-top-left-radius: {.5*zoom}vh;
                        border-top-right-radius: {.5*zoom}vh;

                        {editmode ? "cursor: pointer;" : ""}

                        margin-bottom: {.5*zoom}vh;

                        height: {2*zoom}vh;
                    ">
                        {#if !editmode && colNames}
                            <p
                                contenteditable="true"
                                bind:textContent={colNames[indexX]}
                                on:keypress={(event) => {
                                    // Prevent Multiline
                                    if (event.key == "Enter") event.preventDefault();
                                }}
                                style="
                                    font-size: {1.2*zoom}vh;
                                    height: {1.5*zoom}vh;
                                ">
                            </p>
                            {#if !colNames[indexX]}
                                <p
                                    class="columnIndicatorPlaceholder"
                                    style="
                                        font-size: {1.2*zoom}vh;
                                        height: {1.5*zoom}vh;
                                    ">{alphabeticColName(indexX)}</p>
                            {/if}
                        {:else}
                            <div style="height: {2*zoom}vh;" class="editmodeColumnIndicatorButtonContainer">
                                <div on:click={() => {if (editmode && indexX > 0) {moveColumnLeft(indexX)}}} class="editmodeColumnIndicatorButton">
                                    {#if indexX > 0}
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><!--! Font Awesome Pro 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>                                
                                    {/if}
                                </div>
                                <div on:click={() => {if (editmode) {insertColumn(indexX)}}} class="editmodeColumnIndicatorButton">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Pro 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/></svg>                                
                                </div>
                                <div on:click={() => {if (editmode) {deleteColumn(indexX)}}} class="editmodeColumnIndicatorButton">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Pro 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"/></svg>                                </div>
                                <div on:click={() => {if (editmode && indexX < numCols - 1) {moveColumnRight(indexX)}}} class="editmodeColumnIndicatorButton">
                                    {#if indexX < numCols - 1}
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><!--! Font Awesome Pro 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"/></svg>                                
                                    {/if}
                                </div>
                            </div>                    
                        {/if}
                    </div>

                        {#each x as y, indexY}
                            {#if scanLocked(indexX, indexY)}
                                <div class="tableCell neuIndentShadowNarrow" style="
                                    height: {3*zoom}vh;

                                    margin: {.2*zoom}vh 0 {.2*zoom}vh 0;

                                    border-radius: {.5*zoom}vh;
                                ">
                                    <p style="font-size: {1.3 * zoom}vh">{cellContents[indexX][indexY]}</p>
                                    <div class="cellLabelContainer" style="
                                        width: {1.2*zoom}vh;
                                        height: {1.2*zoom}vh;
                                    ">
                                        <svg viewBox="0 0 1 1" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 1H0L1 0V1Z"/>
                                        </svg> 
                                    </div>
                                </div>
                            {:else}
                                <div class="tableCell neuIndentShadowNarrow" style="
                                    height: {3*zoom}vh;

                                    margin: {.2*zoom}vh 0 {.2*zoom}vh 0;

                                    border-radius: {.5*zoom}vh;
                                ">
                                    {#if editmode}
                                        <p
                                            contenteditable="true"
                                            bind:textContent={cellContents[indexX][indexY]}
                                            on:keypress={(event) => {
                                                // Prevent Multiline
                                                if (event.key == "Enter") event.preventDefault();
                                            }}

                                            on:blur={() => {onInput()}}

                                            style="font-size: {1.3*zoom}vh">
                                            {cellContents[indexX][indexY]}
                                            
                                        </p>
                                    {:else}
                                        <p
                                            style="font-size: {1.3*zoom}vh">
                                            {cellContents[indexX][indexY]}
                                        </p>
                                    {/if}
                                </div>
                            {/if}
                        {/each}
                    </div>
                {/each}
            {/if}
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

    <div
        class="editHandle"

        on:click={edit}
        
        style="
            width: {3*zoom}vh;
            height: {3*zoom}vh;
    ">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.8 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z"/></svg>
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
        display: flex;

        align-items: center;
        justify-content: center;

        overflow: hidden;
    }

    .tableGridColumn {

        flex: 1;

        margin: 0 .2vh 0 .2vh;

        flex-shrink: 0;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .columnIndicator {
        width: 100%;

        background-color: var(--red);

        display: grid;
        place-content: center;

        overflow: hidden;
    }

    .editmodeColumnIndicatorButtonContainer {
        width: 100%;
        height: 100%;

        display: flex;
    }

    .editmodeColumnIndicatorButton {
        height: 100%;
        flex: 1;

        display: grid;
        place-items: center;
    }

    .columnIndicator svg {
        fill: var(--mainbg);

        animation: flyInFromLeft .5s cubic-bezier(0, 0, 0, .9) backwards;
    }

    .editmodeColumnIndicatorButton svg {
        width: 50%;
        max-height: 75%;

        opacity: .5;

        transition: transform .5s cubic-bezier(0, 0, 0, .9), opacity .2s cubic-bezier(0, 0, 0, .9);
    }

    .columnIndicator:hover .editmodeColumnIndicatorButton svg {
        opacity: 1;
    }

    .editmodeColumnIndicatorButton:hover svg {
        transform: translateY(-.5vh);
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

        display: grid;
        place-items: center;
    }

    .rowIndicator svg {
        fill: var(--mainbg);

        animation: flyInFromLeft .5s cubic-bezier(0, 0, 0, .9) backwards;
    }

    .editmodeRowIndicatorButtonContainer {
        width: 100%;
        height: 100%;

        display: flex;
    }

    .editmodeRowIndicatorButton {
        height: 100%;
        flex: 1;

        display: grid;
        place-items: center;
    }

    .editmodeRowIndicatorButton svg {
        width: 50%;

        opacity: .5;

        transition: transform .5s cubic-bezier(0, 0, 0, .9), opacity .2s cubic-bezier(0, 0, 0, .9);
    }

    .rowIndicator:hover .editmodeRowIndicatorButton svg {
        opacity: 1;
    }

    .editmodeRowIndicatorButton:hover svg {
        transform: translateY(-.5vh);
    }

    .tableCell {
        cursor: pointer;

        position: relative;

        width: 100%;

        flex-shrink: 0;

        background-color: var(--mainbg);

        overflow: hidden;

        display: grid;
        place-items: center;
    }

    .tableCell p {
        cursor: text;

        width: 100%;
        text-align: center;

        color: var(--text1);
        font-weight: 500;
    }

    .tableCell .cellLabelContainer {
        position: absolute;
        bottom: 0;
        right: 0;
    }

    .tableCell .cellLabelContainer svg {
        width: 100%;
        fill: var(--blue);
    }

    h1 {
        color: var(--mainbg);

        font-weight: 600;

        white-space: nowrap;

        text-overflow: ellipsis;

        /* transition: 
            font-size .2s cubic-bezier(0, 0, 0, .9); */
    }

    .columnIndicator p {
        color: var(--mainbg);

        min-width: 4vh;

        font-weight: 800;

        text-align: center;

        overflow: hidden;

        animation: flyInFromLeft .5s cubic-bezier(0, 0, 0, .9) both;
    }

    .columnIndicatorPlaceholder {
        position: absolute;

        opacity: .5;
    }

    .rowIndicator p {
        color: var(--mainbg);

        font-weight: 800;

        text-align: center;

        overflow: hidden;

        animation: flyInFromLeft .5s cubic-bezier(0, 0, 0, .9) both;
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


    .editHandle {
        cursor: pointer;

        position: absolute;
        bottom: 0;
        left: 0;

        transform: translate(-100%, 100%);

        transition: transform .25s cubic-bezier(0, 0, 0, .9);

        display: grid;
        place-items: center;
    }

    main:hover .editHandle {
        transform: translate(0, 0);
    }

    .editHandle svg {
        fill: var(--red);
        width: 50%;
    }
</style>