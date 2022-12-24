"use strict";

// OpenAI API Integration

const OPEN_AI_API_KEY = "API KEY HERE"; 
const OPEN_AI_API_URL = "https://api.openai.com/v1/completions";
const OPEN_AI_API_MAX_NUMBER_OF_INPUT_TOKENS = 2500;
const OPEN_AI_API_MODEL = "text-davinci-003";
const OPEN_AI_FETCH_REQUEST_TIMEOUT = 10000;

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

function openaiSummaryExtraction(summaryJson) {
    try {
        return JSON.parse(summaryJson).choices[0].text;
    }
    catch {
        return JSON.parse(summaryJson).error.message;
    }
}
