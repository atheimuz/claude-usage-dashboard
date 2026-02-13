/**
 * Figma Comments Tools
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { makeApiRequest, handleApiError } from "../api-client.js";
import { ResponseFormat } from "../types.js";
import type { FigmaComment, FigmaCommentsResponse } from "../types.js";
import { formatCommentsMarkdown } from "../utils/formatters.js";

const GetCommentsInputSchema = z.object({
  file_key: z.string()
    .min(1, "File key is required")
    .describe("The key of the Figma file"),
  as_markdown: z.boolean()
    .default(true)
    .describe("Return rich-text comments as markdown"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format: 'markdown' for human-readable or 'json' for machine-readable")
}).strict();

const PostCommentInputSchema = z.object({
  file_key: z.string()
    .min(1, "File key is required")
    .describe("The key of the Figma file"),
  message: z.string()
    .min(1, "Message is required")
    .max(10000, "Message must not exceed 10000 characters")
    .describe("The comment message to post"),
  node_id: z.string()
    .optional()
    .describe("Node ID to attach the comment to (e.g., '1:2')"),
  reply_to_comment_id: z.string()
    .optional()
    .describe("Comment ID to reply to"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format")
}).strict();

const DeleteCommentInputSchema = z.object({
  file_key: z.string()
    .min(1, "File key is required")
    .describe("The key of the Figma file"),
  comment_id: z.string()
    .min(1, "Comment ID is required")
    .describe("The ID of the comment to delete")
}).strict();

const GetCommentReactionsInputSchema = z.object({
  file_key: z.string()
    .min(1, "File key is required")
    .describe("The key of the Figma file"),
  comment_id: z.string()
    .min(1, "Comment ID is required")
    .describe("The ID of the comment"),
  cursor: z.string()
    .optional()
    .describe("Pagination cursor for next page"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format")
}).strict();

const PostReactionInputSchema = z.object({
  file_key: z.string()
    .min(1, "File key is required")
    .describe("The key of the Figma file"),
  comment_id: z.string()
    .min(1, "Comment ID is required")
    .describe("The ID of the comment"),
  emoji: z.string()
    .min(1, "Emoji is required")
    .describe("Emoji shortcode (e.g., ':heart:', ':thumbsup:')")
}).strict();

export function registerCommentTools(server: McpServer): void {
  server.registerTool(
    "figma_get_comments",
    {
      title: "Get Figma File Comments",
      description: `Retrieves all comments from a Figma file.

Returns the list of comments including author info, timestamps, message content, resolved status, and any reactions.

Args:
  - file_key (string, required): The Figma file key
  - as_markdown (boolean): Return rich-text as markdown (default: true)
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  List of comments with author, date, message, resolved status, and reactions.

Examples:
  - Get all comments: file_key="abc123XYZ"
  - Get as JSON: file_key="abc123XYZ", response_format="json"`,
      inputSchema: GetCommentsInputSchema,
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
        if (params.as_markdown) queryParams.as_md = true;

        const data = await makeApiRequest<FigmaCommentsResponse>(
          `/files/${params.file_key}/comments`,
          "GET",
          undefined,
          queryParams
        );

        const comments = data.comments || [];

        let textContent: string;
        if (params.response_format === ResponseFormat.MARKDOWN) {
          textContent = formatCommentsMarkdown(comments);
        } else {
          textContent = JSON.stringify({ total: comments.length, comments }, null, 2);
        }

        return {
          content: [{ type: "text", text: textContent }],
          structuredContent: { total: comments.length, comments }
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: handleApiError(error) }]
        };
      }
    }
  );

  server.registerTool(
    "figma_post_comment",
    {
      title: "Post Figma Comment",
      description: `Posts a new comment on a Figma file.

Creates a comment on the file, optionally attached to a specific node or as a reply to another comment.

Args:
  - file_key (string, required): The Figma file key
  - message (string, required): The comment message (max 10000 chars)
  - node_id (string, optional): Node ID to attach comment to
  - reply_to_comment_id (string, optional): Comment ID to reply to
  - response_format ('markdown' | 'json'): Output format

Returns:
  The created comment with its ID and metadata.

Examples:
  - Post file comment: file_key="abc123", message="Great design!"
  - Comment on node: file_key="abc123", message="Fix padding", node_id="1:2"
  - Reply to comment: file_key="abc123", message="Done!", reply_to_comment_id="456"`,
      inputSchema: PostCommentInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true
      }
    },
    async (params) => {
      try {
        const body: Record<string, unknown> = {
          message: params.message
        };
        if (params.reply_to_comment_id) {
          body.comment_id = params.reply_to_comment_id;
        }
        if (params.node_id) {
          body.client_meta = {
            node_id: params.node_id,
            node_offset: { x: 0, y: 0 }
          };
        }

        const comment = await makeApiRequest<FigmaComment>(
          `/files/${params.file_key}/comments`,
          "POST",
          body
        );

        let textContent: string;
        if (params.response_format === ResponseFormat.MARKDOWN) {
          const lines = [
            "# Comment Posted Successfully",
            "",
            `- **ID**: ${comment.id}`,
            `- **Author**: ${comment.user.handle}`,
            `- **Created**: ${new Date(comment.created_at).toLocaleString()}`,
            "",
            "## Message",
            comment.message
          ];
          textContent = lines.join("\n");
        } else {
          textContent = JSON.stringify(comment, null, 2);
        }

        return {
          content: [{ type: "text", text: textContent }],
          structuredContent: comment
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: handleApiError(error) }]
        };
      }
    }
  );

  server.registerTool(
    "figma_delete_comment",
    {
      title: "Delete Figma Comment",
      description: `Deletes a comment from a Figma file.

Only the author of the comment can delete it. This action cannot be undone.

Args:
  - file_key (string, required): The Figma file key
  - comment_id (string, required): The ID of the comment to delete

Returns:
  Confirmation of deletion.

Examples:
  - Delete comment: file_key="abc123", comment_id="456789"`,
      inputSchema: DeleteCommentInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params) => {
      try {
        await makeApiRequest<void>(
          `/files/${params.file_key}/comments/${params.comment_id}`,
          "DELETE"
        );

        return {
          content: [{
            type: "text",
            text: `Comment ${params.comment_id} deleted successfully.`
          }],
          structuredContent: { deleted: true, comment_id: params.comment_id }
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: handleApiError(error) }]
        };
      }
    }
  );

  server.registerTool(
    "figma_get_comment_reactions",
    {
      title: "Get Comment Reactions",
      description: `Retrieves reactions on a specific comment.

Returns a paginated list of emoji reactions with user info.

Args:
  - file_key (string, required): The Figma file key
  - comment_id (string, required): The comment ID
  - cursor (string, optional): Pagination cursor
  - response_format ('markdown' | 'json'): Output format

Returns:
  List of reactions with emoji and user info.`,
      inputSchema: GetCommentReactionsInputSchema,
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
        if (params.cursor) queryParams.cursor = params.cursor;

        const data = await makeApiRequest<{
          reactions: Array<{ emoji: string; created_at: string; user: { id: string; handle: string } }>;
          pagination?: { next_cursor?: string };
        }>(
          `/files/${params.file_key}/comments/${params.comment_id}/reactions`,
          "GET",
          undefined,
          queryParams
        );

        const reactions = data.reactions || [];

        let textContent: string;
        if (params.response_format === ResponseFormat.MARKDOWN) {
          if (reactions.length === 0) {
            textContent = "No reactions on this comment.";
          } else {
            const lines = [`# Reactions (${reactions.length})`, ""];
            const grouped = reactions.reduce((acc, r) => {
              if (!acc[r.emoji]) acc[r.emoji] = [];
              acc[r.emoji].push(r.user.handle);
              return acc;
            }, {} as Record<string, string[]>);

            for (const [emoji, users] of Object.entries(grouped)) {
              lines.push(`**${emoji}** (${users.length}): ${users.join(", ")}`);
            }
            textContent = lines.join("\n");
          }
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
    "figma_post_reaction",
    {
      title: "Post Comment Reaction",
      description: `Adds an emoji reaction to a comment.

Args:
  - file_key (string, required): The Figma file key
  - comment_id (string, required): The comment ID
  - emoji (string, required): Emoji shortcode (e.g., ':heart:', ':thumbsup:')

Returns:
  Confirmation of reaction added.

Examples:
  - Add heart: file_key="abc123", comment_id="456", emoji=":heart:"
  - Add thumbsup: file_key="abc123", comment_id="456", emoji=":thumbsup:"`,
      inputSchema: PostReactionInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params) => {
      try {
        await makeApiRequest<unknown>(
          `/files/${params.file_key}/comments/${params.comment_id}/reactions`,
          "POST",
          { emoji: params.emoji }
        );

        return {
          content: [{
            type: "text",
            text: `Reaction ${params.emoji} added to comment ${params.comment_id}.`
          }],
          structuredContent: { added: true, emoji: params.emoji, comment_id: params.comment_id }
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: handleApiError(error) }]
        };
      }
    }
  );
}
