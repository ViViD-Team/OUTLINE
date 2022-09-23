<script>
    export let label = "unknown";

    export let objectType;

    function initDrag(event) {
        event.dataTransfer.setData("command", "create");
        event.dataTransfer.setData("objectType", objectType);
    }
</script>



<main draggable="true" on:dragstart="{initDrag}">
    <div class="svgContainer">
        <slot />
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
    }

    hr {
        border: none;
        border-bottom: 2px solid var(--grey);
        opacity: .5;
    }
</style>