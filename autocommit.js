#!/usr/bin/env node

require('dotenv').config();
const {Configuration, OpenAIApi} = require("openai");
const {execSync, spawn} = require("child_process");
const rc = require('rc');

const defaultConfig = require('./config.js');

// if (!fs.existsSync(configPath)) {
//     TODO: param to create default config file
//     const { defaultConfig } = require('./config.js');
//
//     fs.writeFileSync(configPath, `module.exports = ${JSON.stringify(defaultConfig, null, 4)}`);
//     console.log(`Created default config file at ${configPath}`);
// }

const config = rc(
    'git-aicommit',
    defaultConfig,
    null,
    (content) => eval(content) // not good. but is it different from require()?
);

try {
  execSync(
    'git rev-parse --is-inside-work-tree',
    {encoding: 'utf8', stdio: 'ignore'}
  );
} catch (e) {
  console.error("This is not a git repository");
  process.exit(1);
}

if (!config.openAiKey) {
  console.error("Please set OPENAI_API_KEY");
  process.exit(1);
}

const excludeFromDiff = config.excludeFromDiff || [];
const diffFilter = config.diffFilter || 'ACMRTUXB';
const diffCommand = `git diff \
    --diff-filter=${diffFilter} \
    ${excludeFromDiff.map((pattern) => `-- ":(exclude)${pattern}"`).join(' ')}
`;

const diff = execSync(diffCommand, {encoding: 'utf8'});

if (!diff) {
    console.error("Diff seems empty. Please commit manually.");
    process.exit(1);
}

const openai = new OpenAIApi(new Configuration({
    apiKey: config.openAiKey,
}));

// create a prompt
const prompt = `${config.promptBeforeDiff}

${diff}

${config.promptAfterDiff}

`;

openai
  .createCompletion({
    prompt,
    ...config.completionPromptParams
  })
  .then((data) => {
    const commitMessage = data.data.choices[0].text.trim();

    if (!config.addAllChangesBeforeCommit) {
        console.log('addAllChangesBeforeCommit is false. Skipping git add --all');
    } else {
        execSync('git add --all', {encoding: 'utf8'});
    }

    if (!config.autocommit) {
      console.log(`Autocommit is disabled. Here is the message:\n ${commitMessage}`);
    } else {
      console.log(`Committing with following message:\n ${commitMessage}`);
      execSync(
          `git commit -m "${commitMessage.replace(/"/g, '')}"`,
          {encoding: 'utf8'}
      );

        if (config.openCommitTextEditor) {
            spawn('git', ['commit', '--amend'], {
                stdio: 'inherit'
            });
        }
    }
  });
