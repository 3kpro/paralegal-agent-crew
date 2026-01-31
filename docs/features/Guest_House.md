You cannot directly “plug” this API into Antigravity yet, but you can expose a local HTTP API from your machine and then connect it to Antigravity via an MCP server or a custom tool integration.
​

What you’re actually building
To let an AI agent in Antigravity use your IDE “AnitGravity” (or any local app), you typically need three layers:
​

Local service API

A small HTTP server (e.g., in Node.js, Python/FastAPI, Go, etc.).

Exposes endpoints like POST /open-file, POST /run-command, GET /status that call into your IDE via its CLI, SDK, or scripting interface.

MCP or plugin wrapper

Antigravity uses Model Context Protocol (MCP) servers and “tools” to talk to external systems.
​

You wrap your local API as an MCP tool or similar “tool” definition so agents can call it safely.

Antigravity configuration

In Antigravity’s settings, you register your MCP server / tool so agents can see and use it in projects.
​

Step 1: Create a simple local HTTP API
High‑level steps (language‑agnostic):

Pick a language and framework

Examples:

Node.js + Express

Python + FastAPI or Flask

Go + net/http

Define minimal endpoints (examples):

POST /open-file with JSON body { "path": "/path/to/file" }

POST /run-command with { "command": "build" }

GET /status returning the IDE/project status

Inside each handler, call into your IDE:

If “AnitGravity” has:

A command‑line interface: call it via child_process (Node) or subprocess (Python).

An extension/plugin API: import its SDK and call the relevant functions.

Return JSON responses (e.g., { "success": true, "result": ... }).

Run it locally

Bind to localhost, e.g. http://127.0.0.1:8000.

Optionally secure it (auth token in headers, localhost only firewall rule, etc.).
​

If you tell what language you prefer, a minimal code skeleton for the API can be provided.

Step 2: Wrap the API as an MCP server/tool
Antigravity integrates external systems primarily through MCP servers, which expose tools an agent can call.
​

Conceptually:

Define tool schemas that mirror your API endpoints, e.g.:

Tool: open_file → calls POST /open-file

Tool: run_command → calls POST /run-command

Implement an MCP server:

The server receives tool calls from Antigravity and forwards them to your HTTP API.

It handles auth, parameters, and returns structured results back to the agent.

Configure the MCP server in Antigravity:

In Antigravity’s MCP configuration UI, point to your MCP server (host/port, auth).
​

Test that the agent can see tools like open_file and successfully call them.

The official docs describe how to connect MCP servers and give examples for databases; your server would be similar but target your local API instead.
​

Step 3: Register it in Antigravity
Within the Antigravity IDE:
​

Open the MCP / tools section (often under “Connections”, “MCP Store”, or similar).

Add a new custom MCP server:

URL: http://localhost:<port-of-your-mcp-server>

Any auth you configured.

Enable the connection for your current workspace/project.

In an agent chat, check that the new tools appear and try a simple action like “Open file main.py”.

What you should do next
If you share:

Whether “AnitGravity” has a CLI, SDK, or any docs.

Your preferred language/runtime.

then a concrete example can be provided, e.g.:

A complete FastAPI server exposing open_file and run_command.

A matching MCP tool definition that Antigravity can use to call that API.