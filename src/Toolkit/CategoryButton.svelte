<script>
    export let onClick;
    function handleClick() {
        onClick();
    }

    export let icon;
</script>



<main>
    <div class="frame neuOutdentShadow" on:click={handleClick}>
        <div class="slotContainer">
            <slot />
        </div>
    </div>
</main>



<style>
    main {
        width: 7vh;
        height: 7vh;

        display: grid;
        place-items: center;

        cursor: pointer;
    }

    .frame {
        width: 6vh;
        height: 6vh;

        border-radius: 3vh;

        background-color: var(--white);

        display: grid;
        place-items: center;
    }

    .slotContainer {
        width: 50%;
        height: 50%;

        display: grid;
        place-items: center;

        transition: transform .5s cubic-bezier(0, 0, 0, .9);
    }

    main:hover .slotContainer {
        transform: scale(.9);
    }
</style>