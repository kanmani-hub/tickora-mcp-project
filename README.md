# Full Documentation: Tickora × Claude MCP Layer

## Project Overview

This project implements a **Model Context Protocol (MCP) layer** that connects the **Tickora CRM application** to **Claude AI** (Anthropic's language model). It provides two interfaces:

1. **MCP Server** (`mcp-server.js`) - For integration with Claude Desktop
2. **Web Chat UI** (`index.html` + `app.js`) - Browser-based interface for direct interaction

The system allows Claude to access real-time data from Tickora CRM (people, companies, deals, tasks, tickets, etc.) and answer questions about your CRM data using natural language.

## Project Structure

```
tickora-mcp-project/
├── mcp-server.js          # MCP server for Claude Desktop
├── app.js                 # Express server for web UI backend
├── index.html             # Web chat interface (frontend)
├── package.json           # Project dependencies and metadata
├── README.md              # Basic documentation
├── .env.example           # Environment variables template
└── claude_desktop_config.json  # Claude Desktop configuration
```

## Dependencies

Based on `package.json`:

- **@modelcontextprotocol/sdk**: MCP protocol implementation
- **dotenv**: Environment variable management
- **express**: Web server framework
- **node-fetch**: HTTP client for API calls

## Environment Configuration

Create a `.env` file from `.env.example` with:

```env
TICKORA_BASE_URL=https://www.web.tickora.co.in
TICKORA_USERNAME=your_username
TICKORA_PASSWORD=your_password
```

## MCP Server (`mcp-server.js`)

### Purpose
The MCP server enables Claude Desktop to communicate with Tickora CRM through the Model Context Protocol.

### Key Components

#### Authentication
- Supports both JSON-based and form-based login
- Handles session cookies and Bearer tokens
- Automatic token refresh on 401 errors

#### Available Tools
The server exposes the following MCP tools:

- `tickora_login` - Authenticate with Tickora
- `tickora_get_people` - Fetch all people
- `tickora_get_companies` - Fetch all companies
- `tickora_get_contacts` - Fetch all contacts
- `tickora_get_leads` - Fetch all leads
- `tickora_get_deals` - Fetch all deals
- `tickora_get_tasks` - Fetch all tasks
- `tickora_get_tickets` - Fetch all tickets
- `tickora_get_notes` - Fetch all notes
- `tickora_get_activities` - Fetch all activities
- `tickora_get_users` - Fetch all users
- `tickora_get_pipelines` - Fetch all pipelines
- `tickora_get_tags` - Fetch all tags
- `tickora_fetch_all` - Fetch data from ALL endpoints simultaneously
- `tickora_custom_request` - Make custom GET requests to any Tickora endpoint

#### API Endpoints
The server maps to these Tickora API endpoints:
```javascript
const ENDPOINTS = {
  people: "/api/people",
  companies: "/api/companies",
  contacts: "/api/contacts",
  leads: "/api/leads",
  deals: "/api/deals",
  tasks: "/api/tasks",
  tickets: "/api/tickets",
  notes: "/api/notes",
  activities: "/api/activities",
  users: "/api/users",
  pipelines: "/api/pipelines",
  tags: "/api/tags",
};
```

### Usage with Claude Desktop

1. Install dependencies: `npm install`
2. Configure `.env` with credentials
3. Update `claude_desktop_config.json` with your paths
4. Copy config to Claude Desktop directory
5. Restart Claude Desktop

## Web UI (`index.html` + `app.js`)

### Purpose
Provides a browser-based chat interface where users can directly interact with Claude + Tickora data.

### Frontend (`index.html`)

#### Features
- Modern, dark-themed UI with custom CSS
- Real-time chat interface
- Configuration sidebar for credentials
- Tool call visualization
- Typing indicators
- Auto-resizing text input

#### Key Functions
- `connect()` - Validates credentials and establishes connection
- `send()` - Sends user messages to Claude API with tool access
- `callTickoraTool()` - Executes Tickora API calls from the browser
- `addMessage()` - Renders chat messages
- `showTyping()` / `removeTyping()` - Loading indicators

#### Claude Integration
- Uses Anthropic's Messages API
- Implements tool calling loop for multi-step interactions
- Maintains conversation history
- Handles tool results and continues conversation

### Backend (`app.js`)

#### Purpose
Simple Express server to handle authentication for the web UI.

#### Endpoints
- `POST /login` - Authenticates with Tickora and stores session cookie
- `GET /people` - Fetches people data (example endpoint)

**Note**: The current `app.js` is minimal and only implements basic login and one data endpoint. It may need expansion for full functionality.

## API Reference

### Tickora API Integration

All tools support optional parameters:
- `page` (number): Page number for pagination
- `limit` (number): Results per page (default: 50)
- `search` (string): Search/filter query

### Authentication Flow

1. Attempt JSON login to `/api/auth/login`
2. Fallback to form-based login to `/login`
3. Extract session cookie or Bearer token
4. Include auth headers in subsequent requests

### Error Handling

- Automatic re-authentication on 401 responses
- Graceful handling of API failures
- Promise.allSettled for bulk operations in `tickora_fetch_all`

## Security Considerations

- Credentials stored only in `.env` (never in code)
- `.env` should be added to `.gitignore`
- Session management with proper cookie handling
- No hardcoded secrets in source code

## Development Notes

### Running the Project

#### Web UI
1. Open `index.html` in browser
2. Configure credentials in sidebar
3. Click "Connect"
4. Start chatting

#### MCP Server
1. `npm install`
2. Configure `.env`
3. `node mcp-server.js` (stdio mode for Claude Desktop)

### Testing
The project includes a basic test script placeholder in `package.json`:
```json
"scripts": {
  "test": "echo \"Error: no test specified\" && exit 1"
}
```

### Known Issues
- `node app.js` exits with code 1 (likely missing error handling or incomplete implementation)
- Web UI backend (`app.js`) is minimal and may need additional endpoints

## Repository Information

- **GitHub**: https://github.com/Sivakaami052001/tickora-mcp-project
- **License**: ISC
- **Main Entry**: `mcp-server.js`

## Future Enhancements

- Add more comprehensive error handling
- Implement full CRUD operations (not just GET)
- Add data caching for performance
- Expand web UI backend with all Tickora endpoints
- Add unit tests and integration tests
- Implement rate limiting and request throttling
