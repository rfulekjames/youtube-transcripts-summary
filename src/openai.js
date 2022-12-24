"use strict";

// OpenAI API Integration

const OPEN_AI_API_KEY = "API KEY HERE";
const OPEN_AI_API_URL = "https://api.openai.com/v1/completions";
const OPEN_AI_API_MAX_NUMBER_OF_INPUT_TOKENS = 2500;
const OPEN_AI_API_MODEL = "text-davinci-003";
const OPEN_AI_FETCH_REQUEST_TIMEOUT = 10000;

const trojoFriendlyMessages = [
    "\u0054r\u006F\x6A\x6F, m\u0061\u0301s\u030C zly\u0301 ten ko\u0301d! Spama\u0308taj sa.",
    "\u0054r\u006F\x6A\x6F, bez ko\u0301du sa nep\x6Fhnes\u030C!",
    "O c\u030Co ti ide?",
    "\u0054r\u006F\x6A\x6F, ma\u0301s\u030C p\x6Fsr\x61ty\u0301 ten ko\u0301d! Spama\u0308taj s\x61 uz\u030C."
]

Array.prototype.random = function () {
    return this[Math.floor((Math.random() * this.length))];
}

async function openaiGetSummary(params) {
    const summaryJson = await openaiGetResponse(params);
    try {
        return openaiSummaryExtraction(summaryJson);
    }
    catch (err) {
        return err.message;
    }
}

async function openaiGetResponse(params) {
    const tokens = params.inputText.split(/[-\=\_\;\:\,\.\s]+/).slice(0, OPEN_AI_API_MAX_NUMBER_OF_INPUT_TOKENS);
    const text_shortened = tokens.join(' ').toLowerCase();

    let data = {
        model: OPEN_AI_API_MODEL,
        prompt: `${text_shortened}  \n\nTl;dr`,
        temperature: params.temperature,
        max_tokens: params.numberOfTokens,
        top_p: 1,
        frequency_penalty: 0.0,
        presence_penalty: 1,
    };

    const requestParams = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPEN_AI_API_KEY}`,
        },
        body: JSON.stringify(data),
    };

    try {
        return await params.fetch(OPEN_AI_API_URL, {
            ...requestParams,
        }, OPEN_AI_FETCH_REQUEST_TIMEOUT);
    } catch (err) {
        return JSON.stringify({
            "error": {
                "message": `The transcript summary OpenAI API call was not successful: \n${err.message}`,
            }
        });
    }
}

function openaiSummaryExtraction(summaryString) {
    const summary = JSON.parse(summaryString);
    return summary.choices ? summary.choices[0].text : getTrojoFriendlyMessage(summary.error.message);
}

function getTrojoFriendlyMessage(message) {
    if (message.startsWith("Incorrect API key provided")) {
        message = trojoFriendlyMessages.random();
    }
    return message;
}
