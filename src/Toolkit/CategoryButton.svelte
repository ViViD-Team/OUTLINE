<script>
    export let onClick;

    function handleClick() {
        onClick();
    }
</script>



<main>
    <div class="frame neuOutdentShadow">
        <slot />
    </div>
</main>



<style>
    main {
        width: 7vh;
        height: 7vh;

        display: grid;
        place-items: center;
    }

    .frame {
        width: 6vh;
        height: 6vh;

        border-radius: 3vh;

        background-color: var(--white);
    }
</style>