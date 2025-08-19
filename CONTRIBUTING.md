# Contributing to Boing

## Commit Message Guidelines

We follow a specific commit message style to maintain a clean and readable git history.

### Format Rules

- **Use imperative mood** - "Add feature" not "Added feature" or "Adds feature"
- **No emojis** - Keep commit messages professional
- **No colons** - Don't use prefixes like "fix:" or "feat:"
- **No periods** - Don't end the summary line with a period
- **Commas are fine** - Use them to separate items in lists
- **Keep it concise** - Don't be overly verbose

### Single Line Commits

Most commits should be a single line:
```
Add push notification service with MCP integration
Fix duplicate notification bug in combat detector
Update service worker to handle high priority notifications
Remove deprecated authentication method
```

### Multi-line Commits

When more detail is needed, use this format:
- First line: Summary in imperative mood (max 72 characters)
- Blank line
- Additional details with bullet points if needed

Example:
```
Update service worker to handle high priority notifications

- Remove timeout-based notifications
- Add target death detection  
- Improve combat state tracking
- Fix race condition in subscription cleanup
```

### What NOT to Do

❌ **Don't use emoji:**
```
🔥 Add new feature
```

❌ **Don't use colons or prefixes:**
```
fix: resolve notification delay
feat: add new API endpoint
```

❌ **Don't use past tense:**
```
Added new notification system
Fixed the bug in service worker
```

❌ **Don't add periods:**
```
Add new notification system.
```

❌ **Don't be overly verbose:**
```
Add a comprehensive notification system with support for multiple platforms and extensive configuration options for various use cases
```

❌ **Never include bot co-authors:**
```
Co-authored-by: AI Assistant <bot@example.com>
```

### Good Examples

✅ **Simple changes:**
```
Add WebSocket support for real-time updates
Fix memory leak in push service
Update dependencies to latest versions
Remove unused configuration variables
```

✅ **Complex changes:**
```
Refactor notification service for better modularity

- Extract push logic into separate service class
- Add dependency injection for configuration
- Improve error handling and retry logic
- Update tests to cover new architecture
```

## Pull Request Guidelines

- PR titles follow the same rules as commit messages
- Keep PR descriptions focused on what and why, not how
- Reference issues when applicable: "Fixes #123"
- No emojis in PR titles or descriptions

## Git History Guidelines

Keep the commit history clean and meaningful:

### Amending Commits

- **Always amend or fixup** when addressing PR review comments
- **Never add "fix typo" or "address comments" commits**
- Use `git commit --amend` for the latest commit
- Use `git rebase -i` with fixup for earlier commits

### When to Create New Commits vs Amend

✅ **Create a new commit when:**
- Adding new functionality beyond the original scope
- Making unrelated improvements discovered during review
- The changes represent a distinct logical unit

❌ **Amend/fixup existing commits when:**
- Fixing bugs in your PR
- Addressing review comments
- Fixing typos or formatting
- Updating documentation for the same feature

### Examples

**Good - Amending for fixes:**
```bash
# After review feedback to fix a bug in your PR
git add fixed-file.js
git commit --amend

# Or for an earlier commit
git add fixed-file.js
git commit --fixup HEAD~2
git rebase -i --autosquash HEAD~3
```

**Good - New commit for additional scope:**
```bash
# Original commit: "Add notification service"
# Review suggests adding rate limiting (new feature)
git add rate-limiter.js
git commit -m "Add rate limiting to notification service"
```

**Bad - Separate commits for fixes:**
```bash
# Don't do this:
git commit -m "Add notification service"
git commit -m "Fix typo"
git commit -m "Address review comments"
git commit -m "Fix bug in notification service"
```