<script>
    import { onMount } from "svelte";
    
    export let label = "unknown";

    export let animationDelay = 0;

    export let objectType;

    export let svgContents;
    let svgSlot;
    onMount(() => {
        svgSlot.innerHTML = svgContents;
        const svg = svgSlot.querySelector("svg");
        svg.style.height = "75%";
        const path = svg.querySelector("path");
        if (!path.getAttribute("fill")) path.setAttribute("fill", "var(--red)");
    })

    function initDrag(event) {
        event.dataTransfer.setData("command", "create");
        event.dataTransfer.setData("objectType", objectType);
    }
</script>



<main draggable="true" on:dragstart="{initDrag}">
    <div class="svgContainer">
        <div bind:this={svgSlot} class="svgSlot">

        </div>
        <div class="pluginIndicatorContainer">
            <div class="pluginIndicatorCircle">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!-- Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M96 0C78.3 0 64 14.3 64 32v96h64V32c0-17.7-14.3-32-32-32zM288 0c-17.7 0-32 14.3-32 32v96h64V32c0-17.7-14.3-32-32-32zM32 160c-17.7 0-32 14.3-32 32s14.3 32 32 32v32c0 77.4 55 142 128 156.8V480c0 17.7 14.3 32 32 32s32-14.3 32-32V412.8C297 398 352 333.4 352 256V224c17.7 0 32-14.3 32-32s-14.3-32-32-32H32z"/></svg>
            </div>
        </div>
    </div>
    <div class="labelContainer">
        <h3>{label}</h3>
    </div>
    <hr>
</main>



<style>
    main {
        cursor: pointer;

        margin-top: 2vh;

        width: 10vh;
        height: 10vh;

        display: flex;
        flex-direction: column;

        animation: flyInFromLeft .5s cubic-bezier(0, 0, 0, .9) both;
    }

    .svgContainer {
        position: relative;

        width: 100%;
        flex: 3;

        display: grid;
        place-items: center;
    }

    .svgSlot {
        position: absolute;
        width: 100%;
        height: 100%;

        display: grid;
        place-items: center;
    }

    .labelContainer {
        width: 100%;
        flex: 1;

        display: grid;
        place-items: center;
    }

    h3 {
        font-size: 1.5vh;
        font-weight: 500;

        color: var(--red);

        text-align: center;
    }

    hr {
        border: none;
        border-bottom: 2px solid var(--grey);
        opacity: .5;
    }

    .pluginIndicatorContainer {
        position: absolute;

        bottom: 0;
        right: 2vh;

        width: 3vh;
        height: 3vh;

        border-radius: 1.5vh;
        background-color: var(--mainbg);

        display: grid;
        place-items: center;
    }

    .pluginIndicatorCircle {
        width: 2.5vh;
        height: 2.5vh;

        border-radius: 1.5vh;
        background-color: var(--red);

        display: grid;
        place-items: center;
    }

    .pluginIndicatorContainer svg {
        height: 2vh;

        transform: rotate(45deg);
    }

    .pluginIndicatorContainer svg path {
        fill: var(--mainbg);
    }
</style>