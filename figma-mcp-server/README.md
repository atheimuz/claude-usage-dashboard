# Figma MCP Server

Claude Code에서 Figma REST API를 사용할 수 있게 해주는 MCP 서버입니다.

## 기능

### 파일 도구
- `figma_get_file` - Figma 파일의 전체 구조 조회
- `figma_get_file_nodes` - 특정 노드만 조회
- `figma_get_file_metadata` - 파일 메타데이터 조회
- `figma_export_images` - 노드를 이미지로 내보내기 (PNG, JPG, SVG, PDF)

### 댓글 도구
- `figma_get_comments` - 파일의 댓글 목록 조회
- `figma_post_comment` - 댓글 작성
- `figma_delete_comment` - 댓글 삭제
- `figma_get_comment_reactions` - 댓글 리액션 조회
- `figma_post_reaction` - 댓글에 리액션 추가

### 컴포넌트/스타일 도구
- `figma_get_team_components` - 팀 라이브러리 컴포넌트 목록
- `figma_get_team_component_sets` - 팀 컴포넌트 세트 목록
- `figma_get_team_styles` - 팀 스타일 목록
- `figma_get_file_components` - 파일의 컴포넌트 목록
- `figma_get_component` - 특정 컴포넌트 상세 조회
- `figma_get_style` - 특정 스타일 상세 조회

## 설치

```bash
cd figma-mcp-server
npm install
npm run build
```

## Figma Access Token 발급

1. [Figma Settings](https://www.figma.com/settings) → Account → Personal access tokens
2. "Create a new personal access token" 클릭
3. 필요한 스코프 선택:
   - `file_content:read` - 파일 읽기
   - `file_comments:read` - 댓글 읽기
   - `file_comments:write` - 댓글 작성
   - `team_library_content:read` - 팀 라이브러리 조회

## Claude Code 설정

`~/.claude/settings.json`에 MCP 서버 설정을 추가하세요:

```json
{
  "mcpServers": {
    "figma": {
      "command": "node",
      "args": ["/path/to/figma-mcp-server/dist/index.js"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "your_figma_access_token"
      }
    }
  }
}
```

또는 프로젝트별 설정 `.claude/settings.local.json`:

```json
{
  "mcpServers": {
    "figma": {
      "command": "node",
      "args": ["./figma-mcp-server/dist/index.js"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "your_figma_access_token"
      }
    }
  }
}
```

## 사용 예시

Claude Code에서:

```
Figma 파일 abc123XYZ의 구조를 보여줘
```

```
figma_get_file abc123XYZ 노드 1:2의 이미지를 PNG로 내보내줘
```

```
팀 123456789의 디자인 시스템 컴포넌트 목록을 알려줘
```

## Figma 파일 키 찾기

Figma 파일 URL에서 키를 확인할 수 있습니다:
```
https://www.figma.com/file/{file_key}/{file_name}
https://www.figma.com/design/{file_key}/{file_name}
```

## 개발

```bash
# 개발 모드 (자동 재시작)
npm run dev

# 빌드
npm run build

# 실행
npm start
```

## 라이선스

MIT
