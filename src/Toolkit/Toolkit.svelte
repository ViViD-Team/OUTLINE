<script>
    import CategoryButton from "./CategoryButton.svelte"

    let category = null;
</script>



<main>
    {#if category == null}
        <div class="categoryButtonLayout">
            <CategoryButton>
                
            </CategoryButton>
        </div>
    {:else}
        <div class="listFrame neuOutdentShadow">

        </div>
    {/if}
</main>



<style>
    main {
        height: 100%;
        width: 7.5vw;

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
    }
</style>