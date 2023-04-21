# Creating Node Types
When creating node types, please follow these steps:

## Create file (File name must match the name of the node type exactly)
## Insert boilerplate (Copy from any existing node type)
Every node type is represented by a sub-class inheriting from **NodeData**. Input node tethers (with corresponding names as the first constructor argument) can be created in the constructor override of the **NodeData**.

Since the output tether is the container for it's corresponding logic, another class extending **NodeOutputTether** has to be created for every desired output. Inside the output tether's constructor, the process function is to be overridden. The inputs necessary for the calculation are to be passed in using the tether's constructor (as an array).

At any point the process function may either resolve (returning the desired value) or reject (throwing an error).

The **NodeOutputTether** also receives a label as the first argument.

A name for the entire node may be assigned using the superconstructor's first argument inside the **NodeData**-override.

Lastly, expose the node's class using
    module.exports = ...;

## Add the newly created node to nodesConfig in the desired category