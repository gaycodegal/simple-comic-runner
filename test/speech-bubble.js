
class Speech {
    constructor(x, y, w, h, text) {
	const jel = $(`
<div class="speech">
<div class="speech-inner" tabindex="0">
<div class="speech-controls">
<button class="prev">previous</button>
<button class="next">next</button>
</div>
<div class="speech-text"></div>
</div></div>`);
	const speechInner = jel.find(".speech-inner");
	speechInner.find(".speech-text").text(text);
	speechInner.find(".next")[0].onclick = (event)=>focusOnNext(event.target);
	speechInner.find(".prev")[0].onclick = (event)=>focusOnPrevious(event.target);
	jel.css("margin-left", x);
	jel.css("margin-top", y);
	jel.css("width", w);
	jel.css("height", h);
	speechInner.css("background", "red");
	$("#world").append(jel);
    }
}

function currentSpeech(currentControl) {
    const current = currentControl.closest(".speech-inner");
    const tabs = document.querySelectorAll(".world .speech-inner");
    let currentIndex = -1;
    for (var i = 0; i < tabs.length; ++i) {
	if (tabs[i] == current) {
	    currentIndex = i;
	    break;
	}
    }

    return {currentIndex, tabs};
}

function focusOnNext(currentControl) {
    const result = currentSpeech(currentControl);
    const currentIndex = result.currentIndex;
    const tabs = result.tabs;
    
    if (currentIndex != -1) {
	const next = (currentIndex + 1) % tabs.length;
	tabs[next].focus();
    }
}

function focusOnPrevious(currentControl) {
    const result = currentSpeech(currentControl);
    const currentIndex = result.currentIndex;
    const tabs = result.tabs;
    
    if (currentIndex != -1) {
	const next = ((currentIndex - 1) % tabs.length + tabs.length) % tabs.length;
	tabs[next].focus();
    }
}
