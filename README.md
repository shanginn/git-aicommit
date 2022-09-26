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
    

