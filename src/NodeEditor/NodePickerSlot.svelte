<script>
    export let id;
    export let type;

    export let color;

    function initDrag(event) {
        event.dataTransfer.setData("command", "createNode");
        event.dataTransfer.setData("nodeID", id);
        event.dataTransfer.setData("nodeType", type);

        event.dataTransfer.setDragImage(event.target, -30, 0);
    }

    function parse(string) {
        const [pluginID, nodeID] = string.split(":");
        return nodeID ? splitCamelCase(nodeID) : splitCamelCase(string);
    }

    function splitCamelCase(string) {
        let spread = string.split("");
        let out = "";
        spread.forEach((letter) => {
            if (letter == letter.toUpperCase()) out += " ";
            out += letter;
        });
        return out;
    }
</script>



<main draggable="true" on:dragstart="{initDrag}" style="
    border-color: {color};
">
    <p style="color: {color};">{parse(id)}</p>
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