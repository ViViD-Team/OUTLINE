<script>
    export let id;
    export let type;

    export let color;

    function initDrag(event) {
        event.dataTransfer.setData("command", "createNode");
        event.dataTransfer.setData("nodeID", id);
        event.dataTransfer.setData("nodeType", type);
    }
</script>



<main draggable="true" on:dragstart="{initDrag}" style="
    border-color: {color};
">
    <p style="color: {color};">{id}</p>
</main>



<style>
    main {
        cursor: grab;

        height: 3vh;
        width: calc(100% - 5vh);
        margin: 2.5vh;
        margin-top: .5vh;
        margin-bottom: .5vh;

        flex-shrink: 0;

        border-radius: 1vh;
        border-width: .25vh;
        border-style: solid;

        display: flex;
        align-items: center;
        justify-content: space-evenly;
    }

    main p {
        font-weight: 600;

        text-transform: uppercase;
    }
</style>