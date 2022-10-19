<script>
    export let label = "Weeee";
    export let selected = false;

    export let onClick;
</script>



<main on:click={onClick()} style="
        {selected ? "background-color: var(--red);" : ""}
    ">
        <h1 style="{selected ? "color: var(--white);" : ""}">{label}</h1>
</main>



<style>
    main {
        cursor: pointer;

        margin-left: 2vh;
        height: 75%;

        border-radius: 1vh;

        display: grid;
        place-items: center;

        transition: background-color .5s cubic-bezier(0, .9, 0, 1);
    }

    h1 {
        font-size: 1.5vh;

        color: var(--red);

        padding: 0 1vh 0 1vh;

        text-transform: uppercase;

        transition: color .5s cubic-bezier(0, .9, 0, 1), transform .5s cubic-bezier(0, 0, 0, .9);
    }

    main:hover h1 {
        transform: translateY(-.2vh);
    }
</style>