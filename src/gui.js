"use strict";

// GUI and transcript summary rendering

let selectedButtonIndex = -1;
let buttonTexts = [];
let buttons = [];

function appendButtons(apiInputs, parent) {
    buttonTexts = [];
    selectedButtonIndex = -1;
    parent.innerHTML = "";
    apiInputs.captions = apiInputs.captions.map(caption => { caption.summary = null; return caption });
    [...Array(apiInputs.texts.length).keys()].map((index) => appendButton(apiInputs, index, parent));
}

function appendButton(apiInputs, index, parent) {
    const button = document.createElement("button");
    const buttonText = document.createElement("span");
    buttonText.innerText = `${apiInputs.captions[index].languageCode}-${apiInputs.captions[index].kind}-transcript`;
    buttonText.id = `span_transcript_${index}`;
    button.id = `button_transcript_${index}`;
    button.appendChild(buttonText);
    parent.appendChild(button);
    button.addEventListener("click", async () => {
        if (!apiInputs.captions[index].summary) {
            disableControls();
            let fetched = false;
            setTimeout(() => {
                if (!fetched) {
                    textDiv.style.visibility = "visible";
                    textDiv.style.display = "block";
                    textDiv.innerText = "Getting the summary from the chosen transcript...";
                }
              }, 300);
            const params = await apiInputs.texts[index];
            apiInputs.captions[index].summary = await params.superFunc({ ...apiInputs, text: params.text })
            enableControls();
            fetched = true;
        }
        textDiv.innerText = apiInputs.captions[index].summary;
        if (selectedButtonIndex === index) {
            textDiv.style.visibility = textDiv.style.visibility === "visible" ? "hidden" : "visible";
        } else {
            textDiv.style.visibility = "visible";
        }
        textDiv.style.display = textDiv.style.visibility === "visible" ? "block" : "none";
        buttonTexts.map(it => it.style.fontWeight = it.id === buttonText.id && textDiv.style.visibility === "visible" ? "bold" : "normal");
        selectedButtonIndex = index;
    });
    buttonTexts.push(buttonText);
    buttons.push(button);
}

function showMessage(message) {
    messageDiv.innerText = message;
}

function enableControls() {
    summarySize.disabled = false;
    temperature.disabled = false;
    buttons.map( button => button.disabled = false);
}

function disableControls() {
    summarySize.disabled = true;
    temperature.disabled = true;
    buttons.map( button => button.disabled = true);
}

function initGUI(pendingMessage, isInProgress, timeout) {
    setTimeout(() => {
        if (isInProgress()) {
            disableControls();
        }
      }, timeout / 10);
    setTimeout(() => {
        if (isInProgress()) {
            messageDiv.innerHTML = pendingMessage;
        }
      }, timeout);
    textDiv.innerHTML = "";
    textDiv.style.visibility = "hidden";
}

function getSummaryApiParams() {
    return {
        temperature: parseInt(temperature.value) / 100,
        numberOfTokens: parseInt(summarySize.value),
    }
}

function setControlsEventListener(callback) {
    summarySize.addEventListener("change", () => { callback(); });
    temperature.addEventListener("change", () => { callback(); });
}
