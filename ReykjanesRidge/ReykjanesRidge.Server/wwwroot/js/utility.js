//import { BloomEffect } from "/js/threejs/postprocessing/src/three.postprocessing.js";

var DotNetHelper;

window.registerDotNet = (dotNetHelper) => {
	DotNetHelper = dotNetHelper;
};

function getKeyByValue(object, value) {
    for (let prop in object) {
        if (object.hasOwnProperty(prop)) {
            if (object[prop] === value)
                return prop;
        }
    }
}
