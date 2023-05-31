<script>
    import { onMount } from "svelte";

    // error || warning || note // 
    export let type = "note";
    const bgLookup = {
        "error": "var(--red)",
        "warning": "var(--orange)",
        "note": "var(--velvet)",
    }

    export let message;
    export let onClose;
</script>



<main style="background-color: {bgLookup[type]};">
    <div class="iconContainer">
        {#if type == "note"}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M123.6 391.3c12.9-9.4 29.6-11.8 44.6-6.4c26.5 9.6 56.2 15.1 87.8 15.1c124.7 0 208-80.5 208-160s-83.3-160-208-160S48 160.5 48 240c0 32 12.4 62.8 35.7 89.2c8.6 9.7 12.8 22.5 11.8 35.5c-1.4 18.1-5.7 34.7-11.3 49.4c17-7.9 31.1-16.7 39.4-22.7zM21.2 431.9c1.8-2.7 3.5-5.4 5.1-8.1c10-16.6 19.5-38.4 21.4-62.9C17.7 326.8 0 285.1 0 240C0 125.1 114.6 32 256 32s256 93.1 256 208s-114.6 208-256 208c-37.1 0-72.3-6.4-104.1-17.9c-11.9 8.7-31.3 20.6-54.3 30.6c-15.1 6.6-32.3 12.6-50.1 16.1c-.8 .2-1.6 .3-2.4 .5c-4.4 .8-8.7 1.5-13.2 1.9c-.2 0-.5 .1-.7 .1c-5.1 .5-10.2 .8-15.3 .8c-6.5 0-12.3-3.9-14.8-9.9c-2.5-6-1.1-12.8 3.4-17.4c4.1-4.2 7.8-8.7 11.3-13.5c1.7-2.3 3.3-4.6 4.8-6.9c.1-.2 .2-.3 .3-.5z"/></svg>
        {/if}
        {#if type == "warning"}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/></svg>
        {/if}
        {#if type == "error"}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M37.6 4.2C28-2.3 15.2-1.1 7 7s-9.4 21-2.8 30.5l112 163.3L16.6 233.2C6.7 236.4 0 245.6 0 256s6.7 19.6 16.6 22.8l103.1 33.4L66.8 412.8c-4.9 9.3-3.2 20.7 4.3 28.1s18.8 9.2 28.1 4.3l100.6-52.9 33.4 103.1c3.2 9.9 12.4 16.6 22.8 16.6s19.6-6.7 22.8-16.6l33.4-103.1 100.6 52.9c9.3 4.9 20.7 3.2 28.1-4.3s9.2-18.8 4.3-28.1L392.3 312.2l103.1-33.4c9.9-3.2 16.6-12.4 16.6-22.8s-6.7-19.6-16.6-22.8L388.9 198.7l25.7-70.4c3.2-8.8 1-18.6-5.6-25.2s-16.4-8.8-25.2-5.6l-70.4 25.7L278.8 16.6C275.6 6.7 266.4 0 256 0s-19.6 6.7-22.8 16.6l-32.3 99.6L37.6 4.2z"/></svg>
        {/if}
    </div>
    <div class="textContainer">
        <p>{message}</p>
    </div>
    <div class="actionsContainer">
        <div class="closeAction" on:click="{onClose()}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
        </div>
    </div>
</main>



<style>
    main {
        margin-bottom: 2vh;

        width: calc(100% - 4vh);


        border-radius: 2vh;

        display: flex;

        animation: flyIn .5s cubic-bezier(0, 0, 0, .9);
    }

    @keyframes flyIn {
        from {
            transform: translateX(5vh);
            opacity: 0;
        }
    }

    .iconContainer {
        height: 100%;
        width: 5vh;

        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .iconContainer svg {
        width: 2vh;
        margin-top: 1.5vh;
    }

    .iconContainer svg path {
        fill: var(--mainbg);
    }

    .textContainer {
        height: 100%;
        flex: 1;
        margin-right: 1vh;

        display: flex;
    }

    .textContainer p {
        color: var(--mainbg);

        margin-top: 1.5vh;
        margin-bottom: 1.5vh;
        max-height: calc(100% - 1vh);

        font-weight: 500;
        font-size: 1.5vh;
    }

    .actionsContainer {
        height: 100%;
        width: 5vh;

        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .closeAction {
        cursor: pointer;

        width: 5vh;
        height: 5vh;

        display: grid;
        place-items: center;
    }

    .closeAction svg {
        width: 1.5vh;
    }

    .closeAction svg path {
        fill: var(--mainbg);
        opacity: 0;

        transition: opacity .5s cubic-bezier(0, 0, 0, .9);
    }

    main:hover .closeAction svg path {
        opacity: 1;
    }
</style>