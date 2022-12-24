"use strict";

function extractVideoId(url) {
    const search = /^https:\/\/www\.youtube\.com\/watch\?v=([^&]+)/;
    return url.match(search);
}

// Transcript Fetching

async function getTranscriptsData(pageSource) {
    const metadata = getMetaDataFromPagaSource(pageSource);
    const transcripts = metadata.map(metadataItem => getTranscriptSummaryFromUrl(metadataItem.url));
    return {
        metadata,
        texts: transcripts,
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
