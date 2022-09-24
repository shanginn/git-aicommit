#!/usr/bin/env node

require('dotenv').config();
const {Configuration, OpenAIApi} = require("openai");
const {execSync} = require("child_process");
const readline = require("readline");

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

function generatePrompt() {
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
    const commitMessage = data.data.choices[0].text.trim();
    const command = `git add --all && git commit -m "${commitMessage.replace(/"/g, '\\"')}"`;

    // Check if process.env.GIT_AI_AUTOCOMMIT exists and is set to 1 or true, otherwise just warn.
    if (process.env.GIT_AI_AUTOCOMMIT && process.env.GIT_AI_AUTOCOMMIT.match(/^(1|true)$/)) {
      console.log(`Committing with following command:\n ${command}`);
      execSync(command, {encoding: 'utf8'});
    } else {
      console.log(`Set GIT_AI_AUTOCOMMIT=1 to auto-commit. Proposing the following commit message:`);
      console.log();
      console.log();
      console.error(commitMessage);
      console.log();
      console.log();

      if (process.env.GIT_AI_AUTOCOMMIT && process.env.GIT_AI_AUTOCOMMIT.match(/^(ask)$/)) {
        // Ask if want to run
        const input = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        input.question(`Commit with the above message? [y/r/N]: `, (answer) => {
          input.close();
          if (answer.match(/^(y|Y)$/)) {
            console.log(`Committing with following command:\n ${command}`);
            execSync(command, {encoding: 'utf8'});
          } else if (answer.match(/^(r|R)$/)) {
            generatePrompt();
          } else {
            console.log("Not committing.");
          }
        });
      }

    }
  });
}

generatePrompt();
