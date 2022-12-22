### Getting Started

0. Download the content of this repository.

1. Set a valid OpenAI API key [`OPEN_AI_API_KEY`](https://github.com/rfulekjames/transcript-summaries-extension/blob/20fa73e744c574f6cdc38f27f4cda84e83ec7a6f/src/openai.js#L5) as a variable in `src/openai.js` file.

2. Open `chrome://extensions`, turn the developer mode ON, and  `load unpacked` a folder containing the repository.

### Features

Besides choosing the transcript for generating summaries. There are two parameters affecting the produced outcome:
- **[Summary length](https://beta.openai.com/docs/api-reference/completions/create#completions/create-max_tokens)**: In the range between 20 and 300.  The maximum number of tokens in the returned summary.
- **[Temperature](https://beta.openai.com/docs/api-reference/completions/create#completions/create-temperature)**:  In the range between 0 and 1. Higher values means the model will take more risks. 

See [OpenAI API reference](https://beta.openai.com/examples/default-tldr-summary) of the endpoint powering the extension for a more detailed info.

### Limitations

The summary is computed based only on the first roughly  [2500](https://github.com/rfulekjames/transcript-summaries-extension/blob/727a3b20058b0e49b0c4c2a1e3706ac1f5853f3b/src/openai.js#L7) words in transcript which is close to the current 
limit of the OpenAI API at hand.

The extension might stop working if the placement of the url links to the transcripts in the source page changes which can happen over time.


