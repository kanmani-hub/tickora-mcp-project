# Tickora × Claude MCP Layer

Connects your Tickora application to Claude LLM via the Model Context Protocol.

---

## Files

| File | Purpose |
|---|---|
| `mcp-server.js` | MCP server (Node.js, stdio) — for Claude Desktop |
| `index.html` | Web chat UI — open in browser, works directly |
| `.env.example` | Copy this to `.env` and fill in your credentials |
| `claude_desktop_config.json` | Register the MCP server in Claude Desktop |

---

## Quick Start — Web UI (Easiest)

1. Open `index.html` in your browser
2. Fill in the sidebar:
   - Tickora URL: `https://www.web.tickora.co.in`
   - Your new username & password
   - Your Anthropic API key (get from https://console.anthropic.com)
3. Click **Connect**
4. Ask Claude anything — e.g. *"Show all people"*, *"List open deals"*

---

## Setup — MCP Server (Claude Desktop)

### 1. Install dependencies
```bash
cd tickora-mcp
npm install
```

### 2. Create your .env file
```bash
cp .env.example .env
# Then edit .env with your actual credentials
```

### 3. Register with Claude Desktop

Edit `claude_desktop_config.json` — replace the path and credentials, then copy it to:

- **Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

### 4. Restart Claude Desktop

The Tickora tools will appear automatically.

---

## Available Tools

- `tickora_login` — Authenticate with Tickora
- `tickora_get_people` — Fetch all people
- `tickora_get_companies` — Fetch all companies
- `tickora_get_deals` — Fetch all deals
- `tickora_get_tasks` — Fetch all tasks
- `tickora_get_tickets` — Fetch all tickets
- `tickora_get_leads` — Fetch all leads
- `tickora_get_contacts` — Fetch all contacts
- `tickora_get_notes` — Fetch all notes
- `tickora_get_activities` — Fetch all activities
- `tickora_fetch_all` — Fetch ALL endpoints at once
- `tickora_custom_request` — Any custom endpoint

---

## Security

- ✅ Credentials stored in `.env` only — never in code
- ✅ Add `.env` to `.gitignore` — never commit it
- ✅ Change your password if it was ever shared in a chat
