/**
 * Figma API Response Types
 */

export interface FigmaUser {
  id: string;
  handle: string;
  img_url: string;
  email?: string;
}

export interface FigmaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  visible?: boolean;
  children?: FigmaNode[];
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  fills?: unknown[];
  strokes?: unknown[];
  strokeWeight?: number;
  cornerRadius?: number;
  characters?: string;
  style?: unknown;
}

export interface FigmaFile {
  name: string;
  role: string;
  lastModified: string;
  editorType: string;
  thumbnailUrl: string;
  version: string;
  document: FigmaNode;
  components: Record<string, FigmaComponent>;
  componentSets: Record<string, FigmaComponentSet>;
  schemaVersion: number;
  styles: Record<string, FigmaStyle>;
  mainFileKey?: string;
  branches?: FigmaBranch[];
}

export interface FigmaFileMetadata {
  [key: string]: unknown;
  key: string;
  name: string;
  thumbnail_url: string;
  last_modified: string;
  version: string;
  role: string;
  editor_type: string;
  link_access: string;
  creator: FigmaUser;
}

export interface FigmaBranch {
  key: string;
  name: string;
  thumbnail_url: string;
  last_modified: string;
  link_access: string;
}

export interface FigmaComment {
  [key: string]: unknown;
  id: string;
  uuid: string;
  file_key: string;
  parent_id: string;
  user: FigmaUser;
  created_at: string;
  resolved_at: string | null;
  message: string;
  client_meta?: {
    node_id?: string;
    node_offset?: { x: number; y: number };
  };
  order_id: string;
  reactions?: FigmaReaction[];
}

export interface FigmaReaction {
  emoji: string;
  created_at: string;
  user: FigmaUser;
}

export interface FigmaComponent {
  [key: string]: unknown;
  key: string;
  file_key: string;
  node_id: string;
  thumbnail_url: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  user: FigmaUser;
  containing_frame?: FigmaFrameInfo;
}

export interface FigmaComponentSet {
  key: string;
  file_key: string;
  node_id: string;
  thumbnail_url: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  user: FigmaUser;
  containing_frame?: FigmaFrameInfo;
}

export interface FigmaStyle {
  [key: string]: unknown;
  key: string;
  file_key: string;
  node_id: string;
  style_type: "FILL" | "TEXT" | "EFFECT" | "GRID";
  thumbnail_url: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  user: FigmaUser;
  sort_position: string;
}

export interface FigmaFrameInfo {
  node_id: string;
  name: string;
  background_color: string;
  page_id: string;
  page_name: string;
  containing_component_set?: {
    key: string;
    name: string;
  };
}

export interface FigmaImageResponse {
  err: string | null;
  images: Record<string, string | null>;
  status?: number;
}

export interface FigmaCommentsResponse {
  comments: FigmaComment[];
}

export interface FigmaPaginatedResponse<T> {
  meta: {
    cursor?: {
      before?: number;
      after?: number;
    };
  };
  [key: string]: T[] | unknown;
}

export enum ResponseFormat {
  MARKDOWN = "markdown",
  JSON = "json"
}

export enum ImageFormat {
  JPG = "jpg",
  PNG = "png",
  SVG = "svg",
  PDF = "pdf"
}
