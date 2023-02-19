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
    background-color: {color};
">
    <p>{id}</p>
</main>



<style>
    main {
        cursor: grab;

        height: 3vh;
        width: calc(100% - 5vh);
        margin: 2.5vh;
        margin-top: .5vh;
        margin-bottom: .5vh;

        border-radius: 1vh;

        display: flex;
        align-items: center;
        justify-content: space-evenly;
    }

    main p {
        color: var(--white);
        font-weight: 600;

        text-transform: uppercase;
    }
</style>