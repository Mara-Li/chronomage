# Development guide
## Prerequisites
### Required software
- **[Node.js](https://nodejs.org/)** v24.14.0 or higher
- **[pnpm](https://pnpm.io/installation)** package manager
- **[Git](https://git-scm.com/downloads)**

### Optional
- [fnm](https://github.com/Schniz/fnm)

### Discord setup
- A Discord account with server administrator access
- A Discord application and bot token ([Developer Portal](https://discord.com/developers/applications))

---

## Configure environment variables
Create a `.env` file in the project root:

```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_id_here
```

> [!important] ⚠️ Never commit `.env` to version control.

## Database management
Data is stored in `data/enmap.sqlite`.
