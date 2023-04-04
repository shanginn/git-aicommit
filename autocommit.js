#!/usr/bin/env bun

import { execSync, spawn } from "child_process";
import rc from 'rc';
import { ChatOpenAI } from "langchain/chat_models";
import {ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate} from "langchain/prompts";
import defaultConfig from './config.js';
import dotenv from 'dotenv';

dotenv.config();

const config = rc(
    'git-aicommit',
    {
        ...defaultConfig,
        openAiKey: process.env.OPENAI_API_KEY,
    },
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
const diffCommand = `git diff --staged \
    --diff-filter=${diffFilter} \
    -- "${excludeFromDiff.map(
        (pattern) => `:(exclude)${pattern}`
    ).join(' ')}"
`;

const diff = execSync(diffCommand, {encoding: 'utf8'});

if (!diff) {
    console.error("Diff seems empty. Please commit manually.");
    process.exit(1);
}

const openai = new ChatOpenAI({
    modelName: config.modelName,
    openAIApiKey: config.openAiKey,
    temperature: config.temperature,
    maxTokens: config.maxTokens,
});

const systemMessagePromptTemplate = SystemMessagePromptTemplate.fromTemplate(config.systemMessagePromptTemplate)
const humanPromptTemplate = HumanMessagePromptTemplate.fromTemplate(config.humanPromptTemplate)

const chatPrompt = ChatPromptTemplate.fromPromptMessages([
    systemMessagePromptTemplate,
    humanPromptTemplate,
])

const prompt = await chatPrompt.formatMessages({
    diff: diff,
    language: config.language,
})

const res = await openai.call(prompt)

const commitMessage = res.text.trim();


if (!config.autocommit) {
    console.log(`Autocommit is disabled. Here is the message:\n ${commitMessage}`);
} else {
    console.log(`Committing with following message:\n ${commitMessage}`);
    execSync(
        `git commit -m "${commitMessage.replace(/"/g, '')}"`,
        {encoding: 'utf8'}
    );
}

if (config.openCommitTextEditor) {
    spawn('git', ['commit', '--amend'], {
        stdio: 'inherit'
    });
}
