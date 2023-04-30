# Update 30.04.2023
#### Bugfixes
- Subobjects with the key `"reference"` in `projectData` are no longer serialized into .ols files.
	- This reduces .ols filesize by approximately 50%.
	- This fixes a bug where all except the first operator node are serialized to `null`.
- Table column indicators will now display correctly even after loading another file before clearing the project.
- Table cells will now be unfocused upon pressing enter.
#### Features
- Added quick navigation pannel to the node picker.
- Added *multiply* node