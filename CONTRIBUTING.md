# Contributing to Chronomage

Thank you for your interest in contributing to Chronomage! This document provides guidelines for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [How Can I Contribute?](#how-can-i-contribute)
3. [Reporting Bugs](#reporting-bugs)
4. [Suggesting Features](#suggesting-features)
5. [Contributing Code](#contributing-code)
6. [Contributing Documentation](#contributing-documentation)
7. [Style Guidelines](#style-guidelines)
8. [Development Setup](#development-setup)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for everyone, regardless of:
- Experience level
- Background
- Identity
- Technology choices

### Expected Behavior

- Be respectful and considerate
- Welcome newcomers and help them learn
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Personal attacks or trolling
- Publishing others' private information
- Other conduct inappropriate for a professional setting

### Reporting

If you experience or witness unacceptable behavior, please report it to the project maintainers.

---

## How Can I Contribute?

### Ways to Contribute

1. **Report Bugs** - Found a problem? Let us know!
2. **Suggest Features** - Have an idea? Share it!
3. **Improve Documentation** - Help others understand better
4. **Write Code** - Fix bugs or implement features
5. **Test** - Try new features and provide feedback
6. **Help Users** - Answer questions in issues or discussions

### First-Time Contributors

Look for issues labeled:
- `good first issue` - Good for beginners
- `help wanted` - We'd love help with these
- `documentation` - Documentation improvements

---

## Reporting Bugs

### Before Reporting

1. **Check existing issues** - Someone may have already reported it
2. **Try the latest version** - The bug might already be fixed
3. **Verify it's a bug** - Not expected behavior or misconfiguration

### Creating a Bug Report

**Include:**

1. **Clear Title** - Describe the issue briefly
2. **Steps to Reproduce** - How to trigger the bug
3. **Expected Behavior** - What should happen
4. **Actual Behavior** - What actually happens
5. **Environment**:
   - OS (Windows, Linux, macOS)
   - Node.js version
   - Bot version
   - Discord.js version
6. **Logs/Screenshots** - If applicable
7. **Additional Context** - Any other relevant information

**Example:**

```markdown
## Bug: Events not created for Voice channels

**Steps to Reproduce:**
1. Use `/schedule create` with `location_channel:#voice-chat`
2. Complete the wizard
3. Check Discord events

**Expected:** Events created in Voice channel
**Actual:** Error message about permissions

**Environment:**
- Windows 11
- Node.js 20.10.0
- Chronomage 1.0.0

**Logs:**
```
[Error] Missing permissions: Manage Events
```

**Additional:** Bot has Manage Events at server level but not channel level.
```

---

## Suggesting Features

### Before Suggesting

1. **Check existing issues** - It might already be proposed
2. **Check documentation** - Feature might already exist
3. **Consider alternatives** - Are there workarounds?

### Creating a Feature Request

**Include:**

1. **Clear Title** - Describe the feature briefly
2. **Problem Statement** - What problem does this solve?
3. **Proposed Solution** - How should it work?
4. **Alternatives** - Other ways to solve the problem
5. **Use Cases** - When would this be useful?
6. **Examples** - How would users interact with it?

**Example:**

```markdown
## Feature: Edit schedules without recreating

**Problem:**
Currently, to modify a schedule, users must:
1. Cancel the existing schedule
2. Create a new one
3. Re-enter all labels

This is time-consuming and prone to errors.

**Proposed Solution:**
Add `/schedule edit id:schedule-id` command that:
- Opens wizard pre-filled with current values
- Allows editing specific labels
- Updates schedule without deletion

**Use Cases:**
- Fixing typos in event labels
- Adjusting timing (bloc, start_time)
- Adding/removing labels from cycle

**Example Usage:**
```
/schedule edit id:abc123
```
Then modify values in wizard.
```

---

## Contributing Code

### Development Process

1. **Fork the repository**
2. **Create a feature branch** - `git checkout -b feature/your-feature-name`
3. **Make your changes**
4. **Test thoroughly**
5. **Commit with clear messages**
6. **Push to your fork**
7. **Create a Pull Request**

### Pull Request Process

**Before submitting:**

1. **Update documentation** - If you changed behavior
2. **Add tests** - If applicable
3. **Run linter** - `pnpm run lint` (if available)
4. **Test locally** - Verify everything works
5. **Update changelog** - Add your changes

**PR Description should include:**

1. **What** - What does this PR do?
2. **Why** - Why is this change needed?
3. **How** - How does it work?
4. **Testing** - How did you test it?
5. **Related Issues** - Link to relevant issues

**Example:**

```markdown
## Add schedule edit functionality

**What:**
Implements `/schedule edit` command allowing users to modify existing schedules.

**Why:**
Solves issue #123 - users requested ability to edit schedules without recreation.

**How:**
- Added `edit.ts` command file
- Modified wizard to accept pre-filled values
- Updated schedule service with edit method

**Testing:**
- Created test schedule
- Edited various properties (bloc, time, labels)
- Verified events updated correctly
- Tested with multiple schedules

**Related Issues:**
Closes #123
```

### Code Review

All submissions require review:
- Maintainers will review your code
- They may request changes
- Be open to feedback
- Respond to comments
- Update PR as needed

---

## Contributing Documentation

### Types of Documentation

1. **User Documentation** - How to use features
2. **Developer Documentation** - How to contribute
3. **API Documentation** - Code comments and types
4. **README** - Project overview

### Documentation Guidelines

**Writing Style:**

- Write in clear, simple English
- Use active voice
- Be concise but complete
- Include examples
- Use proper formatting

**Structure:**

- Use headings and subheadings
- Include table of contents for long documents
- Add links between related documents
- Use lists for multiple items
- Include code blocks for commands

**Examples:**

Always include examples:
```markdown
## Good Example:

Use `/schedule create` to create a new schedule:

```
/schedule create count:3 bloc:1w start_time:20:00 len:2h location_elsewhere:Online
```

This creates a weekly schedule with 3 rotating event labels.
```

**Testing Documentation:**

- Follow your own instructions
- Verify all commands work
- Check all links
- Ensure code blocks are formatted correctly

---

## Style Guidelines

### Code Style

**TypeScript:**

- Follow existing code style
- Use meaningful variable names
- Add comments for complex logic
- Use TypeScript types properly
- Follow the project's linting rules

**Example:**

```typescript
// Good
async function createSchedule(options: ScheduleOptions): Promise<Schedule> {
  // Validate options
  if (!options.count || options.count < 1) {
    throw new Error("Count must be at least 1");
  }
  
  // Create schedule
  const schedule = await Schedule.create(options);
  return schedule;
}

// Avoid
async function cs(o: any): Promise<any> {
  if (!o.c || o.c < 1) throw new Error("Count must be at least 1");
  const s = await Schedule.create(o);
  return s;
}
```

### Commit Messages

**Format:**

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting, no code change
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Maintenance

**Examples:**

```
feat(schedule): add edit command

Implements schedule editing functionality allowing users to modify
existing schedules without recreation.

Closes #123
```

```
fix(wizard): prevent duplicate label submission

Fixed issue where clicking submit multiple times created duplicate
labels in the schedule.

Fixes #456
```

### Documentation Style

**Markdown:**

- Use proper heading levels (`#`, `##`, `###`)
- Include blank lines around code blocks
- Use backticks for inline code
- Use triple backticks for code blocks
- Include language identifier in code blocks

**Example:**

````markdown
## Good

To create a schedule, use:

```javascript
/schedule create count:3 bloc:1w
```

This creates a schedule with 3 labels.

## Avoid

To create a schedule, use:
`/schedule create count:3 bloc:1w`
This creates a schedule with 3 labels.
````

---

## Development Setup

### Prerequisites

- Node.js 20.x
- pnpm
- Git
- Discord account and bot token

### Setup Steps

1. **Fork and clone**
   ```bash
   git clone https://github.com/your-username/chronomage.git
   cd chronomage
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your bot token
   ```

4. **Run in development**
   ```bash
   pnpm dev
   ```

### Testing

**Manual Testing:**
1. Create test Discord server
2. Add your bot
3. Test your changes thoroughly
4. Try edge cases

**Automated Testing:**
- Run tests: `pnpm test` (if available)
- Run linter: `pnpm lint` (if available)

### Building

```bash
pnpm build
```

Verify build completes without errors.

---

## Getting Help

### Questions?

- Check existing documentation
- Search closed issues
- Open a discussion (if enabled)
- Ask in pull request comments

### Stuck?

Don't hesitate to ask for help! Everyone was a beginner once.

---

## Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes
- Git commit history

Thank you for contributing to Chronomage! 🎉

---

**Last Updated**: October 25, 2025

For more information:
- [User Guide](docs/USER_GUIDE.md)
- [Developer README](README.md)
- [Code of Conduct](#code-of-conduct)
