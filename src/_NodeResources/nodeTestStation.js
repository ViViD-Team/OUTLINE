const SumNodeData = require("./Sum/SumNodeData");

let sumNode = new SumNodeData();

let a = new Promise((resolve, reject) => {
    resolve(2);
});
let b = new Promise((resolve, reject) => {
    resolve(1);
});

sumNode.inputs[0].connect(a);
sumNode.inputs[1].connect(b);

sumNode.outputs[0].fetchValue.then((val) => {console.log(val)});