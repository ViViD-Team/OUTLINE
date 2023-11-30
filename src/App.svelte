<script>
	import TopBar from "./TopBar/TopBar.svelte";
	import Viewport from "./Viewport/Viewport.svelte";
	import NodeEditor from "./NodeEditor/NodeEditor.svelte";
	import Toolkit from "./Toolkit/Toolkit.svelte";
	import DebugConsole from "./DebugConsole.svelte";
    import Settings from "./Settings/Settings.svelte";
	import NotificationCard from "./NotificationCard.svelte";
    import { onDestroy, onMount } from "svelte";
    import Modal from "./Modal.svelte";
    

	const fs = require("fs");
	const path = require("path");
	const { ipcRenderer } = require("electron");


	let userSettings = getUserData();

	/**
	 * Fetches the user settings data.
	 * If the settings json can not be found,
	 * the default settings will be loaded.
	 * 
	 * @returns {Object} The user settings
	 */
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


	
	// Top Bar
	let viewportRef, toolkitRef;
	
	function centerViewport() {
		viewportRef.centerView();
	}

	function resetZoom() {
		viewportRef.resetZoom();
	}

	function refreshDevPlugins() {
		toolkitRef.refreshDevPlugins();
	}

	onMount(() => {
		document.onkeydown = (event) => {
			event = event || window.event;

			if (event.ctrlKey) {
				switch (event.key) {
					case "s":
					case "S":
						save();
						break;
				}
			}

		};

		document.addEventListener("notificationEvent", (event) => {
			const newObj = Object.assign({
				"delete": () => {
					notifications.splice(notifications.indexOf(this), 1);
					notifications = Object.assign([], notifications);
				},
			}, event.detail);
				notifications.push(newObj);
				setTimeout(function() {
					newObj.delete();
					notifications = Object.assign([], notifications);
			}, 10000);
			notifications = Object.assign([], notifications);
		});

		document.addEventListener("pushModal", (event) => {
			modals.push(event.detail);
			modals = [...modals];
		});
	});

	// Notifications
	let notifications = [];

	function deleteNotification(index) {
		notifications.splice(index, 1);
		notifications = Object.assign([], notifications);
	}

	ipcRenderer.on("dispatchNotification", (event, arg) => {
		const newObj = Object.assign({
			"delete": () => {
				notifications.splice(notifications.indexOf(this), 1);
				notifications = Object.assign([], notifications);
			},
		}, arg);
		notifications.push(newObj);
		setTimeout(function() {
			newObj.delete();
			notifications = Object.assign([], notifications);
		}, 10000);
		notifications = Object.assign([], notifications);
	});


	// Modals
	let modals = [
		/* 
		{
			"title": "Are you sure about that?",
			"description": "Description",
			"actions": [
				{
					"label": "Go ahead",
					"action": function() {
						console.log("Go ahead triggered");
					},
					"emphasized": false
				},
				{
					"label": "Oh no",
					"action": function() {
						console.log("Oh no triggered");
					},
					"emphasized": true
				}
			]
		}
		 */
	];




	// Table and Nodes

	let processCallback;
	function invokeProcessCallback() {
		if (processCallback) processCallback();
	}
	
	// Project Data

	let projectData = {
		"targetFilePath": "",
        "objects": {
            "header": [

            ],
            "paragraph": [

            ],

            "table": [
				
            ],

			"result": [

			],
        },
		"pluginObjects": {
			
		}
    }

	let devPluginObjects;

    function getActivatedPlugins() {
        let active = ipcRenderer.sendSync("getActivatedPlugins");
        
        let buffer = {};
        active.forEach(x => {
            buffer[x.pluginID] = x;
        });
        return buffer;
    }
	function scanForMissingPlugins() {
		const active = getActivatedPlugins();

        for (let p of Object.keys(projectData.pluginObjects)) {
			console.log(p, active);
            if (!(p in active)) {
                document.dispatchEvent(
                    new CustomEvent("notificationEvent", {detail: {
                        "type": "warning",
                        "message": "One or more plugins this project uses could not be found.       \
                                    Make sure that the required plugins are installed and enabled."
                    }})
                );
            }
        };
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

		scanForMissingPlugins();
	}

	ipcRenderer.on("openFile", (event, arg) => {
		// TODO Differentiate between .ols and .opb

		openInstant(arg);
	})
	function openInstant(path) {
		edited = null;
		console.log(path);
		if (!path) return;

		// Nice try hecker :)
		let rawData = fs.readFileSync(path).toString();
		rawData = rawData.replace("<script>", "");
		rawData = rawData.replace("<\/script>", "");

		projectData = JSON.parse(rawData);

		scanForMissingPlugins();
	}

	function save() {
		if (projectData.targetFilePath) {
			let fileContents = stringifyCircularJSON(projectData);
			fs.writeFileSync(projectData.targetFilePath, fileContents);

			document.dispatchEvent(new CustomEvent("notificationEvent", {detail: {"type": "note", "message": "File saved!"}}));
		}
		else saveAs();
	}

	function saveAs() {
		let path = ipcRenderer.sendSync("getSaveFilePath");
		if (!path) return;

		projectData.targetFilePath = path;

		let fileContents = stringifyCircularJSON(projectData);
		fs.writeFileSync(path, fileContents);

		document.dispatchEvent(new CustomEvent("notificationEvent", {detail: {"type": "note", "message": "File saved!"}}));
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

	{#if modals.length > 0}
		<Modal
			data={modals[0]}
			pop={function() {
				modals.splice(0, 1);
				modals = [...modals];
			}}
		/>
	{/if}

	{#if settingsShown}
		<Settings
			closeAction={() => {
				setTimeout(() => {settingsShown = false}, 500);
				saveUserSettings();
				toolkitRef.refreshDevPluginsSilent();
			}}
			bind:userSettings={userSettings}
		/>
	{/if}

	<div class="mainLayout">
		<TopBar
			userSettings={userSettings}

			toggleDebugConsole={() => {debugConsoleOpen = !debugConsoleOpen}}
			centerView={centerViewport}
			resetZoom={resetZoom}
			refreshDevPlugins={refreshDevPlugins}

			newFile={newFile}
			open={open}
			save={save}
			saveAs={saveAs}

			settingsAction={() => {settingsShown = true}}
		/>
		<div class="centerRow">
			<Toolkit
				bind:userSettings={userSettings}

				bind:this={toolkitRef}
			/>
			<Viewport
				bind:this={viewportRef}

				bind:projectData={projectData}
				bind:userSettings={userSettings}
				bind:edited={edited}
				bind:devPluginObjects={devPluginObjects}

				invokeTableProcess={invokeProcessCallback}
			/>
			{#if debugConsoleOpen && userSettings.devModeEnabled}
				<DebugConsole
					bind:projectData={projectData}
					bind:devPluginObjects={devPluginObjects}
				/>
			{/if}
		</div>
		{#if edited != null}
			<NodeEditor
				nodeData={projectData.objects["table"][edited].nodes}
				tableRef={projectData.objects["table"][edited].reference}
				tableData={projectData.objects["table"][edited]}
				bind:resultWidgets={projectData.objects.result}

				userSettings={userSettings}

				bind:invokeOutputs={invokeProcessCallback}
			/>
		{/if}
	</div>

	<div class="notificationsContainer">
		{#each notifications as n, index}
			<NotificationCard
				type={n.type}
				message={n.message}
				onClose={() => {deleteNotification(index)}}
			/>
		{/each}
	</div>
</main>

<style>
	main {
		width: 100vw;
		height: 100vh;
		background-color: var(--mainbg);

		position: relative;

		overflow: hidden;
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

		overflow: hidden;
	}

	.notificationsContainer {
		z-index: 1000;

		position: fixed;
		bottom: 0;
		right: 0;
		width: 25vw;

		display: flex;
		flex-direction: column-reverse;
		align-items: center;
	}
</style>