# GIT AI COMMIT

Tired of writing commit messages? Let the computer do it for you!

<p align="center">
  <img width="600" src="demo.svg">
</p>


## Installation

```bash
npm install -g git-aicommit
```

## Usage

For now this cli tool uses env variables to pass params, because this is simple PoC.
- `OPENAI_API_KEY` - your OpenAI API key
- `GIT_AUTOCOMMIT` - If this env is present and not empty,
  the commit will be made automatically.
  Otherwise, you will just see the suggested commit.

```bash 

```bash
OPENAI_API_KEY=YOUR_OPEN_API_KEY GIT_AUTOCOMMIT=1 git-aicommit
```
