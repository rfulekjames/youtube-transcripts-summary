"use strict";

const TRANSCRIPT_FETCH_REQUEST_TIMEOUT = 10000;

function extractVideoId(url) {
    const search = /^https:\/\/www\.youtube\.com\/watch\?v=([^&]+)/;
    return url.match(search);
}

// Transcript Fetching

async function getTranscriptsData(pageSource, fetchFunc) {
    const metadata = getMetaDataFromPagaSource(pageSource);
    const transcripts = metadata.map(metadataItem => getTranscriptFromUrl(metadataItem.url, fetchFunc));
    return {
        metadata,
        texts: transcripts,
    };
}

async function getTranscriptFromUrl(url, fetchFunc) {
    try {
        const xmlTranscriptsDoc = await getTranscriptXml(url, fetchFunc)
        const transcriptsElement = xmlTranscriptsDoc.getElementsByTagName('transcript')[0];
        return getTranscriptFromXmlElement(transcriptsElement);
    } catch(err) {
        return new Error(`Error fetching transcripts from ${url}:\n${err.message}`);
    }
}

async function getTranscriptXml(url, fetchFunc) {
    const transcriptXml = await fetchFunc(url, {}, TRANSCRIPT_FETCH_REQUEST_TIMEOUT);
    const xmlParser = new DOMParser();
    const xmlTranscriptsDoc = xmlParser.parseFromString(transcriptXml, "text/xml");
    return xmlTranscriptsDoc;
}

function getTranscriptFromXmlElement(transcriptsElement) {
    const textNodes = transcriptsElement.getElementsByTagName('text');
    const sequence = [...Array(textNodes.length).keys()];
    return sequence.map(i => textNodes[i].childNodes[0].nodeValue).join('\n');
}

// Getting captions

function getMetaDataFromPagaSource(pageSource) {
    const metadataJsonString = extractCaptionsJsonString(pageSource);
    const rawMetadata = JSON.parse(metadataJsonString);
    return getMetadata(rawMetadata);
}

function extractCaptionsJsonString(sourceHtml) {
    return sourceHtml.split('"captions":')[1].split(',"videoDetails')[0].replace('\n', '');
}

function getMetadata(rawMetadata) {
    const captionTracks = rawMetadata.playerCaptionsTracklistRenderer.captionTracks;
    const metadata = [];
    for (const captionTrack of captionTracks) {
        metadata.push({
            url: captionTrack.baseUrl,
            languageCode: captionTrack.languageCode,
            kind: captionTrack.kind === 'asr' ? 'generated' : 'manual',
        });
    }
    return metadata;
}
