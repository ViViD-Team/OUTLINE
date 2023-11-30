<script>
    import { action_destroyer } from "svelte/internal";

    export let data;
    export let pop;
</script>



<main>
    <div class="modal">
        <h1>{data.title}</h1>
        <p>
            {data.description}
        </p>
        <div class="actions">
            {#each data.actions as action}
                <button
                    class="{action.emphasized ? "emphasized" : ""}"
                    on:click={() => {
                        action.action();
                        pop();
                    }}
                >
                    {action.label}
                </button>
            {/each}
        </div>    
    </div>
</main>



<style>
    main {
        /* Since settings are on z 100, modals must be higher */
        z-index: 150;

        position: absolute;

        width: 100%;
        height: 100%;

        backdrop-filter: brightness(.5);

        display: grid;
        place-items: center;
    }

    .modal {
        width: 60vh;
        height: 30vh;

        background-color: var(--mainbg);
        border-radius: 4vh;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
    }

    h1 {
        margin-top: 2vh;
        margin-bottom: 1vh;
        max-width: calc(100% - 8vh);

        font-size: 3vh;

        color: var(--red);
        white-space: nowrap;
    }

    p {
        max-width: calc(100% - 8vh);
        max-height: 50%;

        color: var(--text1);
        text-align: justify;

        overflow: hidden;
    }

    .actions {
        margin-top: 2vh;
        margin-bottom: 2vh;

        height: 6vh;
        width: calc(100% - 6vh);

        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    button {
        all: unset;

        cursor: pointer;

        padding-left: 2vh;
        padding-right: 2vh;
        
        height: 4vh;

        background-color: var(--mainbg);
        box-shadow: inset var(--red) 0 0 0 .25vh;
        border-radius: 2vh;

        display: grid;
        place-items: center;

        text-align: center;

        color: var(--red);
        font-weight: 600;

        transition: transform .5s cubic-bezier(0, 0, 0, .9);
    }

    button:hover, button:focus {
        transform: translateY(-.2vh);
    }

    button:focus {
        outline-color: var(--red);
        outline-offset: .2vh;
        outline-width: .1vh;
        outline-style: solid;
    }

    button.emphasized {
        box-shadow: none;

        background-color: var(--red);
        color: var(--mainbg);
    }

</style>