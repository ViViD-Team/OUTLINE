<script>
	import TopBar from "./TopBar/TopBar.svelte";
	import Viewport from "./Viewport/Viewport.svelte";
	import NodeEditor from "./NodeEditor/NodeEditor.svelte";
	import Toolkit from "./Toolkit/Toolkit.svelte";
	import DebugConsole from "./DebugConsole.svelte";

	// DEBUG CONSOLE

	let debugConsoleOpen = false;

	let debugInfo = {
		"objectDrag": [],
		"objectResize": []
	};

	$: debugContents = [	"::Object Drag::",
							"Ongoing:" + debugInfo.objectDrag[0], 
							"StartX:" + debugInfo.objectDrag[1],
							"StartY:" + debugInfo.objectDrag[2],
							"DeltaX:" + debugInfo.objectDrag[3],
							"DeltaY:" + debugInfo.objectDrag[4],
							"LayerX:" + debugInfo.objectDrag[5],
							"LayerY:" + debugInfo.objectDrag[6],
							"ObjectID:" + debugInfo.objectDrag[7],
							"ObjectType:" + debugInfo.objectDrag[8],
							"---",
							"::Object Resize::",
							"Ongoing:" + debugInfo.objectResize[0], 
							"StartX:" + debugInfo.objectResize[1],
							"StartY:" + debugInfo.objectResize[2],
							"DeltaX:" + debugInfo.objectResize[3],
							"DeltaY:" + debugInfo.objectResize[4],
							"ObjectID:" + debugInfo.objectResize[5],
							"ObjectType:" + debugInfo.objectResize[6],]
</script>

<main>
	<div class="mainLayout">
		<TopBar
			toggleDebugConsole={() => {debugConsoleOpen = !debugConsoleOpen}}
		/>
		<div class="centerRow">
			<Toolkit />
			<Viewport
				bind:debObjectDrag={debugInfo.objectDrag}
				bind:debObjectResize={debugInfo.objectResize}
			/>
			{#if debugConsoleOpen}
				<DebugConsole info={debugContents} />
			{/if}
		</div>
		<NodeEditor />
	</div>
</main>

<style>
	main {
		width: 100vw;
		height: 100vh;
		background-color: var(--white);
	}

	/* MAIN APP LAYOUT */
	.mainLayout {
		position: absolute;
		height: 100vh;
		width: 100vw;

		display: flex;
		flex-direction: column;
		
		overflow: hidden;
	}

	.centerRow {
		width: 100%;
		flex: 2;

		display: flex;
	}
</style>