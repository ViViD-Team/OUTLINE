class NodeData {

    constructor(title, inputs, outputs, posX, posY) {
        this.title = title;

        this.inputs = inputs;
        this.outputs = outputs;

        this.posX = posX;
        this.posY = posY;
    }
}

module.exports = NodeData;