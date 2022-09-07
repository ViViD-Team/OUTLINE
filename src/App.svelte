<script>
	import TopBar from "./TopBar/TopBar.svelte";
	import Viewport from "./Viewport/Viewport.svelte";
	import NodeEditor from "./NodeEditor/NodeEditor.svelte";
	import Toolkit from "./Toolkit/Toolkit.svelte";

</script>

<main>
	<div class="mainLayout">
		<TopBar />
		<div class="centerRow">
			<Toolkit />
			<Viewport />
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