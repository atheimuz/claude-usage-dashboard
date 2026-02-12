# Scripts — MD → JSON 변환 파이프라인

## 스크립트 목록

| 파일 | 실행 방법 | 역할 |
|------|-----------|------|
| `md-to-json.ts` | `npm run md-to-json` | index.json의 파일 목록을 읽고 각 MD를 JSON으로 변환, index.json 확장자 .json으로 업데이트 |
| `parser.ts` | (직접 실행하지 않음) | MD → DailyReport 파싱 핵심 로직 |
| `remove-emojis.mjs` | `node scripts/remove-emojis.mjs` | public/data/ 하위 모든 .md에서 이모지 제거 |

## parser.ts 구조

### 진입점

`parseDailyReport(markdown: string, filename: string): DailyReport`

### 섹션 분할

`splitSections(root)` — H1 (날짜 제목), blockquote (자동 생성 날짜), H2 이모지 기반 섹션 분할

### 이모지 → 섹션 매핑 (SECTION_MAP)

| 이모지 | 섹션 ID | parse 함수 |
|--------|---------|-----------|
| 📊 | overview | `parseOverview` |
| 🛠 | techStack | `parseTechStack` |
| 🤖 | claudeUsage | `parseClaudeUsage` |
| 💬 | promptPatterns | `parsePromptPatterns` |
| 🔧 | toolStats | `parseToolStats` |
| 📝 | taskTypes | `parseTaskTypes` |
| 🗂 | sessionDetails | `parseSessionDetails` |
| 💡 | learningInsights | `parseLearningInsights` |
| 📈 | workflowPatterns | `parseWorkflowPatterns` |
| 🎯 | usageEvaluation | `parseUsageEvaluation` |

이모지 매칭 실패 시 제목 키워드로 폴백 (`identifySection`).

### 헬퍼 함수

- `textContent(node)` — AST 노드에서 텍스트 추출
- `extractNumber(text)` — `"1,600회"` → `1600`
- `extractPercentage(text)` — `"45.5%"` → `45.5`
- `getH3Subsections(nodes)` / `getH4Subsections(nodes)` — 하위 헤딩 기준 분할
- `findTable(nodes)` / `findList(nodes)` / `getListItems(list)`

## 의존성

- `parser.ts` → `../src/types/index.ts` (타입 직접 import)
- devDependency: unified, remark-parse, remark-gfm (런타임 불필요)

## 새 MD 섹션 추가 워크플로우

1. `src/types/index.ts`에 타입 인터페이스 추가 + DailyReport에 필드 추가
2. `scripts/parser.ts`에 parse 함수 작성 + SECTION_MAP에 이모지 매핑 + parseDailyReport switch-case 추가
3. `npm run md-to-json` 재실행으로 JSON 재생성
4. `src/components/daily/`에 표시 컴포넌트 작성
5. `src/pages/DailyDetailPage.tsx`에 컴포넌트 배치
