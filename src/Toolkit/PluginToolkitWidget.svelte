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
    <div bind:this={svgSlot} class="svgContainer">
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
        width: 100%;
        flex: 3;

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
</style>