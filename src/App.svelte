<script>
	import TopBar from "./TopBar/TopBar.svelte";
	import Viewport from "./Viewport/Viewport.svelte";
	import NodeEditor from "./NodeEditor/NodeEditor.svelte";
	import Toolkit from "./Toolkit/Toolkit.svelte";
	import DebugConsole from "./DebugConsole.svelte";
    import Settings from "./Settings/Settings.svelte";
    import { onDestroy, onMount } from "svelte";
    

	const fs = require("fs");
	const path = require("path");
	const { ipcRenderer } = require("electron");


	let userSettings = getUserData();

	function getUserData() {
		const dir = ipcRenderer.sendSync("getSaveLocation");
		const location = path.join(dir, "userSettings.json");

		if (!fs.existsSync(dir)) fs.mkdirSync(dir);
		if (fs.existsSync(location)) return JSON.parse(fs.readFileSync(location));

		return JSON.parse(fs.readFileSync(path.join(__dirname, "../src/config/defaultUserSettings.json")));
	}

	async function saveUserSettings() {
		const location = path.join(ipcRenderer.sendSync("getSaveLocation"), "userSettings.json");

		fs.writeFileSync(location, JSON.stringify(userSettings));
	}

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
		"targetFilePath": "",
        "objects": {
            "header": [

            ],
            "paragraph": [

            ],

            "table": [
				
            ],
        }
    }

	function newFile() {
		edited = null;
		projectData = JSON.parse(fs.readFileSync(path.join(__dirname, "../src/config/basicTemplate.json")));
	}

	function open() {
		edited = null;
		
		let path = ipcRenderer.sendSync("getOpenFilePath");
		if (!path) return;

		// Nice try hecker :)
		let rawData = fs.readFileSync(path[0]).toString();
		rawData = rawData.replace("<script>", "");
		rawData = rawData.replace("<\/script>", "");

		projectData = JSON.parse(rawData);

		console.log(projectData);
	}

	function save() {
		if (projectData.targetFilePath) {
			let fileContents = stringifyCircularJSON(projectData);
			fs.writeFileSync(projectData.targetFilePath, fileContents);
		}
		else saveAs();
	}

	function saveAs() {
		let path = ipcRenderer.sendSync("getSaveFilePath");
		if (!path) return;

		projectData.targetFilePath = path;

		let fileContents = stringifyCircularJSON(projectData);
		fs.writeFileSync(path, fileContents);
	}

	// Removes circular references resulting from trying to serialize classes
	// ADDED:	Objects with key "reference" are no longer serialized
	//			This cuts down file size and fixed nodes being parsed as null
	const stringifyCircularJSON = obj => {
		const seen = new WeakSet();
		return JSON.stringify(obj, (k, v) => {
			if (v !== null && typeof v === 'object') {
			if (seen.has(v) || k == "reference") return;
			seen.add(v);
			}
			return v;
		});
	};

	// States //
	let edited = null;
	let settingsShown = false;
</script>

<main class="
	{	userSettings.theme == 1 || 
		(userSettings.theme == 2 && ipcRenderer.sendSync("sysDarkmode")) ?
			"darkmode" : ""
	}
">
	{#if settingsShown}
		<Settings
			closeAction={() => {
				setTimeout(() => {settingsShown = false}, 500);
				saveUserSettings();
			}}
			bind:userSettings={userSettings}
		/>
	{/if}

	<div class="mainLayout">
		<TopBar
			toggleDebugConsole={() => {debugConsoleOpen = !debugConsoleOpen}}
			centerView={centerViewport}
			resetZoom={resetZoom}

			newFile={newFile}
			open={open}
			save={save}
			saveAs={saveAs}

			settingsAction={() => {settingsShown = true}}
		/>
		<div class="centerRow">
			<Toolkit />
			<Viewport
				bind:this={viewportRef}

				projectData={projectData}
				userSettings={userSettings}
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

				userSettings={userSettings}

				bind:invokeOutputs={invokeProcessCallback}
			/>
		{/if}
	</div>
</main>

<style>
	main {
		width: 100vw;
		height: 100vh;
		background-color: var(--mainbg);

		position: relative;
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