class NodeData {

    constructor(title, inputs, outputs, routes) {
        this.title = title;

        this.inputs = inputs;
        this.outputs = outputs;
        this.routes = routes;

        this.routes.forEach(route => {
            route.puts.processCall = route.processData;
        });
    }
}

module.exports = NodeData;