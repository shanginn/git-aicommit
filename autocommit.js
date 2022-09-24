#!/usr/bin/env node

require('dotenv').config();
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

if (!process.env.OPENAI_API_KEY) {
  console.error("Please set OPENAI_API_KEY");
  process.exit(1);
}

const diff = execSync(
    `git diff -- . ':(exclude)*.lock' 2>/dev/null`,
    {encoding: 'utf8'}
);

if (!diff) {
    console.error("Diff seems empty. Please commit manually.");
    process.exit(1);
}


const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// create a prompt
const prompt = `Read the following git diff for a multiple files:

${diff}

Generate a commit message to explain diff in each file:

`;

openai
  .createCompletion({
    prompt,
    model: "text-davinci-002",
    max_tokens: 500,
    temperature: 0.2,
    top_p: 1,
    presence_penalty: 0,
    frequency_penalty: 0,
    best_of: 1,
    n: 1,
    stream: false,
    stop: ["\n\n\n"],
  })
  .then((data) => {
    const commitMessage = data.data.choices[0].text;
    const command = `git add --all && git commit -m "${commitMessage}"`;

    if (!process.env.GIT_AUTOCOMMIT) {
      console.log(`Please set GIT_AUTOCOMMIT to commit with following command:\n ${command}`);
    } else {
      console.log(`Committing with following command:\n ${command}`);
      execSync(command, {encoding: 'utf8'});
    }
  });

