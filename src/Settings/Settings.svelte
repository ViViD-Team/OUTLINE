<script>
    import SettingsCategory from "./SettingsCategory.svelte";

    import Radio from "./inputTypes/Radio.svelte";

    import PluginManager from "./PluginManager.svelte";
    import DevModePannel from "./DevModePannel.svelte";
    import Toggle from "./inputTypes/Toggle.svelte";

    export let closeAction;
    let opened = true;
    function closeRoutine() {
        closeAction();
        opened = false;
    }

    let selected = 0;


    export let userSettings;
</script>



<main class="{opened ? "" : "deblur"}">
    {#if userSettings.settings_theme == 1}
    <div class="plainBackgroundAgent {opened ? "" : "disappear"}"></div>
    {:else}
    <div class="blurAgent {opened ? "" : "deblur"}"></div>
    {/if}
    <div class="mainLayoutContainer">
        <div class="top">

        </div>
        <div class="mainLayout">
            <div class="leftWing mainLayoutWing">
                <SettingsCategory
                    label="Appearance"
                    selected={selected == 0}
                    clickAction={() => {selected = 0}}
                >
                    <svg height="40%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
                        <path fill="var(--red)" d="M339.3 367.1c27.3-3.9 51.9-19.4 67.2-42.9L568.2 74.1c12.6-19.5 9.4-45.3-7.6-61.2S517.7-4.4 499.1 9.6L262.4 187.2c-24 18-38.2 46.1-38.4 76.1L339.3 367.1zm-19.6 25.4l-116-104.4C143.9 290.3 96 339.6 96 400c0 3.9 .2 7.8 .6 11.6C98.4 429.1 86.4 448 68.8 448H64c-17.7 0-32 14.3-32 32s14.3 32 32 32H208c61.9 0 112-50.1 112-112c0-2.5-.1-5-.2-7.5z"/>
                    </svg>
                </SettingsCategory>

                <SettingsCategory
                    label="Workflow"
                    selected={selected == 1}
                    clickAction={() => {selected = 1}}
                >
                <svg height="40%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
                    <path fill="var(--red)" d="M352 320c88.4 0 160-71.6 160-160c0-15.3-2.2-30.1-6.2-44.2c-3.1-10.8-16.4-13.2-24.3-5.3l-76.8 76.8c-3 3-7.1 4.7-11.3 4.7H336c-8.8 0-16-7.2-16-16V118.6c0-4.2 1.7-8.3 4.7-11.3l76.8-76.8c7.9-7.9 5.4-21.2-5.3-24.3C382.1 2.2 367.3 0 352 0C263.6 0 192 71.6 192 160c0 19.1 3.4 37.5 9.5 54.5L19.9 396.1C7.2 408.8 0 426.1 0 444.1C0 481.6 30.4 512 67.9 512c18 0 35.3-7.2 48-19.9L297.5 310.5c17 6.2 35.4 9.5 54.5 9.5zM80 408a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/>
                </svg>
                </SettingsCategory>

                <SettingsCategory
                    label="Plugins"
                    selected={selected == 2}
                    clickAction={() => {selected = 2}}
                >
                <svg xmlns="http://www.w3.org/2000/svg" height="40%" viewBox="0 0 384 512">
                    <path fill="var(--red)" d="M96 0C78.3 0 64 14.3 64 32v96h64V32c0-17.7-14.3-32-32-32zM288 0c-17.7 0-32 14.3-32 32v96h64V32c0-17.7-14.3-32-32-32zM32 160c-17.7 0-32 14.3-32 32s14.3 32 32 32v32c0 77.4 55 142 128 156.8V480c0 17.7 14.3 32 32 32s32-14.3 32-32V412.8C297 398 352 333.4 352 256V224c17.7 0 32-14.3 32-32s-14.3-32-32-32H32z"/>
                </svg>
                </SettingsCategory>

                <SettingsCategory
                    label="Dev Mode"
                    selected={selected == 3}
                    clickAction={() => {selected = 3}}
                >
                <svg xmlns="http://www.w3.org/2000/svg" height="40%" viewBox="0 0 640 512">
                    <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
                    <path fill="var(--red)" d="M392.8 1.2c-17-4.9-34.7 5-39.6 22l-128 448c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l128-448c4.9-17-5-34.7-22-39.6zm80.6 120.1c-12.5 12.5-12.5 32.8 0 45.3L562.7 256l-89.4 89.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l112-112c12.5-12.5 12.5-32.8 0-45.3l-112-112c-12.5-12.5-32.8-12.5-45.3 0zm-306.7 0c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3l112 112c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256l89.4-89.4c12.5-12.5 12.5-32.8 0-45.3z"/>
                </svg>
                </SettingsCategory>
            </div>

            <div class="center">
                <div class="dashLeft dash"></div>
                <div class="dashRight dash"></div>

                {#if selected === 0}

                    <Radio 
                        label="Interface Theme"
                        choices={["Light", "Dark", "Use System"]}
                        bind:value={userSettings.theme}
                    />
                    <Radio
                        label="Settings Background"
                        choices={["Background Blur", "Basic"]}
                        bind:value={userSettings.settings_theme}
                    />

                {/if}
                {#if selected === 1}

                    <Radio
                        label="Preferred Navigation Button"
                        choices={["Left Mouse Button", "Middle Mouse Button (Wheel)", "Right Mouse Button", "Any"]}
                        bind:value={userSettings.preferred_navigation_mb}
                    />

                    <Toggle
                        label="Show Widget Delete Warning"
                        bind:value={userSettings.show_widget_delete_modal}
                    />

                    <Toggle
                        label="Show Node Delete Warning"
                        bind:value={userSettings.show_node_delete_modal}
                    />

                {/if}
                {#if selected === 2}
                    <PluginManager />
                {/if}
                {#if selected === 3}
                    <DevModePannel userSettings={userSettings} />
                {/if}
            </div>

            <div class="rightWing mainLayoutWing">

            </div>
        </div>
        <div class="bottom">
            <button class="close" on:click={closeRoutine}>
                Close Settings
            </button>
        </div>
    </div>
</main>



<style>
    main {
        z-index: 100;

        position: absolute;
        width: 100%;
        height: 100%;
    }

    .blurAgent {
        position: absolute;
        width: 100%;
        height: 100%;

        background: #ffffff00;

        backdrop-filter: blur(1vh) saturate(.5);

        will-change: backdrop-filter;

        animation: backgroundBlur .5s backwards;
    }

    .blurAgent.deblur {
        animation: backgroundDeblur .5s forwards;
    }

    .plainBackgroundAgent {
        position: absolute;
        width: 100%;
        height: 100%;

        background-color: var(--mainbg);

        animation: appear .5s backwards;
    }

    .plainBackgroundAgent.disappear {
        animation: disappear .5s forwards;
    }

    main .mainLayoutContainer {
        animation: appear .2s backwards .3s;
    }

    main.deblur .mainLayoutContainer {
        animation: disappear .2s forwards;
    }

    @keyframes appear {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    @keyframes disappear {
        to {
            opacity: 0;
        }
    }

    @keyframes backgroundBlur {
        from {
            backdrop-filter: blur(0) saturate(1);
        }
        to {
            backdrop-filter: blur(1vh) saturate(.5);
        }
    }

    @keyframes backgroundDeblur {
        from {
            backdrop-filter: blur(1vh) saturate(.5);
        }
        to {
            backdrop-filter: blur(0) saturate(1);
        }
    }


    .mainLayoutContainer {
        position: absolute;

        width: 100%;
        height: 100%;

        display: flex;
        flex-direction: column;
    }

    .top {
        width: 100%;
        height: 10vh;
    }

    .bottom {
        width: 100%;
        height: 10vh;

        display: grid;
        place-items: center;
    }

    .mainLayout {
        width: 100%;
        flex: 1;

        display: flex;
    }

    .center {
        position: relative;

        height: 100%;
        flex: 2;

        display: flex;
        flex-direction: column;

        overflow-x: hidden;
        overflow-y: scroll;
    }

    .center::-webkit-scrollbar {
        display: none;
    }

    .dash {
        position: absolute;

        top: 0;

        height: 100%;
        width: .2vh;

        background-color: var(--shadow1);
        border-radius: .1vh;
    }

    .dashLeft {
        left: 0;
    }

    .dashRight {
        right: 0;
    }

    .mainLayoutWing {
        height: 100%;
        flex: 1;
    }

    .leftWing {
        display: flex;
        flex-direction: column;

        justify-content: center;
    }


    button.close {
        cursor: pointer;

        width: 20vw;
        height: 50%;

        border: none;
        outline: none;
        background-color: var(--red);
        border-radius: 2vh;

        color: var(--mainbg);
        font-size: 2vh;

        transition: transform .5s cubic-bezier(0, 0, 0, .9);
    }

    button.close:hover {
        transform: translateY(-.2vh);
    }
</style>