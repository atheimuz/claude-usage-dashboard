#!/usr/bin/env node
/**
 * Figma MCP Server
 *
 * This server provides tools to interact with the Figma REST API,
 * including file inspection, comments, components, and styles.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { initializeClient } from "./api-client.js";
import { registerFileTools } from "./tools/files.js";
import { registerCommentTools } from "./tools/comments.js";
import { registerComponentTools } from "./tools/components.js";

const SERVER_NAME = "figma-mcp-server";
const SERVER_VERSION = "1.0.0";

async function main(): Promise<void> {
  const accessToken = process.env.FIGMA_ACCESS_TOKEN;

  if (!accessToken) {
    console.error("ERROR: FIGMA_ACCESS_TOKEN environment variable is required");
    console.error("");
    console.error("To get a Figma access token:");
    console.error("1. Go to Figma Settings > Account > Personal access tokens");
    console.error("2. Create a new token with required scopes");
    console.error("3. Set the token: export FIGMA_ACCESS_TOKEN=your_token_here");
    process.exit(1);
  }

  initializeClient(accessToken);

  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION
  });

  registerFileTools(server);
  registerCommentTools(server);
  registerComponentTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error(`${SERVER_NAME} v${SERVER_VERSION} running via stdio`);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
