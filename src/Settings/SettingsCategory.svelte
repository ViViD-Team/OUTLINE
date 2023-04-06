<script>
    export let label;
    export let selected;
    export let clickAction;
</script>



<main on:click={clickAction} style="
    opacity: {selected ? "1" : ".5"};
    transform: translateX({selected ? ".2" : "0"}vh);
">
    <div class="iconContainer">
        <slot></slot>
    </div>
    <div class="descriptionContainer">
        <p>{label}</p>
    </div>
</main>



<style>
    main {
        cursor: pointer;

        width: 50%;
        height: 5vh;

        margin-left: 50%;

        display: flex;

        transition: opacity .5s, transform .5s cubic-bezier(0, 0, 0, .9);
    }

    .iconContainer {
        height: 5vh;
        width: 5vh;

        display: grid;
        place-items: center;
    }

    .descriptionContainer {
        height: 100%;
        flex: 1;

        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .descriptionContainer p {
        color: var(--red);

        font-size: 2vh;
    }
</style>