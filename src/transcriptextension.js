"use strict";

let pageUrl = "";
let transcriptsData = null;

const FETCH_REQUEST_TIMEOUT = 10000;
const BEFORE_PENDING_MESSAGE_TIMEOUT = 1000;

try {
    window.onload = onWindowLoad;
    chrome.tabs.onUpdated.addListener(async function
        (tabId, changeInfo, tab) {
        if (changeInfo.url) {
            pageUrl = tab.url;
            await refresh(tab);
        }
    });
} catch (err) {
    showMessage(err.message);
}

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

async function refresh(tab) {
    pageUrl = tab.url;
    await refreshPage();
}

async function refreshPage() {
    let refreshInProgress = true;
    initGUI("Searching for available transcripts...", () => refreshInProgress, BEFORE_PENDING_MESSAGE_TIMEOUT);
    try {    
        var pageSource = await fetchWithTimeout(pageUrl, {}, FETCH_REQUEST_TIMEOUT);
    }
    catch (err) {
        showMessage(`Cannot fetch the page source:\n${err.message}`);
        refreshInProgress = false;
        return;
    }

    if (await changeExtractedTranscripts(pageSource)) {
        enableControls();
    } else {
        disableControls();
    }
    refreshInProgress = false;
}

async function fetchWithTimeout(url, requestParams, timeout) {
    const abortSignal = AbortSignal.timeout(timeout);
    abortSignal.throwIfAborted();
    var res = await fetch(url, { ...requestParams, signal: abortSignal });
    if (res.status >= 500) throw new Error(`Server error for request ${url}.`);
    return await res.text();
}

async function changeExtractedTranscripts(pageSource) {
    const videoId = extractVideoId(pageUrl);
    if (videoId) {
        try {
            transcriptsData = await getTranscriptsData(pageSource, fetchWithTimeout);
        } catch {
            showMessage("No transcripts found.");
        }
        updateSummaries();
        return true;
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
    appendButtons({
        ...transcriptsData,
        summaries: Array(transcriptsData.metadata.length).fill(null),
        ...getSummaryApiParams(),
        getText: openaiGetSummary,
        fetch: fetchWithTimeout,
    },
        messageDiv,
    );
}
