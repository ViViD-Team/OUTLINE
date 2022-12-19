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

    width: {10 * zoom * 2}vh;
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
                height: {3*zoom}vh;
            " class="inputTether">
                <div style="width: {3*zoom}vh;" class="inputTetherCircleContainer">
                    <svg style="width: {2*zoom}vh; height: {2*zoom}vh;" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2.5" y="2.5" width="10" height="10" rx="5" stroke="#999999" stroke-dasharray="2 2"/>
                        <rect x="5" y="5" width="5" height="5" rx="2.5" fill="#DB6239"/>
                    </svg>
                </div>
                <div class="inputTetherLabelContainer">
                    <p style="
                        font-size: {zoom}vh;
                    ">Input Label</p>
                </div>
            </div>
        </div>


        <div class="outputs">
            <div style="
                height: {3*zoom}vh;
            " class="outputTether">
                <div style="width: {3*zoom}vh;" class="outputTetherCircleContainer">
                    <svg style="width: {2*zoom}vh; height: {2*zoom}vh;" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2.5" y="2.5" width="10" height="10" rx="5" stroke="#999999" stroke-dasharray="2 2"/>
                        <rect x="5" y="5" width="5" height="5" rx="2.5" fill="#DB6239"/>
                    </svg>
                </div>
                <div class="outputTetherLabelContainer">
                    <p style="
                        font-size: {zoom}vh;
                    ">Output Label</p>
                </div>
            </div>
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

    .inputTetherLabelContainer {
        height: 100%;
        flex: 1;

        display: flex;
        align-items: center;
    }

    .inputTetherLabelContainer p {
        color: var(--orange);

        white-space: nowrap;
        font-weight: 800;
    }



    .outputs {
        height: 100%;
        flex: 1;

        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .outputTether {
        width: 100%;
        
        display: flex;
        flex-direction: row-reverse;
    }

    .outputTetherCircleContainer {
        height: 100%;

        display: grid;
        place-items: center;
    }

    .outputTetherLabelContainer {
        height: 100%;
        flex: 1;

        display: flex;
        align-items: center;
        justify-content: flex-end;
    }

    .outputTetherLabelContainer p {
        color: var(--orange);

        white-space: nowrap;
        font-weight: 800;
    }
</style>