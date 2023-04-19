#!/usr/bin/env node

import { execSync, spawn } from "child_process";
import rc from 'rc';
import {
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    PromptTemplate,
    SystemMessagePromptTemplate
} from "langchain/prompts";
import defaultConfig from './config.js';
import {RecursiveCharacterTextSplitter} from "langchain/text_splitter";
import {loadSummarizationChain} from "langchain/chains";
import {ChatOpenAI} from "langchain/chat_models/openai";
import {OpenAI} from "langchain/llms/openai";
import fs from "fs";

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
    --no-ext-diff \
    --diff-filter=${diffFilter} \
    -- "${excludeFromDiff.map(
        (pattern) => `:(exclude)${pattern}`
    ).join(' ')}"
`;

let diff = execSync(diffCommand, {encoding: 'utf8'});

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

const systemMessagePromptTemplate = SystemMessagePromptTemplate.fromTemplate(
    config.systemMessagePromptTemplate
);

const humanPromptTemplate = HumanMessagePromptTemplate.fromTemplate(
    config.humanPromptTemplate
);

const chatPrompt = ChatPromptTemplate.fromPromptMessages([
    systemMessagePromptTemplate,
    humanPromptTemplate,
]);

if (diff.length > 2000) {
    const splitDiff = diff.split('diff --git ');

    const filenameRegex = /^a\/(.+?)\s+b\/(.+?)/;

    // extract filenames with content in an object from splitDiff
    const diffByFiles = splitDiff
        .filter((fileDiff) => fileDiff.length > 0)
        .map((fileDiff) => {
            const match = fileDiff.match(filenameRegex);
            const filename = match[1] || 'unknown';

            const content = fileDiff
                .replaceAll(filename, '')
                .replaceAll('a/ b/\n', '')

            return chatPrompt
                .formatMessages({
                    diff: content,
                    language: config.language,
                })
                .then((prompt) => {
                    return openai.call(prompt)
                        .then((res) => {
                            return {
                                filename: filename,
                                changes: res.text.trim(),
                            }
                        })
                        .catch((e) => {
                            console.error(`Error during OpenAI request: ${e.message}`);
                            process.exit(1);
                        });
                });
        });

    // wait for all promises to resolve
    const mergeChanges = await Promise.all(diffByFiles);

    diff = mergeChanges
        .map((fileDiff) => {
            return `diff --git ${fileDiff.filename}\n${fileDiff.changes}`

        })
        .join('\n\n')
}

const prompt = await chatPrompt.formatMessages({
    diff: diff,
    language: config.language,
})

const res = await openai.call(prompt)
    .catch((e) => {
        console.error(`Error during OpenAI request: ${e.message}`);
        process.exit(1);
    });

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
