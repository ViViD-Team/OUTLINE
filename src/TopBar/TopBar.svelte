<script>
    import TopBarCommand from "./TopBarCommand.svelte";
    import TopBarGroup from "./TopBarGroup.svelte";

    export let userSettings;

    export let toggleDebugConsole;

    let selected = null;

    export let centerView;
    export let resetZoom;
    export let refreshDevPlugins;

    export let newFile;
    export let open;
    export let save;
    export let saveAs;

    const config = [
        {
            "label": "File",
            "cmds": [
                {
                    "label": "New",
                    "func": newFile,
                },
                {
                    "label": "Open",
                    "func": open,
                },
                {
                    "label": "Save",
                    "func": save,
                },
                {
                    "label": "Save As",
                    "func": saveAs,
                },
            ]
        },
        {
            "label": "Viewport",
            "cmds": [
                {
                    "label": "Center",
                    "func": centerView
                },
                {
                    "label": "Reset Zoom",
                    "func": resetZoom
                },
            ]
        }
    ];

    const devModeConfig = [
        {
            "label": "Toggle Console",
            "func": toggleDebugConsole
        },
        {
            "label": "Refresh Dev Plugins",
            "func": refreshDevPlugins
        },
    ];

    export let settingsAction;

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
            {#each config as group, i}
                {#if selected == null || selected == i}
                    <TopBarGroup 
                        label={group.label}
                        selected={selected == i}

                        onClick={() => {selected = selected == null ? i : null}}
                    />
                    {#if selected == i}
                        {#each group.cmds as cmd}
                            <TopBarCommand
                                label={cmd.label}
                                onClick={() => {cmd.func()}}
                            />
                        {/each}
                    {/if}
                {/if}
            {/each}
            {#if userSettings.devModeEnabled}
                {#if selected == null || selected == config.length}
                    <TopBarGroup 
                        label={"Dev Mode"}
                        selected={selected == config.length}

                        onClick={() => {selected = selected == null ? config.length : null}}
                    />
                    {#if selected == config.length}
                        {#each devModeConfig as cmd}
                            <TopBarCommand
                                label={cmd.label}
                                onClick={() => {cmd.func()}}
                            />
                        {/each}
                    {/if}
                {/if}
            {/if}
        </div>
    </div>
    <div class="settingsButtonContainer" on:click={() => {
        settingsAction();
        selected = null;
    }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"/>
        </svg>
    </div>
</main>



<style>
    main {
        height: 6vh;

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

        background-color: var(--mainbg);

        display: flex;
        align-items: center;
        justify-content: flex-start;
    }

    .settingsButtonContainer {
        cursor: pointer;

        height: 2.5vw;
        width: 2.5vw;

        margin: .5vw;
        margin-right: .75vw;

        display: grid;
        place-items: center;
    }

    .settingsButtonContainer svg {
        height: 2.5vh;

        fill: var(--red);
        opacity: .75;
        
        transition: 
            opacity .5s cubic-bezier(0, 0, 0, .9),
            transform .5s cubic-bezier(0, 0, 0, .9);
    }

    .settingsButtonContainer:hover svg {
        opacity: 1;
        transform: translateY(-.2vh) rotate(60deg);
    }
    
</style>