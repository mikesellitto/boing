# Instructions for Claude

Read CONTRIBUTING.md for commit message style and git history guidelines

Always amend commits when fixing issues - never create separate fix commits

## CRITICAL: Commit Amendment Rules
When making changes that relate to or fix the previous commit:
- ALWAYS use `git commit --amend` instead of creating a new commit
- This includes:
  - Fixing issues from the previous commit
  - Adding related changes to the same feature
  - Cleaning up code from the previous work
  - Any changes that logically belong with the previous commit
- Only create a NEW commit when starting completely unrelated work
- When in doubt, AMEND don't create new commits

## CRITICAL Git Commit Rules
NEVER include "Claude" in commits in ANY way:
- NO Co-Authored-By: Claude
- NO mention of Claude or AI in commit messages
- NO "Generated with Claude Code" signatures
- Commits should appear as if written by the repository owner
- Use the existing git config (user.name and user.email) without modification