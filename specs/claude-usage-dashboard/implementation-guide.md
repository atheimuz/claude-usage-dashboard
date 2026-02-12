# Implementation Guide: Claude Usage Dashboard

## 개요

클로드 코드 사용 일지를 마크다운 파일에서 파싱하여 웹 대시보드로 시각화하는 프로젝트입니다.

**핵심 기술 스택:**
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn UI
- react-router-dom v6 (페이지 라우팅)
- @tanstack/react-query v5 (데이터 캐싱, staleTime: Infinity 전략)
- recharts (차트)
- unified + remark-parse (마크다운 파싱)
- lucide-react (아이콘, 이모지 사용 금지)

---

## 파일 구조 및 코딩 규칙

### 프로젝트 디렉토리 구조

```
src/
├── components/
│   ├── ui/                    # shadcn UI 컴포넌트들 (Card, Button, Badge 등)
│   ├── layout/
│   │   ├── Header.tsx         # 헤더 (로고, 다크모드 토글, 네비게이션 링크)
│   │   └── Layout.tsx         # 공통 레이아웃 래퍼
│   ├── dashboard/             # 홈 대시보드 컴포넌트들
│   │   ├── StatsCards.tsx     # 4개 통계 카드 그리드
│   │   ├── ToolUsageChart.tsx # 도구 사용 비율 (수평 Bar)
│   │   ├── TaskTypeChart.tsx  # 작업 유형 분포 (Pie/Donut)
│   │   ├── TrendChart.tsx     # 일별 활동 추이 (Area/Line)
│   │   ├── TechStackCloud.tsx # 기술 스택 태그 클라우드
│   │   └── RecentActivity.tsx # 최근 활동 카드 목록
│   ├── daily/                 # 상세 일지 페이지 컴포넌트들
│   │   ├── DailyHeader.tsx    # 이전/다음 네비, 날짜 타이틀, 식별자 뱃지
│   │   ├── OverviewStats.tsx  # 통계 카드 + 프로젝트별 세션 테이블
│   │   ├── TechStackSection.tsx # 기술 스택 (Languages/Frameworks/Tools)
│   │   ├── ClaudeUsageSection.tsx # 활용 방식 (모드, 기능, 위임 스타일)
│   │   ├── PromptPatterns.tsx # 프롬프트 패턴 섹션
│   │   ├── ToolStatsTable.tsx # 도구 활용 통계 테이블
│   │   ├── TaskTypeGrid.tsx   # 작업 유형 2열 그리드 (아이콘 + 건수)
│   │   ├── SessionAccordion.tsx # 세션 상세 아코디언
│   │   ├── LearningInsights.tsx # 학습 인사이트 불릿 리스트
│   │   └── WorkflowPatterns.tsx # 워크플로우 패턴 번호 리스트
│   └── daily-list/            # 일지 목록 페이지 컴포넌트들
│       ├── CalendarView.tsx   # 월별 달력 뷰
│       └── ListView.tsx       # 날짜별 카드 리스트 뷰
├── hooks/
│   ├── useReports.ts          # react-query 훅들 (useFileList, useDailyReport, useAllReports)
│   └── useTheme.ts            # 다크 모드 상태 관리
├── lib/
│   ├── parser.ts              # 마크다운 파싱 로직 (parseDailyReport 함수)
│   ├── aggregator.ts          # 데이터 집계 로직 (여러 일지 통계 합산)
│   └── utils.ts               # 유틸 함수들 (날짜 포맷팅, 파일명 파싱 등)
├── types/
│   └── index.ts               # TypeScript 타입 정의 (DailyReport, OverviewStats 등)
├── pages/
│   ├── HomePage.tsx           # / 홈 대시보드 페이지
│   ├── DailyDetailPage.tsx    # /daily/:filename 상세 일지 페이지
│   └── DailyListPage.tsx      # /daily 일지 목록 페이지
├── App.tsx                    # 라우팅 설정
└── main.tsx
```

---

## 마크다운 파싱 전략

### 핵심 개념: 이모지 접두사로 섹션 식별

마크다운 파일의 `## ` (h2) 헤딩을 이모지로 구분하고, 파싱 후 UI에서는 lucide-react 아이콘으로 표시합니다.

**섹션 매핑:**

| 이모지 | 섹션명 | 매핑 필드 | lucide-react 아이콘 |
|:---:|:---:|:---:|:---:|
| 📊 | 전체 통계 | `overview`, `projectSessions` | `BarChart3` |
| 🛠 | 주요 기술 스택 | `techStack` | `Layers` |
| 🤖 | 클로드 코드 활용 방식 | `claudeUsage` | `Bot` |
| 💬 | 프롬프트 패턴 | `promptPatterns` | `MessageSquare` |
| 🔧 | 도구 활용 통계 | `toolStats` | `Wrench` |
| 📝 | 작업 유형 | `taskTypes` | `ClipboardList` |
| 🗂 | 세션 상세 | `sessionDetails` | `FolderOpen` |
| 💡 | 학습 인사이트 | `learningInsights` | `Lightbulb` |
| 📈 | 워크플로우 패턴 | `workflowPatterns` | `TrendingUp` |

### 파싱 라이브러리 구성

**lib/parser.ts에서 사용할 라이브러리:**

```typescript
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
```

**파싱 프로세스:**

1. **AST 생성**: `unified().use(remarkParse).parse(markdown)` → AST 생성
2. **h1 찾기**: 날짜 추출 (YYYY-MM-DD 패턴)
3. **blockquote 찾기**: 자동 생성일 추출 (자동 생성: YYYY-MM-DD 패턴)
4. **h2 헤딩 순회**: 섹션별로 분할, 이모지 접두사로 섹션 타입 식별
5. **섹션별 파서**: 각 섹션 타입에 맞춰 전용 파서 함수 호출
6. **숫자 추출**: 정규식 `\*\*(\d+)\*\*` 또는 `\*\*약(\d+)\*\*`로 볼드 텍스트 내 숫자 추출
7. **테이블 파싱**: 마크다운 테이블 행을 배열로 변환 (헤더, 구분선 제외)

### 파싱 실패 처리

- **섹션 누락**: 빈 배열 `[]` 또는 기본값 반환 (필드별로 다름)
- **숫자 파싱 실패**: `0` 설정, 콘솔에 `console.warn()` 출력
- **전체 파일 파싱 실패**: throw Error (컴포넌트에서 catch → 에러 UI 표시)

---

## 데이터 Fetching & 캐싱 전략

### 파일 시스템 구조

**public/data/ 디렉토리:**
```
public/data/
├── index.json          # 파일 목록 관리 (정적, 새 파일 추가 시 수동 갱신)
├── 2026-02-08-1.md
├── 2026-02-08-work.md
├── 2026-02-09-1.md
└── ...
```

**index.json 형식:**
```json
{
  "files": [
    "2026-02-08-work.md",
    "2026-02-08-side.md",
    "2026-02-09-1.md",
    "2026-02-10-work.md"
  ]
}
```

### react-query 설정

**hooks/useReports.ts 작성 규칙:**

1. **useFileList 훅**
   - 용도: `index.json` 파일 목록 로드
   - 캐싱: `staleTime: Infinity, gcTime: Infinity`
   - fetch: `GET /data/index.json` → JSON.parse

2. **useDailyReport 훅**
   - 용도: 단일 일지 파일 로드 및 파싱
   - 파라미터: `filename` (확장자 제외, 예: `2026-02-08-work`)
   - 캐싱: `staleTime: Infinity, gcTime: Infinity, enabled: !!filename`
   - fetch: `GET /data/{filename}.md` → 텍스트 → `parseDailyReport()` 함수로 파싱
   - 에러: 404는 에러로 취급 (파일 없음)

3. **useAllReports 훅**
   - 용도: 홈 대시보드용 모든 일지 병렬 로드
   - 내부: `useFileList` → `useQueries()` 사용 (여러 쿼리 병렬 실행)
   - 반환: `{ data: DailyReport[], isLoading, isError }`
   - 파싱: 각 파일마다 `parseDailyReport()`로 파싱

### Fetch 에러 처리

| 상황 | HTTP 상태 | 처리 |
|:---:|:---:|:---:|
| index.json 로드 실패 | 네트워크/500 | throw Error → 컴포넌트 에러 Alert |
| 마크다운 파일 없음 | 404 | throw Error → 404 상태 UI 표시 |
| 마크다운 파일 네트워크 실패 | 500 | throw Error → 에러 Alert |
| 파싱 실패 (AST 변환 오류) | N/A | throw Error (라이브러리 에러 전파) |

---

## TypeScript 타입 정의 (types/index.ts)

### DailyReport (일지 전체 데이터)

```typescript
interface DailyReport {
  date: string;                    // "2026-02-08" (파일명에서 추출)
  identifier: string;              // "work", "side", "1" 등
  filename: string;                // "2026-02-08-work" (확장자 제외)
  generatedDate: string;           // "2026-02-11" (blockquote에서 추출)
  overview: OverviewStats;
  projectSessions: ProjectSession[];
  techStack: TechStack;
  claudeUsage: ClaudeUsage;
  promptPatterns: PromptPatterns;
  toolStats: ToolStat[];
  taskTypes: TaskType[];
  sessionDetails: SessionDetail[];
  learningInsights: string[];
  workflowPatterns: WorkflowPattern[];
}
```

### OverviewStats (전체 통계)

```typescript
interface OverviewStats {
  totalSessions: number;           // 102 (볼드 텍스트에서 파싱)
  totalToolCalls: number;          // 1600
  workingHoursUTC: string;         // "04:53 ~ 15:22"
  workingHoursKST: string;         // "13:53 ~ 00:22"
  projectCount: number;            // 4
}
```

### ProjectSession (프로젝트별 세션)

```typescript
interface ProjectSession {
  projectName: string;             // "트렌드 블로그 프로젝트"
  sessionCount: number;            // 97
}
```

### TechStack (기술 스택)

```typescript
interface TechStack {
  languages: string[];             // ["TypeScript", "Python", "Markdown"]
  frameworks: string[];            // ["Astro", "Tailwind CSS", "React"]
  tools: string[];                 // ["Git", "npm", "Google AdSense"]
}
```

### ClaudeUsage (클로드 코드 활용)

```typescript
interface ClaudeUsage {
  modes: UsageMode[];
  features: UsageFeature[];
  delegationStyle: string[];
}

interface UsageMode {
  name: string;                    // "Plan Mode"
  description: string;             // "전체 세션의 36.1%에서 사용"
  percentage?: number;             // 36.1 (파싱 가능한 경우)
}

interface UsageFeature {
  name: string;                    // "서브에이전트 위임"
  description: string;
  percentage?: number;
  count?: number;
}
```

### PromptPatterns (프롬프트 패턴)

```typescript
interface PromptPatterns {
  effective: string[];             // ["패턴 1", "패턴 2"]
  conversationFlow: ConversationFlow[];
}

interface ConversationFlow {
  type: string;                    // "단발 요청", "연속 대화", "반복 세션"
  description: string;
}
```

### ToolStat (도구 통계)

```typescript
interface ToolStat {
  toolName: string;                // "Read"
  usageCount: number;              // 394
  primaryUse: string;              // "코드 탐색 및 기존 구조 분석"
}
```

### TaskType (작업 유형)

```typescript
interface TaskType {
  type: string;                    // "Coding"
  count: number;                   // 78
  description: string;             // "컴포넌트 개발, 페이지 생성, ..."
}
```

**작업 유형 → lucide-react 아이콘 매핑:**
- `Coding` → `Code`
- `Refactoring` → `RefreshCw`
- `Planning` → `Map`
- `Content Creation` → `FileText`
- `Debugging` → `Bug`
- `Configuration` → `Settings`

### SessionDetail (세션 상세)

```typescript
interface SessionDetail {
  groupName: string;               // "자동화 블로그 인프라 구축"
  startTimeUTC: string;            // "04:53"
  taskTypes: string[];             // ["Coding", "Planning"]
  approach: string;                // "대화형 요구사항 분석 → ..."
  mainTasks: string;               // "트렌드 수집 파이프라인, ..."
  changeScale: string;             // "45개 파일 생성, 9건 수정"
}
```

### WorkflowPattern (워크플로우 패턴)

```typescript
interface WorkflowPattern {
  name: string;                    // "탐색 → 수정 → 검증"
  flow: string;                    // "Read → Edit → Bash" (화살표 구분)
}
```

### AggregatedStats (홈 대시보드용 집계)

```typescript
interface AggregatedStats {
  totalDays: number;               // 일지가 있는 고유 날짜 수
  totalSessions: number;           // 모든 일지의 세션 합산
  totalToolCalls: number;          // 모든 일지의 도구 호출 합산
  totalProjects: number;           // 모든 일지의 고유 프로젝트 수
  toolUsageAggregated: ToolStat[]; // 도구별 합산 사용 횟수
  taskTypeAggregated: TaskType[];  // 작업 유형별 합산 건수
  techStackFrequency: Map<string, number>; // 기술 스택 빈도 (키: 기술명, 값: 나타난 일지 수)
  dailyTrend: DailyTrendPoint[];   // 날짜별 추이
}

interface DailyTrendPoint {
  date: string;                    // "2026-02-08"
  reportCount: number;             // 해당 날짜의 일지 수
  sessions: number;                // 해당 날짜의 세션 합산
  toolCalls: number;               // 해당 날짜의 도구 호출 합산
}
```

---

## 라우팅 및 페이지 구조

### React Router v6 설정 (App.tsx)

```typescript
<Routes>
  <Route element={<Layout />}>
    <Route path="/" element={<HomePage />} />
    <Route path="/daily" element={<DailyListPage />} />
    <Route path="/daily/:filename" element={<DailyDetailPage />} />
  </Route>
</Routes>
```

### 파라미터 규칙

- `:filename` → 확장자를 제외한 파일명 (예: `2026-02-08-work`)
- 유효성 검사: `useFileList` 훅에서 가져온 파일 목록과 비교
- 존재하지 않는 filename: 404 상태 UI 표시

### 네비게이션 링크

**Header.tsx 구성:**
- 좌측: 로고/서비스명 "Claude Usage Dashboard" (클릭 시 `/` 이동)
- 중앙: 네비게이션 링크
  - `Dashboard` (`/`)
  - `Daily Logs` (`/daily`)
- 우측: 다크 모드 토글 버튼 (sun/moon 아이콘)

**현재 페이지 표시:**
- 활성 링크에 underline 또는 색상 강조 (Tailwind class: `underline`, `text-primary` 등)

---

## 다크 모드 구현

### hooks/useTheme.ts 작성 규칙

```typescript
// 반환 타입
interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  toggleTheme: (theme: 'light' | 'dark' | 'system') => void;
  isDark: boolean; // 실제 다크 모드 여부 (system의 경우 자동 감지)
}
```

**구현 포인트:**
1. Context API 또는 zustand 등으로 상태 관리
2. localStorage에 `theme` 키로 `'light' | 'dark' | 'system'` 저장
3. 초기값: localStorage 읽기 → 없으면 `'system'` (시스템 설정 따름)
4. 시스템 설정 감지: `window.matchMedia('(prefers-color-scheme: dark)').matches`
5. HTML 태그에 `class="dark"` 추가/제거 (Tailwind dark mode: class)
6. 토글 버튼: 현재 다크 모드 여부에 따라 아이콘 표시
   - 다크 모드 ON → sun 아이콘 (클릭하면 라이트 전환)
   - 다크 모드 OFF → moon 아이콘 (클릭하면 다크 전환)

### 스타일 규칙

**Tailwind 다크 모드 설정:**
```javascript
// tailwind.config.ts
export default {
  darkMode: 'class', // class 모드 사용
  // ...
}
```

**색상 매핑:**
- 라이트 모드 배경: white, text: black/zinc-900
- 다크 모드 배경: zinc-950, text: white/zinc-100
- 헤더: 라이트 white, 다크 zinc-950
- 경계선: 라이트 zinc-200, 다크 zinc-800

---

## 반응형 디자인 규칙

### Tailwind 브레이크포인트

| 디바이스 | 너비 | 그리드 열수 | 클래스 |
|:---:|:---:|:---:|:---:|
| 모바일 | < 768px | 1 | (기본) |
| 태블릿 | 768px ~ 1023px | 2 | `md:` |
| 데스크탑 | >= 1024px | 3~4 | `lg:` |

### 컨테이너 설정

**메인 콘텐츠 영역:**
- 최대 너비: 1280px (`max-w-7xl`)
- 좌우 패딩:
  - 모바일: `px-4` (16px)
  - 태블릿 이상: `md:px-6` (24px)
  - 데스크탑 이상: `lg:px-8` (32px)
- 상하 패딩: `py-6` (24px)

### 그리드 예시

**통계 카드 (4개):**
```typescript
// 모바일 1열, 태블릿 2열, 데스크탑 4열
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
```

**대시보드 차트 (2개):**
```typescript
// 모바일 1열, 데스크탑 2열
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
```

**작업 유형 그리드 (2열):**
```typescript
// 모바일 1열, 데스크탑 2열
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
```

---

## 유틸리티 함수 (lib/utils.ts)

### 필수 함수 목록

**파일명 파싱:**
```typescript
function parseFilename(filename: string): { date: string; identifier: string; filename: string }
// 예: "2026-02-08-work" → { date: "2026-02-08", identifier: "work", filename: "2026-02-08-work" }
```

**날짜 포맷팅:**
```typescript
function formatDate(dateStr: string, locale: 'KO' | 'EN' = 'KO'): string
// 예: "2026-02-08" → "2026년 2월 8일 (토)" (한글) 또는 "Feb 8, 2026 (Sat)" (영문)

function formatDateShort(dateStr: string): string
// 예: "2026-02-08" → "02-08" (트렌드 차트 X축용)

function getDayOfWeek(dateStr: string): string
// 예: "2026-02-08" → "토"
```

**숫자 포맷팅:**
```typescript
function formatNumber(num: number): string
// 예: 1234 → "1,234"

function formatPercent(value: number, total: number): string
// 예: 30, 100 → "30%"
```

**배열 연산:**
```typescript
function groupByDate(reports: DailyReport[]): Map<string, DailyReport[]>
// 날짜별로 일지 그룹화

function aggregateDailyReports(reports: DailyReport[]): AggregatedStats
// 여러 일지의 통계 합산 (홈 대시보드용)

function getTechStackFrequency(reports: DailyReport[]): Map<string, number>
// 기술 스택 빈도 계산 (나타난 일지 수)

function sortFilesByDate(files: string[]): string[]
// 파일명을 날짜 기준으로 정렬 (최신순)

function getNextPrevFilename(currentFilename: string, files: string[]): { prev?: string; next?: string }
// 이전/다음 파일명 반환
```

**데이터 필터링:**
```typescript
function getRecentReports(reports: DailyReport[], days: number = 7): DailyReport[]
// 최근 N일 일지 반환
```

---

## 컴포넌트 작성 규칙

### shadcn UI 컴포넌트 사용

**필수 컴포넌트:**
- `Button` (네비게이션, 다시 시도 등)
- `Card`, `CardContent`, `CardDescription`, `CardHeader`, `CardTitle`
- `Badge` (식별자, 작업 유형 태그 등)
- `Table` (도구 활용 통계)
- `Accordion` (세션 상세)
- `Alert`, `AlertDescription`, `AlertTitle` (에러/빈 상태)
- `Skeleton` (로딩 상태)
- `ToggleGroup` (달력/리스트 뷰 전환)

### 공통 패턴

**로딩 상태:**
```tsx
if (isLoading) return <Skeleton className="h-24" />;
if (isError) return <Alert variant="destructive">에러 메시지</Alert>;
```

**에러 Alert:**
```tsx
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>오류</AlertTitle>
  <AlertDescription>메시지 텍스트</AlertDescription>
  <Button onClick={refetch}>다시 시도</Button>
</Alert>
```

**빈 상태:**
```tsx
<div className="text-center py-12">
  <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
  <p className="text-lg font-semibold">메시지</p>
  <p className="text-sm text-muted-foreground">설명</p>
</div>
```

### 아이콘 사용

**금지 규칙:**
- 마크다운 원본의 이모지(📊, 🛠, 🤖 등)는 섹션 파싱 후 UI에 표시하지 않음
- UI에서는 모두 lucide-react 아이콘으로 통일

**예시:**
```tsx
import { BarChart3, Layers, Bot, MessageSquare, Wrench, ClipboardList, FolderOpen, Lightbulb, TrendingUp } from 'lucide-react';

// 사용
<BarChart3 className="h-6 w-6" />
```

---

## 데이터 집계 로직 (lib/aggregator.ts)

### aggregateDailyReports() 함수

**입력:** `DailyReport[]` (모든 일지)
**출력:** `AggregatedStats` (집계된 통계)

**집계 규칙:**

| 필드 | 계산 방식 |
|:---:|:---:|
| `totalDays` | 고유 `date` 값의 개수 |
| `totalSessions` | 모든 일지의 `overview.totalSessions` 합산 |
| `totalToolCalls` | 모든 일지의 `overview.totalToolCalls` 합산 |
| `totalProjects` | 고유 `projectSessions[].projectName` 개수 |
| `toolUsageAggregated` | 도구명별로 `usageCount` 합산 및 정렬 (내림차순) |
| `taskTypeAggregated` | 작업 유형별로 `count` 합산 및 정렬 (내림차순) |
| `techStackFrequency` | 각 기술이 나타난 일지 수 (중복 제거) |
| `dailyTrend` | 날짜별로 `reportCount`, `sessions`, `toolCalls` 계산 및 날짜순 정렬 |

**주의:**
- `techStackFrequency`는 "기술이 나타난 일지 수"이지 "일지 내 빈도"가 아님
  - 예: "TypeScript"가 3개 일지에 나타나면 `frequency = 3`
  - 특정 일지 내에서 여러 번 반복되어도 1로 계산

---

## 차트 구현 (recharts)

### 1. 도구 사용 비율 (수평 Bar)

```typescript
// 데이터: 상위 10개 도구
// X축: 사용 횟수
// Y축: 도구 이름
// 색상: amber-600 또는 클로드 브랜드 컬러

<BarChart layout="vertical" data={toolUsageAggregated.slice(0, 10)}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis type="number" />
  <YAxis dataKey="toolName" type="category" width={100} />
  <Bar dataKey="usageCount" fill="#D97706" />
</BarChart>
```

### 2. 작업 유형 분포 (Pie/Donut)

```typescript
// 데이터: taskTypeAggregated
// 범례: 하단에 가로 배치
// 라벨: 타입명 + 비율(%)

<PieChart>
  <Pie
    data={taskTypeAggregated}
    nameKey="type"
    dataKey="count"
    label={({ name, value }) => `${name} (${percent}%)`}
  />
  <Legend verticalAlign="bottom" height={36} />
</PieChart>
```

### 3. 일별 활동 추이 (Area/Line)

```typescript
// 데이터: dailyTrend (정렬됨)
// X축: 날짜 (MM-DD 형식)
// Y축 좌: 세션 수 (파란색)
// Y축 우: 도구 호출 수 (주황색)
// 인터랙션: 호버 시 툴팁, 클릭 시 해당 날짜 페이지로 이동 (handleClick)

<AreaChart data={dailyTrend}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="date" />
  <YAxis yAxisId="left" />
  <YAxis yAxisId="right" orientation="right" />
  <Tooltip />
  <Area yAxisId="left" dataKey="sessions" fill="#3b82f6" />
  <Area yAxisId="right" dataKey="toolCalls" fill="#f97316" />
</AreaChart>
```

**클릭 이벤트 처리:**
```typescript
const handleChartClick = (data: DailyTrendPoint) => {
  // 해당 날짜의 일지로 이동
  // 1. 해당 날짜의 파일 찾기 (fileList에서)
  // 2. useNavigate를 사용하여 /daily/:filename으로 이동
  // 3. 같은 날짜에 여러 일지가 있으면 첫 번째 일지로 이동 (또는 모달 표시)
}
```

---

## 홈 대시보드 페이지 (HomePage.tsx)

### 데이터 흐름

```
useAllReports()
  ↓
aggregateDailyReports(reports)
  ↓
AggregatedStats 반환
  ↓
컴포넌트들에 데이터 전달
```

### 구성 순서

1. **StatsCards**: 4개 카드 (활동 일수, 총 세션 수, 총 도구 호출, 프로젝트 수)
2. **ToolUsageChart + TaskTypeChart**: 2열 그리드
3. **TrendChart**: 전체 너비
4. **TechStackCloud**: 전체 너비
5. **RecentActivity**: 전체 너비

### 상태별 UI

| 상태 | 표시 |
|:---:|:---:|
| 로딩 중 | Skeleton 박스들 (높이 120px, 300px, 250px 등) |
| 에러 | Alert (AlertCircle, 메시지, "다시 시도" 버튼) |
| 빈 데이터 (파일 0개) | 중앙 정렬 (FileText 아이콘 64px + 메시지) |
| 데이터 표시 | 모든 섹션 렌더링 |

---

## 상세 일지 페이지 (DailyDetailPage.tsx)

### 데이터 흐름

```
URL 파라미터 (:filename) 추출
  ↓
useDailyReport(filename) 호출
  ↓
DailyReport 반환
  ↓
컴포넌트들에 데이터 전달
```

### 구성 순서

1. **DailyHeader**: 이전/다음 네비, 날짜, 식별자 뱃지, 자동 생성일, "목록" 링크
2. **OverviewStats**: 4개 통계 카드 + 프로젝트별 세션 테이블
3. **TechStackSection**: 3개 서브섹션 (Languages, Frameworks, Tools)
4. **ClaudeUsageSection**: 3개 서브섹션 (모드, 기능, 위임 스타일)
5. **PromptPatterns**: 2개 서브섹션 (효과적 프롬프트, 대화 흐름)
6. **ToolStatsTable**: 테이블 (도구명, 사용 횟수 + 바, 주요 용도)
7. **TaskTypeGrid**: 2열 그리드 (아이콘 + 타입명 + 건수 + 설명)
8. **SessionAccordion**: 아코디언 (첫 항목 펼침, 나머지 닫힘)
9. **LearningInsights**: 불릿 리스트 (Lightbulb 아이콘)
10. **WorkflowPatterns**: 번호 리스트 (패턴명 + 흐름)

### 상태별 UI

| 상태 | 표시 |
|:---:|:---:|
| 로딩 중 | Skeleton 박스들 |
| 404 (파일 없음) | 중앙 정렬 (FileText 아이콘 + "일지가 없습니다" 메시지 + "목록" 버튼) |
| 파싱 에러 | Alert ("일지를 불러올 수 없습니다" + "목록" 버튼) |
| 데이터 표시 | 모든 섹션 렌더링 (누락 섹션은 UI 숨김) |

### 이전/다음 네비게이션

**구현:**
```typescript
const handlePrevious = () => {
  const index = fileList.indexOf(`${currentFilename}.md`);
  if (index > 0) {
    navigate(`/daily/${fileList[index - 1].replace('.md', '')}`);
  }
};

const handleNext = () => {
  const index = fileList.indexOf(`${currentFilename}.md`);
  if (index < fileList.length - 1) {
    navigate(`/daily/${fileList[index + 1].replace('.md', '')}`);
  }
};
```

**버튼 상태:**
- 첫 일지: "이전" 버튼 disabled
- 마지막 일지: "다음" 버튼 disabled

---

## 일지 목록 페이지 (DailyListPage.tsx)

### 뷰 전환

**ToggleGroup 또는 2개 버튼으로 구현:**
```typescript
const [view, setView] = useState<'calendar' | 'list'>('calendar');
```

### CalendarView 컴포넌트

**기능:**
- 월별 달력 그리드 (일 ~ 토)
- 월 네비게이션 (`< 2026년 2월 >`, 좌우 화살표)
- 데이터 있는 날짜 셀: 연한 하이라이트 + 일지 수 표시
- 호버 시 툴팁: "일지: N개 | 세션: N개 | 도구 호출: N회"
- 클릭:
  - 일지 1개: `/daily/:filename` 이동
  - 일지 여러 개: 팝오버에 목록 표시 → 개별 선택
- 오늘 날짜: primary color border 강조

**구현 팁:**
```typescript
// 달력 생성
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay(); // 0~6 (일~토)
};

// 데이터 매핑
const reportsByDate: Map<string, DailyReport[]> = new Map();
allReports.forEach(report => {
  const key = report.date;
  if (!reportsByDate.has(key)) reportsByDate.set(key, []);
  reportsByDate.get(key)!.push(report);
});
```

### ListView 컴포넌트

**정렬:** 최신 날짜순 (내림차순), 같은 날짜 내에서는 파일명순

**그룹화:** 날짜 헤딩 → 해당 날짜의 카드들 아래 배치

**각 카드:**
- 좌측: 날짜 (큰 글씨, text-xl) + 요일
- 중앙:
  - 식별자 Badge
  - 수치: `{N}개` 세션 | `{N}회` 도구 호출 | `{N}개` 프로젝트
  - 주요 작업 유형 (상위 3개, Badge)
- 우측: 화살표 아이콘 (클릭 유도)

**클릭:** `/daily/:filename`으로 이동

### 상태별 UI

| 상태 | 표시 |
|:---:|:---:|
| 로딩 중 | 달력/리스트 Skeleton |
| 빈 상태 | 중앙 정렬 (FileText 아이콘 + "기록된 일지가 없습니다") |
| 데이터 표시 | 달력/리스트 렌더링 |

---

## 파일 목록 업데이트 프로세스

### 수동 업데이트 (현재)

1. 새 마크다운 파일 추가: `public/data/YYYY-MM-DD-{identifier}.md`
2. `public/data/index.json` 파일 편집:
   ```json
   {
     "files": [
       "2026-02-08-work.md",
       "... 새로운 파일 추가 ..."
     ]
   }
   ```
3. 브라우저 새로고침 → 데이터 캐시 갱신

### 스크립트 자동화 (선택)

향후 Node.js 스크립트로 `public/data/` 디렉토리를 스캔하여 `index.json` 자동 생성 가능.

---

## 에러 처리 및 엣지 케이스

### 데이터 레이어

| 케이스 | 처리 |
|:---:|:---:|
| index.json 없음/로드 실패 | useFileList → error 상태 → Alert 표시 |
| 마크다운 파일 404 | useDailyReport → error 상태 → 404 UI 표시 |
| 네트워크 에러 | Alert (메시지 + "다시 시도" 버튼) |
| 마크다운 파싱 실패 | 에러 전파 → Alert (원본 마크다운 폴백은 선택) |
| 섹션 누락 | 빈 배열/기본값 반환 → UI에서 조건부 렌더링 (숨김) |
| 숫자 파싱 실패 | 0으로 처리 + console.warn() |

### UI 레이어

| 케이스 | 처리 |
|:---:|:---:|
| 차트 데이터 부족 (일지 1개) | "데이터가 충분하지 않습니다" 메시지 (선택) 또는 빈 차트 |
| 기술 스택 20개 초과 | 초기 15개 표시 + "더 보기" 버튼 (선택) |
| 매우 긴 텍스트 | `truncate`, `line-clamp-*` 클래스 사용 |
| 이전/다음 없음 | 해당 버튼 disabled |
| URL 파라미터 잘못됨 | 404 UI 표시 |

---

## 기술 스택 빈도 표시 (TechStackCloud.tsx)

### Badge Variant 매핑

**빈도에 따라 Badge variant 변경:**

```typescript
const getVariant = (frequency: number, maxFrequency: number) => {
  const percentage = frequency / maxFrequency;
  if (percentage > 0.8) return 'default';      // 상위 20%: 진한 색
  if (percentage > 0.5) return 'secondary';    // 중위: 중간 색
  return 'outline';                             // 하위 20%: 약한 색
};
```

### 카테고리 구분

**방법 1: 탭**
```typescript
<Tabs defaultValue="all">
  <TabsList>
    <TabsTrigger value="all">모두</TabsTrigger>
    <TabsTrigger value="languages">Languages</TabsTrigger>
    <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
    <TabsTrigger value="tools">Tools</TabsTrigger>
  </TabsList>
  <TabsContent value="all">{/* 모든 기술 */}</TabsContent>
  {/* ... */}
</Tabs>
```

**방법 2: 그룹 헤딩**
```typescript
<div>
  <h3>Languages</h3>
  <div className="flex flex-wrap gap-2">{/* Badge들 */}</div>
</div>
```

---

## 추가 구현 팁

### 1. 성능 최적화

- **useMemo**: 데이터 집계 결과 캐싱
  ```typescript
  const aggregated = useMemo(() => aggregateDailyReports(reports), [reports]);
  ```

- **useCallback**: 클릭 핸들러 메모이제이션
  ```typescript
  const handleNavigate = useCallback((filename: string) => {
    navigate(`/daily/${filename}`);
  }, [navigate]);
  ```

### 2. 숫자 포맷팅

- 1,234 형식: `Intl.NumberFormat('ko-KR')`
  ```typescript
  new Intl.NumberFormat('ko-KR').format(1234) // "1,234"
  ```

- 백분율: `((value / total) * 100).toFixed(1)%`

### 3. 날짜 처리

- 날짜 비교:
  ```typescript
  const isToday = dateStr === new Date().toISOString().split('T')[0];
  ```

- 월 네비게이션:
  ```typescript
  const prevMonth = new Date(year, month - 1, 1);
  const nextMonth = new Date(year, month + 1, 1);
  ```

### 4. 데이터 정렬

- 문자열 정렬: `array.sort((a, b) => a.localeCompare(b, 'ko'))`
- 숫자 정렬: `array.sort((a, b) => b.count - a.count)` (내림차순)
- 날짜 정렬: `array.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())`

### 5. Skeleton 컴포넌트 사용

```tsx
<Skeleton className="h-24 w-full" />
<Skeleton className="h-12 w-32" />
```

---

## 테스트 데이터 (public/data/)

### 샘플 index.json

```json
{
  "files": [
    "2026-02-08-work.md",
    "2026-02-08-side.md",
    "2026-02-09-1.md",
    "2026-02-10-work.md"
  ]
}
```

### 샘플 마크다운 구조

```markdown
# 2026-02-08

> 자동 생성: 2026-02-11

## 📊 전체 통계

- **102**개 세션
- **1600**회 도구 호출

## 🛠 주요 기술 스택

| 분류 | 기술 |
|---|---|
| Languages | TypeScript, Python, Markdown |
| Frameworks | React, Tailwind CSS |
| Tools | Git, npm |

## 🤖 클로드 코드 활용 방식

### 사용한 모드

- **Plan Mode**: 전체 세션의 36.1%

... (다른 섹션들)
```

---

## 결론

이 가이드를 따라 구현하면:

1. **일관된 구조**: 모든 컴포넌트, 훅, 유틸이 정의된 위치에 위치
2. **타입 안전**: TypeScript 인터페이스로 모든 데이터 타입 명시
3. **성능**: react-query + staleTime: Infinity로 불필요한 네트워크 요청 방지
4. **사용성**: 반응형 디자인 + 다크 모드 지원으로 모든 사용자 만족
5. **유지보수성**: 에러 처리, 로딩 상태, 빈 상태 모두 명확히 정의

**개발 순서 추천:**
1. 타입 정의 (types/index.ts)
2. 유틸리티 함수 (lib/utils.ts)
3. 마크다운 파서 (lib/parser.ts)
4. react-query 훅 (hooks/useReports.ts)
5. 레이아웃 및 라우팅 (Layout.tsx, App.tsx)
6. 상세 일지 페이지 (DailyDetailPage.tsx + 하위 컴포넌트들)
7. 일지 목록 페이지 (DailyListPage.tsx + CalendarView, ListView)
8. 홈 대시보드 (HomePage.tsx + 하위 컴포넌트들)
9. 다크 모드 (hooks/useTheme.ts)
10. 반응형 디자인 및 최적화
