# Move / Resize Bug
I have encountered the following bug while writing the logic for manipulating widgets inside of the viewport:

On rare occasions the move / resize mode will not get terminated appropriately, causing weird behaviour when trying to manipulate another object. While I was not yet able to tell when exactly this bug shows, the reproduction of the bug should look something like this:

 - Resize a given object by hovering over it and draging the resize handle
 - End the resize by releasing the left mouse button
 - Start moving the object
 
 When this bug occurs, the object should move **and** resize simultaniously.

To help fix this bug please see the following info:
___
The acutal widgets inside the viewport are merely a representation of what is stored inside of the *projectData* object. In this stage of development the projectData object is structured as follows:

    let projectData = {
	    "objects": {
		    "header": [],
		    "paragraph": [],
		}
    }
As of right now this object houses just a field titled "*objects*", which contains empty array objects for each kind of widget. When a new widget is instanced (typically by dragging and dropping from the toolkit on the left), it gets appended onto the corresponding array. The prototypes for the given widgets are stored in a constant called "*objectPrototypes*":

    const objectPrototypes  = {
    	"header": {
    		"text": "Lorem",
    		"posX": 0,
    		"posY": 0,
    		"sizeX": 10,
    		"sizeY": 3,
    		"simX": 0,
    		"simY": 0,
    		"simResizeX": 0,
    		"simResizeY": 0,
    		"sizeBounds": [],
    	},
    	"paragraph": {
    		"text": "Lorem ipsum",
    		"posX": 0,
    		"posY": 0,
    		"sizeX": 8,
    		"sizeY": 8,
    		"simX": 0,
    		"simY": 0,
    		"simResizeX": 0,
    		"simResizeY": 0,
    		"sizeBounds": [],
    	}
    }
The new object is created inside of the "*drop()*" function. The important part here is this code block specifically:

    projectData.objects[type].push(
	    Object.assign({}, objectPrototypes[type])
    );

This clones the given prototype to a new instance which is then pushed to the according array.
This means that when trying to get a certain object you need the **type**, as well as it's **index** inside of the array.  More specifically you need to query the projectData.objects dictionary by using *object type string as an "index"* and then specifying the id:

    projectData.objects[typeString][id]
    
    // eg.: The first object of kind header
    projectData.objects["header"][0]

___
Inside the **main** section of the viewport.svelte file, there are each-statements which generate components for each stored widget. The onDrag and onResize functions are bound to the initiateObjectDrag / initiateObjectResize functions using the according type and index as parameters:

    {#each}
	    <Header
		    ...
		    onDrag={(event) => {initObjectDrag(event, "header", index, ...)}}
		    onResize={(event) => {initObjectResize(event, "header", index)}}
		    ...
	    />
    {/each}
Object resize and move events are basically identical apart from some obvious exceptions. When initiating the object drag for example, the following events happen in chronological order:

 - The clearObjectDrag function is called, clearing the objectDrag object (more on that in a moment)
 - The drag preview image is set to an empty element, making it invisible
 - The neseccary info for the drag (command type, object type and id, etc.) are stored inside the event object
 - Other important info is being stored inside objectDrag object, as event.dataTransfer can only be accessed on dragStart and drop - not on dragOver
 ___
 The **objectDrag** object contains the following info:
 
 - ongoing (bool)
 - start (x, y)
 - delta (x, y) (in units)
 - layer (x, y)
 - objectInfo (type, id, optionally width and height)
___
The main part of the bug appears inside the *dragOver* function.

This function is responsible for updating the delta values of the *objectDrag* and *objectResize* objects, but also for updating the *simX*, *simY*, *simResizeX* and *simResizeY* values of the object that is currently being dragged / resized. These values are usually set to 0, unless the object is being dragged around / resized in which case they are equal to the *delta* fields of the *objectDrag* / *objectResize* objects.

The logic for updating these values is wrapped inside of **if-statements** thus ensuring that this only happens when the *objectDrag* / *objectResize* objects currently hold the value **ongoing = true**.

The fact that in some cases an *objectDrag* and *objectResize* are ongoing simultaniously leads to the conclusion that their values are not always cleared optimally.

### Some additional info on how to debug

When trying to inspect the html content and/or the object styles, press ctrl+shift+i to open up the chrome devtools.

When trying to observe certain values, you may create a new h1-element inside viewport frame and map the values you'd like to debug to the text content:

    <main>
	    <div
		    class="frame neuIndentShadow"
		    ...
	    >
		    <h1>{valueToInspect} {secondValueToInspect} ... </h1>
		    
		    ...
	    </div>
    </main>
___
Please do not hesitate to contact me in case you need extra information.
Thank you!
