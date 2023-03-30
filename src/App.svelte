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
							"ObjectType:" + debugInfo.objectResize[6],];

	
	// Top Bar
	let viewportRef;
	
	function centerViewport() {
		viewportRef.centerView();
	}

	function resetZoom() {
		viewportRef.resetZoom();
	}



	// Table and Nodes

	let processCallback;
	function invokeProcessCallback() {
		if (processCallback) processCallback();
	}
	
	// Project Data

	// !!! NOTICE !!! THIS CONSTELLATION IS FOR DEV PURPOSES ONLY!!!

	let projectData = {
        "objects": {
            "header": [

            ],
            "paragraph": [

            ],

            "table": [
				
            ],
        }
    }


	let edited = null;
</script>

<main>
	<div class="mainLayout">
		<TopBar
			toggleDebugConsole={() => {debugConsoleOpen = !debugConsoleOpen}}
			centerView={centerViewport}
			resetZoom={resetZoom}
		/>
		<div class="centerRow">
			<Toolkit />
			<Viewport
				bind:this={viewportRef}

				projectData={projectData}
				bind:edited={edited}

				bind:debObjectDrag={debugInfo.objectDrag}
				bind:debObjectResize={debugInfo.objectResize}

				invokeTableProcess={invokeProcessCallback}
			/>
			{#if debugConsoleOpen}
				<DebugConsole info={debugContents} />
			{/if}
		</div>
		{#if edited != null}
			<NodeEditor
				nodeData={projectData.objects["table"][edited].nodes}
				tableRef={projectData.objects["table"][edited].reference}
				tableData={projectData.objects["table"][edited]}

				bind:invokeOutputs={invokeProcessCallback}
			/>
		{/if}
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