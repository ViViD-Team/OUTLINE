<script>
    export let posX = 0;
    export let posY = 0;
    export let offX = 0;
    export let offY = 0;
    export let zoom = 1;
</script>



<main class="neuOutdentShadowRim" style="
    left: {(posX * zoom + offX) * 2}vh;
    top: {(posY * zoom + offY) * 2}vh;

    width: {8 * zoom * 2}vh;
    height: {5 * zoom * 2}vh;

    border-radius: {zoom}vh;
">
    <div class="titleBar" style="
        height: {3*zoom}vh;
    ">
        <h1 style="
            font-size: {1.5*zoom}vh;
            margin-left: {zoom}vh;
        ">Node Title</h1>
    </div>
    <div class="contents">
        <div class="inputs">
            <div style="
                height: {2*zoom}vh;
            " class="inputTether">
                <div style="width: {2*zoom}vh;" class="inputTetherCircleContainer">
                    <div style="
                        border-width: {.2*zoom}vh;
                        width: {1.50*zoom}vh;
                        height: {1.50*zoom}vh;
                    " class="inputTetherCircleOutline">
                        <div style="
                            width: {.75*zoom}vh;
                            height: {.75*zoom}vh;
                        " class="inputTetherCircle"></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="outputs">

        </div>
    </div>
</main>



<style>
    main {
        position: absolute;

        background-color: var(--white);

        overflow: hidden;

        display: flex;
        flex-direction: column;
    }

    .titleBar {
        width: 100%;

        background-color: var(--orange);

        display: flex;
        align-items: center;
        justify-content: flex-start;
    }

    .titleBar h1 {
        color: var(--white);
        font-weight: 600;
    }



    .contents {
        width: 100%;
        flex: 1;

        display: flex;
    }


    .inputs {
        height: 100%;
        flex: 1;

        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .inputTether {
        width: 100%;
        
        display: flex;
    }

    .inputTetherCircleContainer {
        height: 100%;

        display: grid;
        place-items: center;
    }

    .inputTetherCircleOutline {
        border-radius: 50%;

        border-color: var(--grey);
        border-style: dashed;

        display: grid;
        place-items: center;
    }

    .inputTetherCircle {
        border-radius: 50%;

        background-color: var(--orange);
    }


    .outputs {
        height: 100%;
        flex: 1;

        display: flex;
        flex-direction: column;
        justify-content: center;
    }
</style>