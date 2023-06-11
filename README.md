# Update 11.06.2023
#### Features
- Added *annotation* node.

# Update 31.05.2023
#### Features
- Added a simulated connection graphic when dragging node connections.
- Added <kbd>CTRL</kbd> + <kbd>S</kbd> shortcut for saving.
- Added notification cards.

# Update 29.05.2023
#### Features
- Added fallback graphic if a node's resources fail to load.

# Update 28.05.2023
#### Features
- Node Connections now stay attatched while dragging.
	- This makes calling the `recalculateConnections()` function every node move unnecessary, saving resources.
- Added option to change the preferred Mouse Navigation Button.

#### Bugfixes
- Fixed cross background overflowing.
- Fixed accidental navigation behaviour on drag in Node Picker.

# Update 14.05.2023
#### Minor Changes
- Labels for node picker slots are now separated into individual words.

# Update 13.05.2023
#### Features
- Added several new nodes.

# Update 10.05.2023
#### Features
- Added *divide* node.
#### Minor Changes
- Adjusted zoom bounds

# Update 06.05.2023
#### Bugfixes
- The connection of two tethers with the same y-coordinate will now be visible as a straight line.
- Connections no longer drift on the y-axis when zooming out.
- Connections will now have an even stroke-width along the entire curve.

# Update 05.05.2023
#### Bugfixes
- Connecting a node input tether that already had a connection will no longer result in a single input tether having two visual connections.

#### Features
- Added I/O and Literals categories to the node navigation panel.
- Added *number literal* node.
- Added *text literal* node.

# Update 30.04.2023
#### Bugfixes
- Subobjects with the key `"reference"` in `projectData` are no longer serialized into `.ols` files.
	- This reduces `.ols` filesize by approximately 50%.
	- This fixes a bug where all except the first operator node are serialized to `null`.
- Table row indicators will now display correctly even after loading another file before clearing the project.
- Table cells will now be unfocused upon pressing enter.
#### Features
- Added quick navigation panel to the node picker.
- Added *multiply* node.
