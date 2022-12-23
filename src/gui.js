"use strict";

// GUI and transcript summary rendering

let selectedButtonIndex = -1;
let buttonTexts = [];
let buttons = [];

function appendButtons(params, parent) {
    buttonTexts = [];
    selectedButtonIndex = -1;
    parent.innerHTML = "";
    params.captions = params.captions.map(caption => { caption.summary = null; return caption });
    [...Array(params.texts.length).keys()].map((index) => appendButton(params, index, parent));
}

function appendButton(params, index, parent) {
    const button = document.createElement("button");
    const buttonText = document.createElement("span");
    buttonText.innerText = `${params.captions[index].languageCode}-${params.captions[index].kind}-transcript`;
    buttonText.id = `span_transcript_${index}`;
    button.id = `button_transcript_${index}`;
    button.appendChild(buttonText);
    parent.appendChild(button);
    button.addEventListener("click", async () => {
        if (!params.captions[index].summary) {
            disableControls();
            let fetched = false;
            setTimeout(() => {
                if (!fetched) {
                    textDiv.style.visibility = "visible";
                    textDiv.style.display = "block";
                    textDiv.innerText = "Getting the summary from the chosen transcript...";
                }
              }, 300);
            const inputText = await params.texts[index];
            params.captions[index].summary = await params.getText({ ...params, inputText })
            enableControls();
            fetched = true;
        }
        textDiv.innerText = params.captions[index].summary;
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
    slidingDiv.style.display = "block";
    buttons.map( button => button.disabled = false);
}

function disableControls() {
    summarySize.disabled = true;
    temperature.disabled = true;
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
