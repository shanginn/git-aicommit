#!/usr/bin/env bun

import { execSync, spawn } from "child_process";
import rc from 'rc';
import defaultConfig from './config.js';
import { OpenAI } from "openai";
import {calculateMaxTokens, getModelContextSize} from "./count_tokens.js";

const config = rc(
    'git-aicommit',
    {
        ...defaultConfig,
        openAiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.OPENAI_BASE_URL,
        defaultHeaders: process.env.OPENAI_DEFAULT_HEADERS ? JSON.parse(process.env.OPENAI_DEFAULT_HEADERS) : null,
        defaultQuery: process.env.OPENAI_DEFAULT_QUERY ? JSON.parse(process.env.OPENAI_DEFAULT_QUERY) : null,
    },
);

// Parse command-line arguments (everything after the script name)
const customInstruction = process.argv.slice(2).join(' ');

try {
    execSync(
        'git rev-parse --is-inside-work-tree',
        {encoding: 'utf8', stdio: 'ignore'}
    );
} catch (e) {
    console.error("This is not a git repository");
    process.exit(1);
}

// Get current git branch name
const branch = execSync('git rev-parse --abbrev-ref HEAD', {encoding: 'utf8'}).trim();

if (!config.openAiKey) {
    console.error("Please set OPENAI_API_KEY");
    process.exit(1);
}

const excludeFromDiff = config.excludeFromDiff || [];
const diffFilter = config.diffFilter || 'ACMRTUXB';
const diffCommand = `git diff --staged \
    --no-ext-diff \
    --diff-filter=${diffFilter} \
    -- ${excludeFromDiff.map(
    (pattern) => `':(exclude)${pattern}'`
).join(' ')}
`;

let diff = execSync(diffCommand, {encoding: 'utf8'});

if (!diff) {
    console.error("Diff seems empty. Please commit manually.");
    process.exit(1);
}

const openai = new OpenAI({
    apiKey: config.openAiKey,
    baseURL: config.baseURL || undefined,
    defaultHeaders: config.defaultHeaders || undefined,
    defaultQuery: config.defaultQuery || undefined,
});

async function getChatCompletion(messages) {
    const response = await openai.chat.completions.create({
        model: config.modelName || 'gpt-4.1-mini',
        messages: messages,
        max_completion_tokens: config.maxTokens,
    });

    return response.choices[0].message.content.trim();
}

const systemMessage = { role: "system", content: config.systemMessagePromptTemplate };
const userPrompt = config.humanPromptTemplate
    .replace("{diff}", diff)
    .replace("{language}", config.language)
    .replace("{branch}", branch)
    .replace("{projectInstruction}", config.projectInstruction || '')
    .replace("{customInstruction}", customInstruction || '');

const userMessage = { role: "user", content: userPrompt };

const tokenCount = await calculateMaxTokens({
    prompt: diff,
    modelName: config.modelName || 'gpt-4.1-mini'
});

const contextSize = getModelContextSize(config.modelName || 'gpt-4.1-mini');

if (tokenCount > contextSize) {
    console.log('Diff is too long for the current model context. Please lower the amount of changes in the commit or switch to a model with a larger context window.');
    process.exit(1);
}

const messages = [
    systemMessage,
    userMessage
];

const commitMessage = await getChatCompletion(messages);

if (!config.autocommit) {
    console.log(`Autocommit is disabled. Here is the message:\n ${commitMessage}`);
} else {
    console.log(`Committing with following message:\n ${commitMessage}`);
    try {
        execSync(
            'git commit -F -',
            {
                input: commitMessage,
                encoding: 'utf8',
                stdio: 'inherit'
            }
        );
    } catch (error) {
        console.error("Failed to commit.", error);
        process.exit(1);
    }
}

if (config.openCommitTextEditor) {
    spawn('git', ['commit', '--amend'], {
        stdio: 'inherit'
    });
}
