<script>
    export let label;

    export let onPress;
</script>



<main>
    <div class="labelContainer">
        
    </div>
    <div class="inputContainer" on:click={onPress}>
        <div class="button">
            <p>{label}</p>
        </div>
    </div>
</main>



<style>
    main {
        margin-top: 2.5vh;

        width: 100%;
        height: 8vh;

        display: flex;
    }

    .inputContainer {
        margin-right: 5vh;
        
        height: 100%;
        flex: 1;

        display: flex;
        align-items: center;
        justify-content: flex-end;
    }


    .button {
        cursor: pointer;

        padding: .75vh;
        padding-left: 1.5vh;
        padding-right: 1.5vh;

        border-radius: 1vh;
        background-color: var(--red);

        transition: transform .5s cubic-bezier(0, 0, 0, .9);
    }

    .button:hover {
        transform: translateY(-.2vh);
    }

    .button p {
        color: var(--mainbg);
        font-size: 1.75vh;
        font-weight: 600;
    }
</style>