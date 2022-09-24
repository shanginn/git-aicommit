#!/usr/bin/env node

const {Configuration, OpenAIApi} = require("openai");
const {execSync} = require("child_process");

try {
  execSync(
    'git rev-parse --is-inside-work-tree 2>/dev/null',
    {encoding: 'utf8'}
  );
} catch (e) {
  console.error("This is not a git repository");
  process.exit(1);
}

const diff = execSync(
    'git diff 2>/dev/null',
    {encoding: 'utf8'}
);

console.log(diff);
process.exit();

// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(configuration);
//
// const response = await openai.createCompletion({
//   model: "text-davinci-002",
//   prompt: "Convert this text to a programmatic command:\n\nExample: Ask Constance if we need some bread\nOutput: send-msg `find constance` Do we need some bread?\n\nContact the ski store and figure out if I can get my skis fixed before I leave on Thursday",
//   temperature: 0,
//   max_tokens: 100,
//   top_p: 1.0,
//   frequency_penalty: 0.2,
//   presence_penalty: 0.0,
//   stop: ["\n"],
// });
