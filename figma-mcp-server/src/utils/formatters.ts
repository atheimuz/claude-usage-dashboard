/**
 * Response formatting utilities
 */

import type { FigmaNode, FigmaComment, FigmaComponent, FigmaStyle } from "../types.js";

const CHARACTER_LIMIT = 25000;

export function truncateIfNeeded<T>(
  data: T[],
  stringify: (items: T[]) => string
): { result: string; truncated: boolean; originalCount: number } {
  let result = stringify(data);
  let truncated = false;
  const originalCount = data.length;

  if (result.length > CHARACTER_LIMIT) {
    let items = data;
    while (result.length > CHARACTER_LIMIT && items.length > 1) {
      items = items.slice(0, Math.ceil(items.length / 2));
      result = stringify(items);
    }
    truncated = items.length < originalCount;
  }

  return { result, truncated, originalCount };
}

export function formatNodeTree(node: FigmaNode, depth: number = 0, maxDepth: number = 3): string {
  const indent = "  ".repeat(depth);
  const lines: string[] = [];

  const visibility = node.visible === false ? " (hidden)" : "";
  lines.push(`${indent}- **${node.name}** [${node.type}]${visibility}`);

  if (node.absoluteBoundingBox) {
    const bb = node.absoluteBoundingBox;
    lines.push(`${indent}  Size: ${bb.width.toFixed(0)}x${bb.height.toFixed(0)}`);
  }

  if (node.characters) {
    const text = node.characters.length > 50
      ? node.characters.substring(0, 50) + "..."
      : node.characters;
    lines.push(`${indent}  Text: "${text}"`);
  }

  if (node.children && depth < maxDepth) {
    for (const child of node.children.slice(0, 10)) {
      lines.push(formatNodeTree(child, depth + 1, maxDepth));
    }
    if (node.children.length > 10) {
      lines.push(`${indent}  ... and ${node.children.length - 10} more children`);
    }
  } else if (node.children && depth >= maxDepth) {
    lines.push(`${indent}  (${node.children.length} children, max depth reached)`);
  }

  return lines.join("\n");
}

export function formatCommentsMarkdown(comments: FigmaComment[]): string {
  if (comments.length === 0) {
    return "No comments found.";
  }

  const lines: string[] = [`# Comments (${comments.length})`, ""];

  for (const comment of comments) {
    const date = new Date(comment.created_at).toLocaleString();
    const resolved = comment.resolved_at ? " [RESOLVED]" : "";
    const nodeRef = comment.client_meta?.node_id
      ? ` (on node: ${comment.client_meta.node_id})`
      : "";

    lines.push(`## ${comment.user.handle}${resolved}`);
    lines.push(`*${date}*${nodeRef}`);
    lines.push("");
    lines.push(comment.message);
    lines.push("");

    if (comment.reactions && comment.reactions.length > 0) {
      const reactionSummary = comment.reactions
        .reduce((acc, r) => {
          acc[r.emoji] = (acc[r.emoji] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
      lines.push(
        `Reactions: ${Object.entries(reactionSummary)
          .map(([emoji, count]) => `${emoji} ${count}`)
          .join(" ")}`
      );
      lines.push("");
    }

    lines.push("---");
    lines.push("");
  }

  return lines.join("\n");
}

export function formatComponentsMarkdown(components: FigmaComponent[]): string {
  if (components.length === 0) {
    return "No components found.";
  }

  const lines: string[] = [`# Components (${components.length})`, ""];

  for (const comp of components) {
    lines.push(`## ${comp.name}`);
    lines.push(`- **Key**: ${comp.key}`);
    lines.push(`- **Node ID**: ${comp.node_id}`);
    if (comp.description) {
      lines.push(`- **Description**: ${comp.description}`);
    }
    lines.push(`- **Created**: ${new Date(comp.created_at).toLocaleDateString()}`);
    lines.push(`- **Updated**: ${new Date(comp.updated_at).toLocaleDateString()}`);
    if (comp.containing_frame) {
      lines.push(`- **Frame**: ${comp.containing_frame.name} (page: ${comp.containing_frame.page_name})`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

export function formatStylesMarkdown(styles: FigmaStyle[]): string {
  if (styles.length === 0) {
    return "No styles found.";
  }

  const lines: string[] = [`# Styles (${styles.length})`, ""];

  const groupedByType = styles.reduce((acc, style) => {
    const type = style.style_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(style);
    return acc;
  }, {} as Record<string, FigmaStyle[]>);

  for (const [type, typeStyles] of Object.entries(groupedByType)) {
    lines.push(`## ${type} Styles (${typeStyles.length})`);
    lines.push("");

    for (const style of typeStyles) {
      lines.push(`### ${style.name}`);
      lines.push(`- **Key**: ${style.key}`);
      if (style.description) {
        lines.push(`- **Description**: ${style.description}`);
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

export function formatFileMetadataMarkdown(metadata: {
  name: string;
  lastModified: string;
  version: string;
  thumbnailUrl?: string;
  editorType?: string;
}): string {
  const lines: string[] = [
    `# ${metadata.name}`,
    "",
    `- **Version**: ${metadata.version}`,
    `- **Last Modified**: ${new Date(metadata.lastModified).toLocaleString()}`,
  ];

  if (metadata.editorType) {
    lines.push(`- **Editor Type**: ${metadata.editorType}`);
  }

  if (metadata.thumbnailUrl) {
    lines.push(`- **Thumbnail**: ${metadata.thumbnailUrl}`);
  }

  return lines.join("\n");
}
