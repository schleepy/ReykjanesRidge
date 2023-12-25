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
