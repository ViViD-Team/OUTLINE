<script>
    import CategoryButton from "./CategoryButton.svelte";
    import ToolkitWidget from "./ToolkitWidget.svelte";

    let category = 0;
</script>



<main>
    {#if category == null}
        <div class="categoryButtonLayout">
            <CategoryButton onClick={() => {category = 0}}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                    <path fill="var(--red)" d="M254 52.8C249.3 40.3 237.3 32 224 32s-25.3 8.3-30 20.8L57.8 416H32c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32h-1.8l18-48H303.8l18 48H320c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H390.2L254 52.8zM279.8 304H168.2L224 155.1 279.8 304z"/>
                </svg>
            </CategoryButton>
        </div>
    {:else}
        <div class="listFrame neuOutdentShadow">
            <ToolkitWidget 
                label="Test"
                objectType="header"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                    <path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zM336 152V256 360c0 13.3-10.7 24-24 24s-24-10.7-24-24V280H160l0 80c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-208c0-13.3 10.7-24 24-24s24 10.7 24 24v80H288V152c0-13.3 10.7-24 24-24s24 10.7 24 24z"/>
                </svg>
            </ToolkitWidget>
        </div>
    {/if}
</main>



<style>
    main {
        height: 100%;
        width: 15vh;

        display: grid;
        place-items: center;
    }

    /* CATEGORY SELECTION */
    .categoryButtonLayout {
        width: 100%;
        height: 100%;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .listFrame {
        width: calc(100% - 2vh);
        height: calc(100% - 2vh);

        border-radius: 2vh;

        display: flex;
        justify-content: center;
    }

    .listFrame svg {

        height: 75%;

        fill: var(--red);
    }
</style>