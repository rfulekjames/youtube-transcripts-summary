"use strict";

// OpenAI API Integration

const OPEN_AI_API_KEY = "API KEY HERE";
const OPEN_AI_API_URL = "https://api.openai.com/v1/completions";
const OPEN_AI_API_MAX_NUMBER_OF_INPUT_TOKENS = 2500;
const OPEN_AI_API_MODEL = "text-davinci-003";

async function openai_summary(params) {
    const tokens = params.text.split(/[-\=\_\;\:\,\.\s]+/).slice(0, OPEN_AI_API_MAX_NUMBER_OF_INPUT_TOKENS);
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
        const res = await fetch(OPEN_AI_API_URL, requestParams);
        const json = await res.text();
        return json;
    } catch (err) {
        return JSON.stringify({
            "error": "The transcript summary OpenAI API call was not successful.",
            "message": err.message,
        });
    }
}