# GIT AI COMMIT

Tired of writing commit messages? Let the computer do it for you!

[![asciicast](demo.svg)](https://asciinema.org/a/fpL5Dkd74xO8yRTM15O49zOF9)

> It's shit, but better than "WIP"!

## Installation

```bash
npm install -g git-aicommit
```

## Configuration

This cli tool uses configuration file located where `GIT_AI_COMMIT_CONFIG_NAME` points at,
defaults to `~/.git-ai-commit-config.js`.

Or [default config](config.js) is used if no config file is found.

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
    

