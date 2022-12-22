### Getting Started

0. Download the content of this repository.

1. Set a valid OpenAI API key [`OPEN_AI_API_KEY`](https://github.com/rfulekjames/transcript-summaries-extension/blob/20fa73e744c574f6cdc38f27f4cda84e83ec7a6f/src/openai.js#L5) as a variable in `src/openai.js` file.

2. Open `chrome://extensions`, turn the developer mode ON, and  `load unpacked` a folder containing the repository.

### Features and limitations

The summary is computed based only on the first roughly  [2500](https://github.com/rfulekjames/transcript-summaries-extension/blob/20fa73e744c574f6cdc38f27f4cda84e83ec7a6f/src/openai.js#L7) words in transcript which is close to the current 
limit of the OpenAI API at hand.

The extension might stop working if the placement of the url links to the transcripts in the source page changes which can happen over time.
