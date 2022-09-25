module.exports = {
    openAiKey: process.env.OPENAI_API_KEY,
    addAllChangesBeforeCommit: true,
    autocommit: true,
    openCommitTextEditor: false,
    promptBeforeDiff: 'Read the following git diff for a multiple files:',
    promptAfterDiff: 'Generate 1 to 3 paragraphs to explain this diff to a human without mentioning changes themselves:',
    excludeFromDiff: [
        '*.lock'
    ],
    diffFilter: 'ACMRTUXB',
    completionPromptParams: {
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
    }
}
