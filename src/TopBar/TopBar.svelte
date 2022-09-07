<script>

</script>



<main>
    <div class="logoContainer">
        <svg viewBox="0 0 85 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M35 55H5V5H55V55H80" stroke="url(#paint0_linear_109_17)" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
            <defs>
            <linearGradient id="paint0_linear_109_17" x1="55" y1="5" x2="55" y2="55" gradientUnits="userSpaceOnUse">
            <stop stop-color="#EC2351"/>
            <stop offset="1" stop-color="#DB6239"/>
            </linearGradient>
            </defs>
        </svg>
    </div>
    <div class="frameContainer">
        <div class="frame neuIndentShadow">

        </div>
    </div>
</main>



<style>
    main {
        height: 5vh;

        display: flex;
        align-items: center;
        justify-content: center;
    }

    .logoContainer {
        height: 2.5vw;
        width: 2.5vw;

        margin: .5vw;
        margin-left: .75vw;

        border-radius: 2vh;

        display: grid;
        place-items: center;
    }

    .logoContainer svg {
        width: 3vh;
    }

    .frameContainer {
        flex: 1;
        height: 100%;

        display: grid;
        place-items: center;
    }

    .frame {
        width: calc(100% - 2vh);
        height: calc(100% - 2vh);

        border-radius: 2vh;

        background-color: var(--white);
    }
</style>