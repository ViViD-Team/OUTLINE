<script>
    export let info = [];
</script>



<main>
    <div class="frame neuIndentShadow">
        {#each info as line}
            <p>{line}</p>
        {/each}
    </div>
</main>



<style>
    main {
        height: 100%;
        flex: .2;

        display: grid;
        place-items: center;
    }

    .frame {
        width: calc(100% - 2vh);
        height: calc(100% - 2vh);

        border-radius: 2vh;

        background-color: var(--mainbg);

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
    }

    p {
        width: 90%;
    }

    p:first-child {
        margin-top: 2vh;
    }
</style>