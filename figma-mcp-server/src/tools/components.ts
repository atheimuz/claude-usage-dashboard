/**
 * Figma Components and Styles Tools
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { makeApiRequest, handleApiError } from "../api-client.js";
import { ResponseFormat } from "../types.js";
import type { FigmaComponent, FigmaComponentSet, FigmaStyle } from "../types.js";
import { formatComponentsMarkdown, formatStylesMarkdown } from "../utils/formatters.js";

const GetTeamComponentsInputSchema = z.object({
  team_id: z.string()
    .min(1, "Team ID is required")
    .describe("The ID of the team"),
  page_size: z.number()
    .int()
    .min(1)
    .max(100)
    .default(30)
    .describe("Number of results per page (1-100, default: 30)"),
  cursor: z.string()
    .optional()
    .describe("Pagination cursor for next/previous page"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format")
}).strict();

const GetTeamStylesInputSchema = z.object({
  team_id: z.string()
    .min(1, "Team ID is required")
    .describe("The ID of the team"),
  page_size: z.number()
    .int()
    .min(1)
    .max(100)
    .default(30)
    .describe("Number of results per page"),
  cursor: z.string()
    .optional()
    .describe("Pagination cursor"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format")
}).strict();

const GetFileComponentsInputSchema = z.object({
  file_key: z.string()
    .min(1, "File key is required")
    .describe("The key of the Figma file"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format")
}).strict();

const GetComponentInputSchema = z.object({
  component_key: z.string()
    .min(1, "Component key is required")
    .describe("The unique key of the component"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format")
}).strict();

const GetStyleInputSchema = z.object({
  style_key: z.string()
    .min(1, "Style key is required")
    .describe("The unique key of the style"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format")
}).strict();

const GetTeamComponentSetsInputSchema = z.object({
  team_id: z.string()
    .min(1, "Team ID is required")
    .describe("The ID of the team"),
  page_size: z.number()
    .int()
    .min(1)
    .max(100)
    .default(30)
    .describe("Number of results per page"),
  cursor: z.string()
    .optional()
    .describe("Pagination cursor"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format")
}).strict();

interface PaginatedComponentsResponse {
  meta: { cursor?: { before?: number; after?: number } };
  components: FigmaComponent[];
}

interface PaginatedComponentSetsResponse {
  meta: { cursor?: { before?: number; after?: number } };
  component_sets: FigmaComponentSet[];
}

interface PaginatedStylesResponse {
  meta: { cursor?: { before?: number; after?: number } };
  styles: FigmaStyle[];
}

export function registerComponentTools(server: McpServer): void {
  server.registerTool(
    "figma_get_team_components",
    {
      title: "Get Team Components",
      description: `Retrieves published components from a team library.

Returns a paginated list of components published in the team's design system library.

Args:
  - team_id (string, required): The team ID
  - page_size (number): Results per page, 1-100 (default: 30)
  - cursor (string, optional): Pagination cursor
  - response_format ('markdown' | 'json'): Output format

Returns:
  List of components with key, name, description, thumbnail, and metadata.

Examples:
  - Get team components: team_id="123456789"
  - Get next page: team_id="123456789", cursor="abc123"`,
      inputSchema: GetTeamComponentsInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params) => {
      try {
        const queryParams: Record<string, unknown> = {
          page_size: params.page_size
        };
        if (params.cursor) queryParams.after = params.cursor;

        const data = await makeApiRequest<PaginatedComponentsResponse>(
          `/teams/${params.team_id}/components`,
          "GET",
          undefined,
          queryParams
        );

        const components = data.components || [];
        const nextCursor = data.meta?.cursor?.after?.toString();

        let textContent: string;
        if (params.response_format === ResponseFormat.MARKDOWN) {
          textContent = formatComponentsMarkdown(components);
          if (nextCursor) {
            textContent += `\n---\n*More results available. Use cursor: "${nextCursor}"*`;
          }
        } else {
          textContent = JSON.stringify({
            total: components.length,
            components,
            next_cursor: nextCursor
          }, null, 2);
        }

        return {
          content: [{ type: "text", text: textContent }],
          structuredContent: { total: components.length, components, next_cursor: nextCursor }
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: handleApiError(error) }]
        };
      }
    }
  );

  server.registerTool(
    "figma_get_team_component_sets",
    {
      title: "Get Team Component Sets",
      description: `Retrieves published component sets (variants) from a team library.

Component sets contain multiple variants of a component (e.g., button sizes, states).

Args:
  - team_id (string, required): The team ID
  - page_size (number): Results per page (default: 30)
  - cursor (string, optional): Pagination cursor
  - response_format ('markdown' | 'json'): Output format

Returns:
  List of component sets with their variants.`,
      inputSchema: GetTeamComponentSetsInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params) => {
      try {
        const queryParams: Record<string, unknown> = {
          page_size: params.page_size
        };
        if (params.cursor) queryParams.after = params.cursor;

        const data = await makeApiRequest<PaginatedComponentSetsResponse>(
          `/teams/${params.team_id}/component_sets`,
          "GET",
          undefined,
          queryParams
        );

        const componentSets = data.component_sets || [];
        const nextCursor = data.meta?.cursor?.after?.toString();

        let textContent: string;
        if (params.response_format === ResponseFormat.MARKDOWN) {
          if (componentSets.length === 0) {
            textContent = "No component sets found.";
          } else {
            const lines = [`# Component Sets (${componentSets.length})`, ""];
            for (const set of componentSets) {
              lines.push(`## ${set.name}`);
              lines.push(`- **Key**: ${set.key}`);
              lines.push(`- **Node ID**: ${set.node_id}`);
              if (set.description) {
                lines.push(`- **Description**: ${set.description}`);
              }
              lines.push(`- **Updated**: ${new Date(set.updated_at).toLocaleDateString()}`);
              lines.push("");
            }
            textContent = lines.join("\n");
          }
          if (nextCursor) {
            textContent += `\n---\n*More results available. Use cursor: "${nextCursor}"*`;
          }
        } else {
          textContent = JSON.stringify({
            total: componentSets.length,
            component_sets: componentSets,
            next_cursor: nextCursor
          }, null, 2);
        }

        return {
          content: [{ type: "text", text: textContent }],
          structuredContent: { total: componentSets.length, component_sets: componentSets, next_cursor: nextCursor }
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: handleApiError(error) }]
        };
      }
    }
  );

  server.registerTool(
    "figma_get_team_styles",
    {
      title: "Get Team Styles",
      description: `Retrieves published styles from a team library.

Returns styles including colors (FILL), typography (TEXT), effects (EFFECT), and grids (GRID).

Args:
  - team_id (string, required): The team ID
  - page_size (number): Results per page (default: 30)
  - cursor (string, optional): Pagination cursor
  - response_format ('markdown' | 'json'): Output format

Returns:
  List of styles grouped by type with key, name, and description.`,
      inputSchema: GetTeamStylesInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params) => {
      try {
        const queryParams: Record<string, unknown> = {
          page_size: params.page_size
        };
        if (params.cursor) queryParams.after = params.cursor;

        const data = await makeApiRequest<PaginatedStylesResponse>(
          `/teams/${params.team_id}/styles`,
          "GET",
          undefined,
          queryParams
        );

        const styles = data.styles || [];
        const nextCursor = data.meta?.cursor?.after?.toString();

        let textContent: string;
        if (params.response_format === ResponseFormat.MARKDOWN) {
          textContent = formatStylesMarkdown(styles);
          if (nextCursor) {
            textContent += `\n---\n*More results available. Use cursor: "${nextCursor}"*`;
          }
        } else {
          textContent = JSON.stringify({
            total: styles.length,
            styles,
            next_cursor: nextCursor
          }, null, 2);
        }

        return {
          content: [{ type: "text", text: textContent }],
          structuredContent: { total: styles.length, styles, next_cursor: nextCursor }
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: handleApiError(error) }]
        };
      }
    }
  );

  server.registerTool(
    "figma_get_file_components",
    {
      title: "Get File Components",
      description: `Retrieves published components from a specific file.

Args:
  - file_key (string, required): The Figma file key
  - response_format ('markdown' | 'json'): Output format

Returns:
  List of components published from this file.`,
      inputSchema: GetFileComponentsInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params) => {
      try {
        const data = await makeApiRequest<{ meta: unknown; components: FigmaComponent[] }>(
          `/files/${params.file_key}/components`,
          "GET"
        );

        const components = data.components || [];

        let textContent: string;
        if (params.response_format === ResponseFormat.MARKDOWN) {
          textContent = formatComponentsMarkdown(components);
        } else {
          textContent = JSON.stringify({ total: components.length, components }, null, 2);
        }

        return {
          content: [{ type: "text", text: textContent }],
          structuredContent: { total: components.length, components }
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: handleApiError(error) }]
        };
      }
    }
  );

  server.registerTool(
    "figma_get_component",
    {
      title: "Get Component Details",
      description: `Retrieves detailed metadata for a specific component by its key.

Args:
  - component_key (string, required): The component's unique key
  - response_format ('markdown' | 'json'): Output format

Returns:
  Component details including name, description, thumbnail, file info, and containing frame.`,
      inputSchema: GetComponentInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params) => {
      try {
        const data = await makeApiRequest<{ meta: unknown; component: FigmaComponent }>(
          `/components/${params.component_key}`,
          "GET"
        );

        const component = data.component;

        let textContent: string;
        if (params.response_format === ResponseFormat.MARKDOWN) {
          const lines = [
            `# ${component.name}`,
            "",
            `- **Key**: ${component.key}`,
            `- **File Key**: ${component.file_key}`,
            `- **Node ID**: ${component.node_id}`,
          ];
          if (component.description) {
            lines.push(`- **Description**: ${component.description}`);
          }
          lines.push(`- **Created**: ${new Date(component.created_at).toLocaleString()}`);
          lines.push(`- **Updated**: ${new Date(component.updated_at).toLocaleString()}`);
          lines.push(`- **Thumbnail**: ${component.thumbnail_url}`);
          if (component.containing_frame) {
            lines.push("");
            lines.push("## Containing Frame");
            lines.push(`- **Name**: ${component.containing_frame.name}`);
            lines.push(`- **Page**: ${component.containing_frame.page_name}`);
          }
          textContent = lines.join("\n");
        } else {
          textContent = JSON.stringify(component, null, 2);
        }

        return {
          content: [{ type: "text", text: textContent }],
          structuredContent: component
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: handleApiError(error) }]
        };
      }
    }
  );

  server.registerTool(
    "figma_get_style",
    {
      title: "Get Style Details",
      description: `Retrieves detailed metadata for a specific style by its key.

Args:
  - style_key (string, required): The style's unique key
  - response_format ('markdown' | 'json'): Output format

Returns:
  Style details including name, type (FILL/TEXT/EFFECT/GRID), description, and file info.`,
      inputSchema: GetStyleInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params) => {
      try {
        const data = await makeApiRequest<{ meta: unknown; style: FigmaStyle }>(
          `/styles/${params.style_key}`,
          "GET"
        );

        const style = data.style;

        let textContent: string;
        if (params.response_format === ResponseFormat.MARKDOWN) {
          const lines = [
            `# ${style.name}`,
            "",
            `- **Key**: ${style.key}`,
            `- **Type**: ${style.style_type}`,
            `- **File Key**: ${style.file_key}`,
            `- **Node ID**: ${style.node_id}`,
          ];
          if (style.description) {
            lines.push(`- **Description**: ${style.description}`);
          }
          lines.push(`- **Created**: ${new Date(style.created_at).toLocaleString()}`);
          lines.push(`- **Updated**: ${new Date(style.updated_at).toLocaleString()}`);
          lines.push(`- **Thumbnail**: ${style.thumbnail_url}`);
          textContent = lines.join("\n");
        } else {
          textContent = JSON.stringify(style, null, 2);
        }

        return {
          content: [{ type: "text", text: textContent }],
          structuredContent: style
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: handleApiError(error) }]
        };
      }
    }
  );
}
