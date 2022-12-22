"use strict";

function extractVideoId(url) {
    const search = /^https:\/\/www\.youtube\.com\/watch\?v=([^&]+)/;
    return url.match(search);
}

// Transcript Fetching

async function getTranscriptsData(pageSource) {
    const captions = getCaptionsInfoFromPageSource(pageSource);
    const transcriptsPromises = captions.map(caption => getTranscriptSummaryFromUrl(caption.url));
    return {
        captions,
        texts: transcriptsPromises,
    };
}

async function getTranscriptSummaryFromUrl(url) {
    const xmlTranscriptsDoc = await getTranscriptXml(url)
    const transcriptsElement = xmlTranscriptsDoc.getElementsByTagName('transcript')[0];
    return getTranscriptSummaryFromXmlElement(transcriptsElement);
}

async function getTranscriptXml(url) {
    const res = await fetch(url);
    const transcriptXml = await res.text();
    const xmlParser = new DOMParser();
    const xmlTranscriptsDoc = xmlParser.parseFromString(transcriptXml, "text/xml");
    return xmlTranscriptsDoc;
}

function getTranscriptSummaryFromXmlElement(transcriptsElement) {
    const textNodes = transcriptsElement.getElementsByTagName('text');
    const sequence = [...Array(textNodes.length).keys()];
    const superFunc = async (apiInput) => { 
        const summaryJson =  await apiInput.apiCall(apiInput);
        try {
            return apiInput.extraction(summaryJson);
        }
        catch {
            return summaryJson;
        }
    }
    return {
        text: sequence.map(i => textNodes[i].childNodes[0].nodeValue).join('\n'),
        superFunc,
    };
}

// Getting captions

function getCaptionsInfoFromPageSource(pageSource) {
    const captionsJsonString = extractCaptionsJsonString(pageSource);
    const captionsJson = JSON.parse(captionsJsonString);
    return getCaptionsFromCaptionsJson(captionsJson);
}

function extractCaptionsJsonString(sourceHtml) {
    return sourceHtml.split('"captions":')[1].split(',"videoDetails')[0].replace('\n', '');
}

function getCaptionsFromCaptionsJson(captionsJson) {
    const captionTracks = captionsJson.playerCaptionsTracklistRenderer.captionTracks;
    const captions = [];
    for (const captionTrack of captionTracks) {
        captions.push({
            url: captionTrack.baseUrl,
            languageCode: captionTrack.languageCode,
            kind: captionTrack.kind === 'asr' ? 'generated' : 'manual',
        });
    }
    return captions;
}
