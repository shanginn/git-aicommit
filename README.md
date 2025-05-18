# GIT AI COMMIT

Tired of writing commit messages? Let the computer do it for you!

[![asciicast](demo.svg)](https://asciinema.org/a/fpL5Dkd74xO8yRTM15O49zOF9)

> It's shit, but better than "WIP"!

## Installation

```bash
bun add -g git-aicommit
```

## Configuration

This cli tool uses [standard rc files](https://www.npmjs.com/package/rc#standards):

- local `.git-aicommitrc`
- `$HOME/.git-aicommitrc`
- `$HOME/.git-aicommit/config`
- `$HOME/.config/git-aicommit`
- `$HOME/.config/git-aicommit/config`
- `/etc/git-aicommitrc`
- `/etc/git-aicommit/config`

Or [default config](config.js) is used if no config file is found.

To override default config, create a config file and export an object with the following properties:

```bash
touch $HOME/.git-aicommitrc
```

```js
// $HOME/.git-aicommitrc
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
    temperature: 0.0,
    maxTokens: 2000,
}

```

### Command line arguments

```bash
git-aicommit --openAiKey="sk-..." --completionPromptParams.temperature=0.3 --no-autocommit
```
## Usage

```bash
export OPENAI_API_KEY=sk-YOUR_API_KEY
git-aicommit
```

Or make an alias:

```bash
alias gai="git add --all && git-aicommit && git push"

## And run it:
gai
```

It's that simple!
