"use strict";

let pageUrl = "";
let transcriptsData = null;

window.onload = onWindowLoad;

async function onWindowLoad() {
    setControlsEventListener(getNewSummaries);

    const tab = await getCurrentTab();
    await refresh(tab);
}

async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

chrome.tabs.onUpdated.addListener(async function
    (tabId, changeInfo, tab) {
    if (changeInfo.url) {
        pageUrl = tab.url;
        await refresh(tab);
    }
});

async function refresh(tab) {
    pageUrl = tab.url;
    await refreshPage();
}

async function refreshPage() {
    let refreshInProgress = true;
    initGUI("Searching for available transcripts...", () => refreshInProgress, 1000);
    try {
        var res = await fetch(pageUrl);
    }
    catch (err) {
        showMessage(`Cannot fetch the page source:\n${err.message}`);
        return;
    }

    const html = await res.text();

    if (await changeExtractedCaptions(html)) {
        enableControls();
    }
    refreshInProgress = false;
}

async function changeExtractedCaptions(pageSource) {
    const videoId = extractVideoId(pageUrl);
    if (videoId) {
        try {
            transcriptsData = await getTranscriptsData(pageSource);
            updateSummaries();
            return true;
        } catch {
            showMessage("No transcripts found.");
        }
    } else {
        showMessage("Nothing to see here.");
    }
    return false;
}

function getNewSummaries() {
    initGUI("", () => false, 0);
    updateSummaries();
    enableControls();
}

function updateSummaries() {
    appendButtons({ ...transcriptsData, ...getSummaryApiParams(), func: openai_summary }, messageDiv);
}
