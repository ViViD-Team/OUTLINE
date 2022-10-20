<script>
    export let label = "Weeee";

    export let onClick;
</script>



<main on:click={onClick()} >
        <h1>{label}</h1>
</main>



<style>
    main {
        cursor: pointer;

        margin-left: 2vh;
        height: 100%;

        display: grid;
        place-items: center;
    }

    h1 {
        font-size: 1.5vh;
        font-weight: 500;

        color: var(--black);

        padding: 0 1vh 0 1vh;

        text-transform: lowercase;

        transition: color .5s cubic-bezier(0, .5, 0, 1), transform .5s cubic-bezier(0, 0, 0, .9);
    }

    main:hover h1 {
        transform: translateY(-.2vh);
        color: var(--orange);
    }
</style>