"use strict";

// GUI and transcript summary rendering

let selectedButtonIndex = -1;
let buttonTexts = [];
let buttons = [];

function appendButtons(params, parent) {
    buttonTexts = [];
    selectedButtonIndex = -1;
    parent.innerHTML = "";

    params = { ...params, summaries: Array(params.metadata.length).fill(null) };
    [...Array(params.texts.length).keys()].map((index) => appendButton(params, index, parent));
}

function appendButton(params, index, parent) {
    const button = document.createElement("button");
    const buttonText = document.createElement("span");
    buttonText.innerText = `${params.metadata[index].languageCode}-${params.metadata[index].kind}-transcript`;
    buttonText.id = `span_transcript_${index}`;
    button.id = `button_transcript_${index}`;
    button.title = `View summary from ${buttonText.innerText}`;
    button.appendChild(buttonText);
    parent.appendChild(button);
    button.addEventListener("click", async () => {
        if (!params.summaries[index]) {
            disableControls();
            let fetched = false;
            setTimeout(() => {
                if (!fetched) {
                    textDiv.style.visibility = "visible";
                    textDiv.style.display = "block";
                    textDiv.innerText = "Getting the summary from the chosen transcript...";
                }
            }, 300);
            const inputTextOrError = await params.texts[index];
            params.summaries[index] = typeof inputTextOrError !== "string" ?
                inputTextOrError.message : await params.getText({ ...params, inputText: inputTextOrError });
            enableControls();
            fetched = true;
        }
        textDiv.innerText = params.summaries[index];
        if (selectedButtonIndex === index) {
            textDiv.style.visibility = textDiv.style.visibility === "visible" ? "hidden" : "visible";
        } else {
            textDiv.style.visibility = "visible";
        }
        textDiv.style.display = textDiv.style.visibility === "visible" ? "block" : "none";
        buttonTexts.map(it => it.style.fontWeight = it.id === buttonText.id && textDiv.style.visibility === "visible" ?
            "bold" : "normal");
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
    buttons.map(button => button.disabled = false);
}

function disableControls() {
    summarySize.disabled = true;
    temperature.disabled = true;
    buttons.map(button => button.disabled = true);
}

function initGUI(pendingMessage, isInProgress, timeout) {
    disableControls();
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
