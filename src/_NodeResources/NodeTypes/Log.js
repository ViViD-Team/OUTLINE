const NodeData = require("../NodeData");
const NodeInputTether = require("../NodeInputTether");
const NodeOutputTether = require("../NodeOutputTether");

class LogNodeData extends NodeData {

    constructor(outputRefs, context, rawNodeData) {
        let inputs = [
            new NodeInputTether("Num", context),
            new NodeInputTether("Base", context),
        ];
        let outputs = [
            new LogNodeDataOutput("Log", inputs, outputRefs[0], context),
        ];

        super("Log", inputs, outputs, rawNodeData);
    }
}


class LogNodeDataOutput extends NodeOutputTether {

    constructor(reqInputs, puts, id, context) {
        super(reqInputs, puts, id, context);

        this.process = function() {
            return new Promise(async (resolve, reject) => {
                let a = await this.inputs[0].getValue();
                let b = await this.inputs[1].getValue();
    
                if (!Array.isArray(a) && !Array.isArray(b)) resolve(Math.log(parseFloat(a)) / Math.log(parseFloat(b)));
            
                if (Array.isArray(a) && Array.isArray(b)) {
                    let i = 0, out = [];

                    while (i < Math.max(a.length, b.length)) {
                        if (a[i] && b[i]) out[i] = Math.log(parseFloat(a[i] || 0)) / Math.log(parseFloat(b[i] || 1));
                        i++;
                    }

                    resolve(out);
                }

                if (Array.isArray(a)) {
                    resolve(a.map(item => Math.log(parseFloat(item)) / Math.log(parseFloat(b))));
                } else {
                    resolve(b.map(item => Math.log(parseFloat(item)) / Math.log(parseFloat(a))));
                }
            });
        }
    }
}

module.exports = LogNodeData;