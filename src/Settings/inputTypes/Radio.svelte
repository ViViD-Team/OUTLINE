<script>
    export let label;
    export let choices;

    export let value;
    export let onChange;
</script>



<main>
    <div class="labelContainer">
        <p>{label}</p>
    </div>
    <div class="inputContainer">
        {#each choices as choice, index}
            <div class="choiceContainer">
                <div class="radio" on:click={() => {value = index; if (onChange) onChange();}} style="
                    {value == index ? "background-color: var(--red);" : ""}
                ">
                </div>
                <p>{choice}</p>
            </div>
        {/each}
    </div>
</main>



<style>
    main {
        margin-top: 2.5vh;

        width: 100%;
        min-height: 10vh;

        display: flex;
    }

    .labelContainer {
        height: 10vh;
        flex: 4;
    }

    .labelContainer p {
        color: var(--red);
        font-size: 2vh;

        margin-left: 5vh;
    }

    .inputContainer {
        height: 100%;
        flex: 1;

        display: flex;
        flex-direction: column;
    }

    .inputContainer .choiceContainer {
        width: 100%;
        height: 2.5vh;

        display: flex;

        align-items: center;
    }

    .choiceContainer .radio {
        cursor: pointer;

        width: 1.3vh;
        height: 1.3vh;

        margin-right: 1vh;

        border-radius: 50%;
        border: .2vh solid var(--red);

        display: grid;
        place-items: center;

        transition: background-color .5s cubic-bezier(0, 0, 0, .9);
    }

    .choiceContainer p {
        font-size: 1.5vh;

        color: var(--red);
    }
</style>