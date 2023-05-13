export default {
    openAiKey: process.env.OPENAI_API_KEY,
    azureOpenAiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenAiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
    azureOpenAiDeploymentName: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
    azureOpenAiVersion: process.env.AZURE_OPENAI_API_VERSION,
    addAllChangesBeforeCommit: true,
    autocommit: true,
    openCommitTextEditor: false,
    language: 'english',
    systemMessagePromptTemplate: '' +
        'You are expert AI, your job is to write clear and concise Git commit messages.' +
        'Your responsibility is to ensure that these messages accurately describe the changes made in each commit,' +
        'follow established guidelines. Provide a clear history of changes to the codebase.' +
        'Write 1-2 sentences. Output only the commit message without comments or other text.',
    humanPromptTemplate: '' +
        'Read the following git diff for a multiple files and ' +
        'write 1-2 sentences commit message in {language}' +
        'without mentioning lines or files:\n' +
        '{diff}',
    excludeFromDiff: [
        '*.lock', '*.lockb'
    ],
    diffFilter: 'ACMRTUXB',
    completionPromptParams: {
        model: "gpt-3.5-turbo",
        temperature: 0.0,
        maxTokens: 1000,
    }
}
