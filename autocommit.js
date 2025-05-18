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
        azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY
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

if (!config.openAiKey && !config.azureOpenAiKey) {
    console.error("Please set OPENAI_API_KEY or AZURE_OPENAI_API_KEY");
    process.exit(1);
}

// if any settings related to AZURE are set, if there are items that are not set, will error.
if (config.azureOpenAiKey && !(
    config.azureOpenAiInstanceName && config.azureOpenAiDeploymentName && config.azureOpenAiVersion
)){
    console.error("Please set AZURE_OPENAI_API_KEY, AZURE_OPENAI_API_INSTANCE_NAME, AZURE_OPENAI_API_DEPLOYMENT_NAME, AZURE_OPENAI_API_VERSION when Azure OpenAI Service.");
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
    baseURL: config.azureOpenAiKey ? `https://${config.azureOpenAiInstanceName}.openai.azure.com/openai/deployments/${config.azureOpenAiDeploymentName}` : undefined,
    defaultHeaders: config.azureOpenAiKey ? { 'api-key': config.azureOpenAiKey } : undefined,
    defaultQuery: config.azureOpenAiKey ? { 'api-version': config.azureOpenAiVersion } : undefined, // defaultQuery for api-version as per OpenAI SDK v4+ for Azure
});

async function getChatCompletion(messages) {
    const response = await openai.chat.completions.create({
        model: config.modelName || 'gpt-4.1-mini',
        messages: messages,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
    });

    return response.choices[0].message.content.trim();
}

const systemMessage = { role: "system", content: config.systemMessagePromptTemplate };
const userMessage = { role: "user", content: config.humanPromptTemplate.replace("{diff}", diff).replace("{language}", config.language) };

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
