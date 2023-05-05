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

# Update 05.05.2023
#### Bugfixes
- Connecting a node input tether that already had a connection will no longer result in a single input tether having two visual connections.

#### Features
- Added I/O and Literals categories to the node navigation panel.
- Added *number literal* node.
- Added *text literal* node.