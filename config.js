export default {
    openAiKey: process.env.OPENAI_API_KEY,
    azureOpenAiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenAiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
    azureOpenAiDeploymentName: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
    azureOpenAiVersion: process.env.AZURE_OPENAI_API_VERSION,
    autocommit: true,
    openCommitTextEditor: false,
    language: 'english',
    systemMessagePromptTemplate: '' +
        'You are expert software developer, your job is to write clear and concise Git commit messages. ' +
        'Your responsibility is to ensure that these messages accurately describe the changes made in each commit,' +
        'follow established guidelines. Provide a clear history of changes to the codebase.' +
        'Write 1-2 sentences. Output only the commit message without comments or other text.',
    humanPromptTemplate: '' +
        'Read the following git diff for a multiple files and ' +
        'write 1-2 sentences commit message in {language}' +
        'without mentioning lines or files.' +
        'If the reason behind the changed can be deducted from the changed, provide this reason:\n' +
        '{diff}',
    excludeFromDiff: [
        '*.lock', '*.lockb', '*-lock.json', '*-lock.yaml'
    ],
    diffFilter: 'ACMRTUXB',
    modelName: "gpt-4.1-mini",
    maxTokens: 2000,
}
