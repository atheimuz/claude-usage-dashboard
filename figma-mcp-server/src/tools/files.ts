/**
 * Figma File Tools
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { makeApiRequest, handleApiError } from "../api-client.js";
import { ResponseFormat, ImageFormat } from "../types.js";
import type { FigmaFile, FigmaFileMetadata, FigmaImageResponse, FigmaNode } from "../types.js";
import { formatNodeTree, formatFileMetadataMarkdown, truncateIfNeeded } from "../utils/formatters.js";

const GetFileInputSchema = z.object({
  file_key: z.string()
    .min(1, "File key is required")
    .describe("The key of the Figma file (found in the URL: figma.com/file/{file_key}/...)"),
  node_ids: z.string()
    .optional()
    .describe("Comma-separated list of node IDs to retrieve. If omitted, returns entire file"),
  depth: z.number()
    .int()
    .min(1)
    .max(10)
    .optional()
    .describe("Depth of the node tree to retrieve (1-10). Default returns full depth"),
  version: z.string()
    .optional()
    .describe("Specific version ID to retrieve. Omit for latest version"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format: 'markdown' for human-readable or 'json' for machine-readable")
}).strict();

const GetFileNodesInputSchema = z.object({
  file_key: z.string()
    .min(1, "File key is required")
    .describe("The key of the Figma file"),
  node_ids: z.string()
    .min(1, "Node IDs are required")
    .describe("Comma-separated list of node IDs to retrieve (e.g., '1:2,3:4')"),
  depth: z.number()
    .int()
    .min(1)
    .max(10)
    .optional()
    .describe("Depth of the node tree to retrieve"),
  version: z.string()
    .optional()
    .describe("Specific version ID"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format")
}).strict();

const GetFileMetadataInputSchema = z.object({
  file_key: z.string()
    .min(1, "File key is required")
    .describe("The key of the Figma file"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format")
}).strict();

const ExportImagesInputSchema = z.object({
  file_key: z.string()
    .min(1, "File key is required")
    .describe("The key of the Figma file"),
  node_ids: z.string()
    .min(1, "Node IDs are required")
    .describe("Comma-separated list of node IDs to export"),
  format: z.nativeEnum(ImageFormat)
    .default(ImageFormat.PNG)
    .describe("Export format: jpg, png, svg, or pdf"),
  scale: z.number()
    .min(0.01)
    .max(4)
    .default(1)
    .describe("Scale factor (0.01-4). Default is 1"),
  svg_include_id: z.boolean()
    .optional()
    .describe("Include node ID in SVG output"),
  svg_outline_text: z.boolean()
    .optional()
    .describe("Convert text to outlines in SVG"),
  contents_only: z.boolean()
    .optional()
    .describe("Export only contents without frame background"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format")
}).strict();

export function registerFileTools(server: McpServer): void {
  server.registerTool(
    "figma_get_file",
    {
      title: "Get Figma File",
      description: `Retrieves a Figma file's document structure as JSON.

This tool fetches the complete node tree of a Figma file, including all layers, frames, components, and their properties. Use this to inspect design structure, find specific elements, or analyze file contents.

Args:
  - file_key (string, required): The Figma file key from the URL
  - node_ids (string, optional): Comma-separated node IDs to filter results
  - depth (number, optional): Tree traversal depth (1-10)
  - version (string, optional): Specific version ID
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  File name, version info, and hierarchical node tree with types and properties.

Examples:
  - Get entire file: file_key="abc123XYZ"
  - Get specific frames: file_key="abc123XYZ", node_ids="1:2,3:4"
  - Get shallow structure: file_key="abc123XYZ", depth=2`,
      inputSchema: GetFileInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params) => {
      try {
        const queryParams: Record<string, unknown> = {};
        if (params.node_ids) queryParams.ids = params.node_ids;
        if (params.depth) queryParams.depth = params.depth;
        if (params.version) queryParams.version = params.version;

        const data = await makeApiRequest<FigmaFile>(
          `/files/${params.file_key}`,
          "GET",
          undefined,
          queryParams
        );

        const output = {
          name: data.name,
          lastModified: data.lastModified,
          version: data.version,
          editorType: data.editorType,
          thumbnailUrl: data.thumbnailUrl,
          document: data.document,
          componentCount: Object.keys(data.components || {}).length,
          styleCount: Object.keys(data.styles || {}).length
        };

        let textContent: string;
        if (params.response_format === ResponseFormat.MARKDOWN) {
          const lines = [
            formatFileMetadataMarkdown({
              name: data.name,
              lastModified: data.lastModified,
              version: data.version,
              thumbnailUrl: data.thumbnailUrl,
              editorType: data.editorType
            }),
            "",
            `- **Components**: ${output.componentCount}`,
            `- **Styles**: ${output.styleCount}`,
            "",
            "## Document Structure",
            "",
            formatNodeTree(data.document, 0, params.depth || 3)
          ];
          textContent = lines.join("\n");
        } else {
          textContent = JSON.stringify(output, null, 2);
        }

        return {
          content: [{ type: "text", text: textContent }],
          structuredContent: output
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: handleApiError(error) }]
        };
      }
    }
  );

  server.registerTool(
    "figma_get_file_nodes",
    {
      title: "Get Figma File Nodes",
      description: `Retrieves specific nodes from a Figma file by their IDs.

More efficient than fetching the entire file when you only need specific elements. Returns the requested nodes with their complete subtrees.

Args:
  - file_key (string, required): The Figma file key
  - node_ids (string, required): Comma-separated node IDs (e.g., "1:2,3:4")
  - depth (number, optional): Tree depth limit
  - version (string, optional): Specific version ID
  - response_format ('markdown' | 'json'): Output format

Returns:
  Map of node ID to node data with complete subtree.

Examples:
  - Get single node: file_key="abc123", node_ids="1:2"
  - Get multiple nodes: file_key="abc123", node_ids="1:2,3:4,5:6"`,
      inputSchema: GetFileNodesInputSchema,
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
          ids: params.node_ids
        };
        if (params.depth) queryParams.depth = params.depth;
        if (params.version) queryParams.version = params.version;

        const data = await makeApiRequest<{
          name: string;
          lastModified: string;
          nodes: Record<string, { document: FigmaNode } | null>;
        }>(
          `/files/${params.file_key}/nodes`,
          "GET",
          undefined,
          queryParams
        );

        const nodes = Object.entries(data.nodes)
          .filter(([, node]) => node !== null)
          .map(([id, node]) => ({
            id,
            document: node!.document
          }));

        let textContent: string;
        if (params.response_format === ResponseFormat.MARKDOWN) {
          const lines = [`# Nodes from ${data.name}`, ""];
          for (const { id, document } of nodes) {
            lines.push(`## Node ${id}`);
            lines.push("");
            lines.push(formatNodeTree(document, 0, params.depth || 3));
            lines.push("");
          }
          textContent = lines.join("\n");
        } else {
          textContent = JSON.stringify({ name: data.name, nodes }, null, 2);
        }

        return {
          content: [{ type: "text", text: textContent }],
          structuredContent: { name: data.name, nodes }
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: handleApiError(error) }]
        };
      }
    }
  );

  server.registerTool(
    "figma_get_file_metadata",
    {
      title: "Get Figma File Metadata",
      description: `Retrieves metadata about a Figma file without fetching the document content.

Faster than fetching the full file when you only need basic info like name, version, last modified date, and thumbnail URL.

Args:
  - file_key (string, required): The Figma file key
  - response_format ('markdown' | 'json'): Output format

Returns:
  File name, version, timestamps, thumbnail URL, creator info, and access level.`,
      inputSchema: GetFileMetadataInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params) => {
      try {
        const data = await makeApiRequest<FigmaFileMetadata>(
          `/files/${params.file_key}/meta`,
          "GET"
        );

        let textContent: string;
        if (params.response_format === ResponseFormat.MARKDOWN) {
          const lines = [
            `# ${data.name}`,
            "",
            `- **Key**: ${data.key}`,
            `- **Version**: ${data.version}`,
            `- **Last Modified**: ${new Date(data.last_modified).toLocaleString()}`,
            `- **Editor Type**: ${data.editor_type}`,
            `- **Role**: ${data.role}`,
            `- **Link Access**: ${data.link_access}`,
            `- **Thumbnail**: ${data.thumbnail_url}`,
            "",
            "## Creator",
            `- **Handle**: ${data.creator.handle}`,
            `- **ID**: ${data.creator.id}`
          ];
          textContent = lines.join("\n");
        } else {
          textContent = JSON.stringify(data, null, 2);
        }

        return {
          content: [{ type: "text", text: textContent }],
          structuredContent: data
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: handleApiError(error) }]
        };
      }
    }
  );

  server.registerTool(
    "figma_export_images",
    {
      title: "Export Figma Images",
      description: `Exports Figma nodes as images (PNG, JPG, SVG, or PDF).

Renders specified nodes and returns URLs to download the images. URLs are temporary and expire after a short period.

Args:
  - file_key (string, required): The Figma file key
  - node_ids (string, required): Comma-separated node IDs to export
  - format ('jpg' | 'png' | 'svg' | 'pdf'): Image format (default: 'png')
  - scale (number): Scale factor 0.01-4 (default: 1)
  - svg_include_id (boolean): Include node IDs in SVG
  - svg_outline_text (boolean): Convert text to outlines in SVG
  - contents_only (boolean): Export contents without frame background
  - response_format ('markdown' | 'json'): Output format

Returns:
  Map of node IDs to temporary image download URLs.

Examples:
  - Export as PNG: file_key="abc123", node_ids="1:2", format="png"
  - Export at 2x scale: file_key="abc123", node_ids="1:2", scale=2
  - Export as SVG: file_key="abc123", node_ids="1:2", format="svg"`,
      inputSchema: ExportImagesInputSchema,
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
          ids: params.node_ids,
          format: params.format,
          scale: params.scale
        };
        if (params.svg_include_id !== undefined) queryParams.svg_include_id = params.svg_include_id;
        if (params.svg_outline_text !== undefined) queryParams.svg_outline_text = params.svg_outline_text;
        if (params.contents_only !== undefined) queryParams.contents_only = params.contents_only;

        const data = await makeApiRequest<FigmaImageResponse>(
          `/images/${params.file_key}`,
          "GET",
          undefined,
          queryParams
        );

        if (data.err) {
          return {
            content: [{ type: "text", text: `Error: ${data.err}` }]
          };
        }

        const images = Object.entries(data.images)
          .filter(([, url]) => url !== null)
          .map(([nodeId, url]) => ({ nodeId, url: url as string }));

        let textContent: string;
        if (params.response_format === ResponseFormat.MARKDOWN) {
          const lines = [
            `# Exported Images`,
            "",
            `Format: ${params.format.toUpperCase()}, Scale: ${params.scale}x`,
            ""
          ];
          for (const { nodeId, url } of images) {
            lines.push(`## Node ${nodeId}`);
            lines.push(`[Download ${params.format.toUpperCase()}](${url})`);
            lines.push("");
          }
          if (images.length === 0) {
            lines.push("No images were generated. Check that the node IDs are valid.");
          }
          textContent = lines.join("\n");
        } else {
          textContent = JSON.stringify({ format: params.format, scale: params.scale, images }, null, 2);
        }

        return {
          content: [{ type: "text", text: textContent }],
          structuredContent: { format: params.format, scale: params.scale, images }
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: handleApiError(error) }]
        };
      }
    }
  );
}
