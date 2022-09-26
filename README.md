# GIT AI COMMIT

Tired of writing commit messages? Let the computer do it for you!

[![asciicast](demo.svg)](https://asciinema.org/a/fpL5Dkd74xO8yRTM15O49zOF9)

> It's shit, but better than "WIP"!

## Installation

```bash
npm install -g git-aicommit
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
alias gai='git-aicommit'

## And run it:
gai
```

It that simple!
    

