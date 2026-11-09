---
title: Git Commands
description: Everyday commands, undoing mistakes, branching and rebasing.
icon: code
order: 1
---

## Setup & basics

| Command | What it does |
|---|---|
| `git init` / `git clone <url>` | Start a repo / copy a remote one |
| `git status` | What's changed, staged, untracked |
| `git add <file>` / `git add -p` | Stage a file / stage hunk by hunk |
| `git commit -m "msg"` | Commit staged changes |
| `git commit --amend` | Rewrite the last commit (message or content) |
| `git log --oneline --graph --all` | Compact history of every branch |
| `git diff` / `git diff --staged` | Unstaged / staged changes |
| `git show <sha>` | One commit's diff |

## Branches

| Command | What it does |
|---|---|
| `git switch -c feature` | Create and switch to a branch |
| `git switch main` | Switch branch |
| `git branch -d feature` | Delete a merged branch (`-D` to force) |
| `git merge feature` | Merge into the current branch |
| `git rebase main` | Replay your commits on top of `main` |
| `git rebase -i HEAD~3` | Squash, reorder, reword the last 3 commits |
| `git cherry-pick <sha>` | Copy one commit onto this branch |

## Remotes

| Command | What it does |
|---|---|
| `git fetch` | Download remote changes, don't touch your branch |
| `git pull --rebase` | Fetch + rebase your local commits on top |
| `git push -u origin feature` | Push and set upstream |
| `git push --force-with-lease` | Force-push, but refuse if someone else pushed |

## Undoing things

| Situation | Command |
|---|---|
| Unstage a file | `git restore --staged <file>` |
| Throw away local edits to a file | `git restore <file>` |
| Undo last commit, keep changes staged | `git reset --soft HEAD~1` |
| Undo last commit, keep changes unstaged | `git reset HEAD~1` |
| Undo last commit and its changes | `git reset --hard HEAD~1` |
| Undo a pushed commit safely | `git revert <sha>` (new commit) |
| Find a "lost" commit | `git reflog`, then `git switch -c rescue <sha>` |
| Park work in progress | `git stash` → `git stash pop` |

## merge vs rebase

- **Merge** keeps history as it happened and adds a merge commit. Safe on shared branches.
- **Rebase** rewrites your commits on top of the target: linear history, but new SHAs. **Never rebase commits others have pulled.**
- Common team rule: rebase your feature branch locally, merge (or squash-merge) into `main` via PR.

## Finding things

| Command | What it does |
|---|---|
| `git blame <file>` | Who last changed each line |
| `git log -S "text"` | Commits that added/removed `text` |
| `git bisect start / good / bad` | Binary-search the commit that broke something |
