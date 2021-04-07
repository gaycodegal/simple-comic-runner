let windowWidth = 640;
let windowHeight = 480;
const thingsSpawned = [];
window.addEventListener("load", async function() {
    $(".world").css("width", windowWidth);
    $(".world").css("height", windowHeight);
    let source = getParameterByName("comic");
    if (source == null) {
	source = "1";
	location.href = '?comic=1';
    }
    source = `comic-words/${source}.txt`;
    const sourceText = await loadText(source);
    console.log(sourceText);
    const context = basicPolishContext();
    context.speech = {call:polishSpeech, count: 5, type: "function"};
    context.background = {call:polishBackground, count: 2, type: "function"};
    context.window_width = {value: windowWidth, type: "variable"};
    context.window_height = {value: windowHeight, type: "variable"};
    const script = new PolishScript(sourceText, context);
    script.exec();
});

async function polishBackground(args, context) {
    return new Promise((resolve, reject)=>{
	if (args.length === 1) {
	    throw new Error("FUCK YOU BUDDY PUT ALT TEXT ON UR DAMN IMAGES");
	}
	if (args.length !== 2) {
	    return;
	}
	const image = $("<img>");
	image[0].src = args[1];
	image[0].alt = args[0];
	$("#world").prepend(image);
	image[0].onload = ()=> {
	    windowWidth = image[0].clientWidth;
	    windowHeight = image[0].clientHeight;
	    context.window_width.value = windowWidth;
	    context.window_height.value = windowHeight;
	    $(".world").css("width", windowWidth);
	    $(".world").css("height", windowHeight);
	    image.css("position", "absolute");
	    resolve();
	};
    });
}

// https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function polishSpeech(args) {
    thingsSpawned.push(new Speech(args[4], args[3], args[2], args[1], args[0]));
}

function loadText(url) {
    const promise = new Promise((resolve, reject)=>{
	function reqListener () {
	    resolve(this.responseText);
	}
	
	var oReq = new XMLHttpRequest();
	oReq.addEventListener("load", reqListener);
	oReq.open("GET", url);
	oReq.send();
    });
    return promise;
}
