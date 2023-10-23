<script>
    export let label;

    export let value;
    export let onChange;
</script>



<main>
    <div class="labelContainer">
        <p>{label}</p>
    </div>
    <div class="inputContainer">
        <div class="toggle" on:click={() => {
            value = !value;
            if (onChange) onChange();
        }}>
            <div style="
                background-color: {value ? "var(--red)" : "var(--text1)"};
                opacity: {value ? "1" : ".5"};
                {value || true ? "" : "filter: brightness(.5) saturate(.5);"}
            " class="toggleRail">

                <div style="
                    margin-left: {value ? "3.25" : ".25"}vh;
                    background-color: {value ? "var(--white)" : "var(--mainbg)"};
                " class="toggleHandle"></div>
            
            </div>
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

    .labelContainer {
        height: 8vh;
        flex: 3;

        display: flex;
        align-items: center;
    }

    .labelContainer p {
        color: var(--red);
        font-size: 2vh;

        margin-left: 5vh;
    }

    .inputContainer {
        margin-right: 5vh;
        
        height: 100%;
        width: 8vh;

        display: grid;
        place-items: center;
    }


    .toggle {
        cursor: pointer;

        width: 8vh;
        height: 4vh;


        border-radius: 2vh;

        display: grid;
        place-items: center;
    }

    .toggleRail {
        width: 6vh;
        height: 3vh;

        border-radius: 1.5vh;

        transition: 
            background-color .5s,
            filter .5s,
            opacity .5s;

        display: flex;
        align-items: center;
    }

    .toggleHandle {
        margin: .25vh;

        width: 2.5vh;
        height: 2.5vh;

        background-color: var(--text1);
        border-radius: 1.5vh;

        transition: margin-left .5s cubic-bezier(0, 0, 0, .9), background-color .5s cubic-bezier(0, 0, 0, .9);
    }
</style>