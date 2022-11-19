<script>

</script>



<main>
    <div class="frame neuIndentShadow">

    </div>
</main>



<style>
    main {
        width: 100%;
        flex: 1;

        display: grid;
        place-items: center;

        animation: mainScale .5s cubic-bezier(0, 0, 0, .9) backwards;
    }

    @keyframes mainScale {
        from {
            flex: 0;
        }
    }

    .frame {
        width: calc(100% - 2vh);
        height: calc(100% - 2vh);

        border-radius: 2vh;

        background-color: var(--white);
    }
</style>