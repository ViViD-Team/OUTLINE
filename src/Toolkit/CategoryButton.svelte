<script>
    export let onClick;
    function handleClick() {
        onClick();
    }

    export let label = "Label";
</script>



<main>
    <div class="frame neuOutdentShadow" on:click={handleClick}>
        <div class="slotContainer">
            <slot />
        </div>
        <div class="labelContainer">
            <h1>{label}</h1>
        </div>
    </div>
</main>



<style>
    main {
        position: relative;

        width: 7vh;
        height: 7vh;

        display: grid;
        place-items: center;

        overflow: hidden;

        cursor: pointer;
        
        margin: 2vh 0 2vh 0;
    }

    main:hover {
        width: 80%;
    }

    .labelContainer {
        position: absolute;

        width: 100%;
        height: 100%;

        overflow: hidden;

        display: grid;
        place-items: center;
    }

    h1 {
        color: var(--red);

        font-size: 1.5vh;

        transform: translateX(-1vh);
        opacity: 0;

        transition: transform .2s cubic-bezier(0, 0, 0, .9), opacity .2s cubic-bezier(0, 0, 0, .9);
    }

    main:hover h1 {
        opacity: 1;
        transform: translateX(0);

        transition: transform .2s cubic-bezier(0, 0, 0, .9) .2s, opacity .2s cubic-bezier(0, 0, 0, .9) .2s;
    }

    .frame {
        width: 6vh;
        height: 6vh;

        border-radius: 3vh;

        background-color: var(--bg2);

        display: flex;
        justify-content: center;
        align-items: center;

        overflow: hidden;

        transition: box-shadow 1s cubic-bezier(0, 0, 0, .9);
    }

    main:hover .frame {
        box-shadow: none;
    }

    .slotContainer {
        width: 40%;
        height: 40%;

        display: grid;
        place-items: center;

        transition: transform .2s cubic-bezier(0, 0, 0, .9) .2s, opacity .2s cubic-bezier(0, 0, 0, .9) .2s;
    }

    main:hover .slotContainer {
        transform: translateX(1vh);
        opacity: 0;

        transition: transform .2s cubic-bezier(0, 0, 0, .9), opacity .2s cubic-bezier(0, 0, 0, .9);
    }
</style>