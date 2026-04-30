#!/usr/bin/env node
/**
 * Tickora MCP Server
 * Connects Tickora application to Claude LLM via Model Context Protocol
 * Credentials are loaded from .env file - NEVER hardcode them
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const BASE_URL = process.env.TICKORA_BASE_URL || "https://www.web.tickora.co.in";
let authToken = null;
let sessionCookie = null;

// ─── Auth ────────────────────────────────────────────────────────────────────
async function login() {
  const username = process.env.TICKORA_USERNAME;
  const password = process.env.TICKORA_PASSWORD;

  if (!username || !password) {
    throw new Error("TICKORA_USERNAME and TICKORA_PASSWORD must be set in .env");
  }

  // Try JSON login endpoint first
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (res.ok) {
    const data = await res.json();
    authToken = data.token || data.access_token || data.accessToken || null;
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) sessionCookie = setCookie.split(";")[0];
    return { success: true, method: "json" };
  }

  // Fallback: form-based login
  const formRes = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ email: username, password }),
    redirect: "manual",
  });

  const setCookie = formRes.headers.get("set-cookie");
  if (setCookie) {
    sessionCookie = setCookie.split(";")[0];
    return { success: true, method: "form" };
  }

  throw new Error(`Login failed. Status: ${formRes.status}`);
}

function authHeaders() {
  const headers = { "Content-Type": "application/json" };
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
  if (sessionCookie) headers["Cookie"] = sessionCookie;
  return headers;
}

async function tickoraFetch(path) {
  if (!authToken && !sessionCookie) await login();

  const res = await fetch(`${BASE_URL}${path}`, { headers: authHeaders() });

  if (res.status === 401) {
    // Token expired, re-login
    authToken = null;
    sessionCookie = null;
    await login();
    const retry = await fetch(`${BASE_URL}${path}`, { headers: authHeaders() });
    if (!retry.ok) throw new Error(`HTTP ${retry.status} for ${path}`);
    return retry.json();
  }

  if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`);
  return res.json();
}

// ─── Known Tickora Endpoints ─────────────────────────────────────────────────
const ENDPOINTS = {
  people:     "/api/people",
  companies:  "/api/companies",
  contacts:   "/api/contacts",
  leads:      "/api/leads",
  deals:      "/api/deals",
  tasks:      "/api/tasks",
  tickets:    "/api/tickets",
  notes:      "/api/notes",
  activities: "/api/activities",
  users:      "/api/users",
  pipelines:  "/api/pipelines",
  tags:       "/api/tags",
};

// ─── MCP Server ──────────────────────────────────────────────────────────────
const server = new Server(
  { name: "tickora-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "tickora_login",
      description: "Login to Tickora and obtain an auth token",
      inputSchema: { type: "object", properties: {} },
    },
    ...Object.entries(ENDPOINTS).map(([name, path]) => ({
      name: `tickora_get_${name}`,
      description: `Fetch all ${name} from Tickora`,
      inputSchema: {
        type: "object",
        properties: {
          page:   { type: "number", description: "Page number (default 1)" },
          limit:  { type: "number", description: "Results per page (default 50)" },
          search: { type: "string", description: "Optional search/filter query" },
        },
      },
    })),
    {
      name: "tickora_fetch_all",
      description: "Fetch data from ALL Tickora endpoints at once",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "tickora_custom_request",
      description: "Make a custom GET request to any Tickora endpoint",
      inputSchema: {
        type: "object",
        required: ["path"],
        properties: {
          path: { type: "string", description: "API path e.g. /api/people?page=2" },
        },
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // Login
    if (name === "tickora_login") {
      const result = await login();
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }

    // Individual endpoint tools
    for (const [endpointName, basePath] of Object.entries(ENDPOINTS)) {
      if (name === `tickora_get_${endpointName}`) {
        const params = new URLSearchParams();
        if (args?.page)   params.set("page", args.page);
        if (args?.limit)  params.set("limit", args.limit || 50);
        if (args?.search) params.set("search", args.search);
        const query = params.toString() ? `?${params}` : "";
        const data = await tickoraFetch(`${basePath}${query}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }
    }

    // Fetch all
    if (name === "tickora_fetch_all") {
      const results = {};
      await Promise.allSettled(
        Object.entries(ENDPOINTS).map(async ([key, path]) => {
          try { results[key] = await tickoraFetch(path); }
          catch (e) { results[key] = { error: e.message }; }
        })
      );
      return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] };
    }

    // Custom request
    if (name === "tickora_custom_request") {
      const data = await tickoraFetch(args.path);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (err) {
    return {
      content: [{ type: "text", text: `Error: ${err.message}` }],
      isError: true,
    };
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Tickora MCP Server running...");
