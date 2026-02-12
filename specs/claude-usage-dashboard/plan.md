# Claude Usage Dashboard 기획 명세서

> 작성일: 2026-02-11
> 상태: 초안 (Draft)

---

## 기능명

Claude Usage Dashboard

## 기능 요약

클로드 코드(Claude Code) 사용 일지를 웹 대시보드로 시각화하는 서비스. 마크다운 파일(`YYYY-MM-DD-{identifier}.md`)을 읽어 파싱한 뒤, 종합 통계 대시보드, 개별 상세 일지, 일지 목록을 제공한다. 하루에 여러 일지가 존재할 수 있다 (예: 회사 업무용, 사이드 프로젝트용). React + TypeScript + Tailwind CSS + shadcn UI 기반의 SPA(Single Page Application)로 구현한다.

## 사용자 스토리

1. **종합 현황 파악**: As a 클로드 코드 사용자, I want to 전체 사용 통계를 한눈에 보고 싶다, so that 나의 AI 도구 활용 패턴과 생산성 추이를 파악할 수 있다.
2. **일별 상세 확인**: As a 클로드 코드 사용자, I want to 특정 날짜의 상세 활동 내역을 구조화된 UI로 확인하고 싶다, so that 그날 어떤 작업을 했고 어떤 도구를 어떻게 활용했는지 되돌아볼 수 있다.
3. **일지 탐색**: As a 클로드 코드 사용자, I want to 날짜별 일지 목록을 달력 또는 리스트 형태로 탐색하고 싶다, so that 원하는 날짜의 일지를 쉽게 찾아 접근할 수 있다.
4. **추세 분석**: As a 클로드 코드 사용자, I want to 기간별 세션 수, 도구 호출 수 등의 추이 차트를 보고 싶다, so that 시간에 따른 사용 패턴 변화를 분석할 수 있다.

---

## 상세 사용자 흐름 (User Flow)

### 흐름 1: 종합 대시보드 확인

```
진입 (/) → 전체 통계 카드 영역 확인 (총 세션 수, 총 도구 호출, 활동 일수, 총 프로젝트 수)
         → 도구 사용 비율 차트 확인
         → 작업 유형 비율 차트 확인
         → 기술 스택 빈도 확인
         → 기간별 트렌드 차트 확인 (일별 세션 수, 도구 호출 수)
         → 최근 활동 목록에서 특정 일지 카드 클릭
         → /daily/:filename 페이지로 이동
```

### 흐름 2: 일지 목록에서 상세 일지 진입

```
진입 (/daily) → 달력 뷰 또는 리스트 뷰 선택
             → 달력 뷰: 월 네비게이션으로 탐색 → 데이터가 있는 날짜 클릭 → 해당 날짜의 일지 목록 표시
             → 리스트 뷰: 카드 목록 스크롤 → 원하는 일지 카드 클릭
             → /daily/:filename 페이지로 이동
```

### 흐름 3: 일별 상세 일지 확인

```
진입 (/daily/:filename) → 전체 통계 카드 확인
                       → 기술 스택 태그 확인
                       → 클로드 코드 활용 방식 확인
                       → 프롬프트 패턴 확인
                       → 도구 활용 통계 테이블 확인
                       → 작업 유형 분포 확인
                       → 세션 상세 아코디언/타임라인 확인 (각 세션 그룹 펼치기/접기)
                       → 학습 인사이트 확인
                       → 워크플로우 패턴 확인
                       → 이전/다음 일지 네비게이션으로 다른 일지 이동
```

---

## 데이터 구조

### 마크다운 파일 위치

- 경로: `public/data/YYYY-MM-DD-{identifier}.md`
- 파일명 규칙: `YYYY-MM-DD` (날짜) + `-` + `{identifier}` (식별자: 숫자 또는 텍스트)
    - 예: `2026-02-08-1.md`, `2026-02-08-work.md`, `2026-02-08-side-project.md`
- 하루에 여러 파일이 존재할 수 있음 (회사 업무, 사이드 프로젝트 등)
- 인코딩: UTF-8

### 파일명에서 날짜와 식별자 추출

```typescript
// "2026-02-08-work.md" → { date: "2026-02-08", identifier: "work", filename: "2026-02-08-work" }
// "2026-02-08-side-project.md" → { date: "2026-02-08", identifier: "side-project", filename: "2026-02-08-side-project" }
const FILENAME_REGEX = /^(\d{4}-\d{2}-\d{2})-(.+)\.md$/;
```

### 파일 목록 관리

마크다운 파일 목록을 관리하기 위해 `public/data/index.json` 파일을 사용한다.

```json
{
    "files": ["2026-02-08-work.md", "2026-02-08-side.md", "2026-02-09-1.md", "2026-02-10-work.md"]
}
```

> **이유**: `public/data/` 디렉토리를 서버 없이 정적으로 서빙하므로, 디렉토리 리스팅이 불가능하다. 새 마크다운 파일을 추가할 때 `index.json`에도 파일명을 추가해야 한다. 이 과정은 향후 스크립트로 자동화할 수 있다.

### 파싱된 데이터 모델 (TypeScript 인터페이스)

```typescript
/** 일지 전체 데이터 (하루에 여러 개 가능) */
interface DailyReport {
    date: string; // "2026-02-08"
    identifier: string; // "work", "side", "1" 등 (파일명에서 추출)
    filename: string; // "2026-02-08-work" (확장자 제외, 라우팅에 사용)
    generatedDate: string; // "2026-02-11" (자동 생성 날짜)
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

/** 전체 통계 */
interface OverviewStats {
    totalSessions: number; // 102
    totalToolCalls: number; // 1600
    workingHoursUTC: string; // "04:53 ~ 15:22"
    workingHoursKST: string; // "13:53 ~ 00:22"
    projectCount: number; // 4
}

/** 프로젝트별 세션 정보 */
interface ProjectSession {
    projectName: string; // "트렌드 블로그 프로젝트"
    sessionCount: number; // 97
}

/** 기술 스택 */
interface TechStack {
    languages: string[]; // ["TypeScript", "Python", "Markdown"]
    frameworks: string[]; // ["Astro", "Tailwind CSS", "React"]
    tools: string[]; // ["Git", "npm", "Google AdSense", ...]
}

/** 클로드 코드 활용 방식 */
interface ClaudeUsage {
    modes: UsageMode[];
    features: UsageFeature[];
    delegationStyle: string[];
}

interface UsageMode {
    name: string; // "Plan Mode"
    description: string; // "전체 세션의 36.1%에서 사용"
    percentage?: number; // 36.1 (파싱 가능한 경우)
}

interface UsageFeature {
    name: string; // "서브에이전트 위임"
    description: string;
    percentage?: number;
    count?: number;
}

/** 프롬프트 패턴 */
interface PromptPatterns {
    effective: string[];
    conversationFlow: ConversationFlow[];
}

interface ConversationFlow {
    type: string; // "단발 요청", "연속 대화", "반복 세션"
    description: string;
}

/** 도구 통계 */
interface ToolStat {
    toolName: string; // "Read"
    usageCount: number; // 394
    primaryUse: string; // "코드 탐색 및 기존 구조 분석"
}

/** 작업 유형 */
interface TaskType {
    type: string; // "Coding"
    count: number; // 78
    description: string; // "컴포넌트 개발, 페이지 생성, ..."
}

/**
 * 작업 유형 → lucide-react 아이콘 매핑 (UI에서 사용)
 * Coding → Code, Refactoring → RefreshCw, Planning → Map,
 * Content Creation → FileText, Debugging → Bug, Configuration → Settings
 */

/** 세션 상세 */
interface SessionDetail {
    groupName: string; // "자동화 블로그 인프라 구축"
    startTimeUTC: string; // "04:53"
    taskTypes: string[]; // ["Coding", "Planning"]
    approach: string; // "대화형 요구사항 분석 → 아키텍처 설계 → ..."
    mainTasks: string; // "트렌드 수집 파이프라인, 블로그 프레임워크, ..."
    changeScale: string; // "45개 파일 생성, 9건 수정"
}

/** 워크플로우 패턴 */
interface WorkflowPattern {
    name: string; // "탐색 → 수정 → 검증"
    flow: string; // "Read → Edit → Bash"
}

/** 종합 통계 (홈 페이지용, 모든 일지를 집계) */
interface AggregatedStats {
    totalDays: number;
    totalSessions: number;
    totalToolCalls: number;
    totalProjects: number;
    toolUsageAggregated: ToolStat[];
    taskTypeAggregated: TaskType[];
    techStackFrequency: Map<string, number>;
    dailyTrend: DailyTrendPoint[];
}

interface DailyTrendPoint {
    date: string;
    reportCount: number; // 해당 날짜의 일지 수
    sessions: number; // 해당 날짜의 모든 일지 세션 합산
    toolCalls: number; // 해당 날짜의 모든 일지 도구 호출 합산
}
```

---

## 마크다운 파싱 전략

### 파서 라이브러리

- **unified + remark-parse**: 마크다운을 AST(Abstract Syntax Tree)로 변환
- **unist-util-visit**: AST 트리 순회
- 정규표현식을 보조적으로 사용하여 특정 패턴 추출 (예: 볼드 텍스트 내 숫자)

### 섹션 식별 규칙

마크다운의 `## ` (h2) 헤딩으로 주요 섹션을 식별한다. 각 섹션은 이모지 접두사로 구분되며, UI에서는 lucide-react 아이콘으로 대체하여 표시한다:

| 이모지 접두사 |         섹션          |           매핑 필드           | lucide-react 아이콘 |
| :-----------: | :-------------------: | :---------------------------: | :-----------------: |
|      📊       |       전체 통계       | `overview`, `projectSessions` |     `BarChart3`     |
|      🛠       |    주요 기술 스택     |          `techStack`          |      `Layers`       |
|      🤖       | 클로드 코드 활용 방식 |         `claudeUsage`         |        `Bot`        |
|      💬       |     프롬프트 패턴     |       `promptPatterns`        |   `MessageSquare`   |
|      🔧       |    도구 활용 통계     |          `toolStats`          |      `Wrench`       |
|      📝       |       작업 유형       |          `taskTypes`          |   `ClipboardList`   |
|      🗂       |       세션 상세       |       `sessionDetails`        |    `FolderOpen`     |
|      💡       |     학습 인사이트     |      `learningInsights`       |     `Lightbulb`     |
|      📈       |    워크플로우 패턴    |      `workflowPatterns`       |    `TrendingUp`     |

> **UI 규칙**: 마크다운 원본의 이모지는 파싱 시 섹션 식별용으로만 사용하고, 화면에는 표시하지 않는다. 모든 아이콘은 lucide-react로 통일한다.

### 데이터 추출 규칙

1. **날짜**: h1 헤딩에서 `YYYY-MM-DD` 패턴 추출
2. **자동 생성일**: blockquote에서 `자동 생성: YYYY-MM-DD` 패턴 추출
3. **전체 통계 수치**: 리스트 항목에서 `**숫자**` 패턴 추출, `약` 접두사는 제거하고 숫자만 파싱
4. **테이블 데이터**: 마크다운 테이블 행을 파싱하여 배열로 변환 (헤더 행과 구분선 행 제외)
5. **작업 유형**: `- 이모지 **타입** (숫자회) — 설명` 패턴으로 파싱 (이모지는 파싱 시 제거, UI에서는 lucide-react 아이콘으로 대체)
6. **워크플로우 패턴**: 번호 리스트에서 `**이름**: 흐름` 패턴 추출

### 파싱 실패 처리

- 특정 섹션이 마크다운 파일에 존재하지 않는 경우: 해당 필드를 빈 배열 또는 기본값으로 설정
- 숫자 파싱 실패 시: `0`으로 설정하고 콘솔에 경고 로그 출력
- 전체 파일 파싱 실패 시: 에러 상태를 UI에 표시하고 원본 마크다운을 폴백으로 표시

---

## 화면별 요구사항 (디자이너용)

### 공통 레이아웃

#### 헤더

- **좌측**: 로고/서비스명 "Claude Usage Dashboard" (클릭 시 `/`로 이동)
- **우측**: 다크 모드 토글 버튼 (sun/moon 아이콘)
- **높이**: 64px
- **배경**: 라이트 모드 `white`, 다크 모드 `zinc-950`
- **하단 경계선**: 1px solid (라이트: `zinc-200`, 다크: `zinc-800`)

#### 사이드바 (없음)

- 페이지 수가 3개로 적으므로 사이드바 없이 헤더 내 네비게이션으로 처리
- 헤더에 "Dashboard", "Daily Logs" 네비게이션 링크 배치
- 현재 페이지에 해당하는 링크에 밑줄 또는 활성 색상 표시

#### 메인 콘텐츠 영역

- **최대 너비**: 1280px
- **좌우 패딩**: 모바일 16px, 태블릿 이상 24px, 데스크탑 이상 32px
- **상하 패딩**: 24px

#### 반응형 브레이크포인트

- 모바일: < 768px (1열 레이아웃)
- 태블릿: 768px ~ 1023px (2열 그리드)
- 데스크탑: >= 1024px (3~4열 그리드)

---

### 페이지 1: 홈 대시보드 (`/`)

#### 1-1. 페이지 타이틀 영역

- **타이틀**: "Dashboard" (text-3xl, font-bold)
- **서브타이틀**: "클로드 코드 사용 현황 종합" (text-muted-foreground)
- **하단 간격**: 24px

#### 1-2. 통계 카드 그리드

- **레이아웃**: 4열 그리드 (데스크탑), 2열 (태블릿), 1열 (모바일)
- **카드 구성** (shadcn Card 컴포넌트 사용):

| 카드 |    아이콘     |     라벨     |          값          |  보조 텍스트   |
| :--: | :-----------: | :----------: | :------------------: | :------------: |
|  1   |   Calendar    |  활동 일수   |   `{totalDays}일`    | 전체 기록 기간 |
|  2   | MessageSquare |  총 세션 수  | `{totalSessions}개`  | 부모 세션 기준 |
|  3   |    Wrench     | 총 도구 호출 | `{totalToolCalls}회` |   전체 누적    |
|  4   |  FolderOpen   | 프로젝트 수  | `{totalProjects}개`  | 고유 프로젝트  |

- **카드 스타일**: 배경 그라데이션 미사용, 깔끔한 보더 스타일
- **값 텍스트**: text-2xl, font-bold
- **라벨 텍스트**: text-sm, text-muted-foreground

#### 1-3. 차트 영역

- **레이아웃**: 2열 그리드 (데스크탑), 1열 (모바일)

**좌측: 도구 사용 비율 차트**

- **차트 타입**: 수평 Bar Chart (recharts `BarChart`)
- **데이터**: 모든 일지의 도구 사용 횟수를 합산하여 상위 10개 도구 표시
- **X축**: 사용 횟수
- **Y축**: 도구 이름
- **바 색상**: 클로드 브랜드 컬러 계열 (예: `#D97706` amber 계열)
- **카드 타이틀**: "도구 사용 현황"

**우측: 작업 유형 비율 차트**

- **차트 타입**: Pie Chart (recharts `PieChart`) 또는 Donut Chart
- **데이터**: 모든 일지의 작업 유형별 건수 합산
- **각 조각에 라벨**: lucide-react 아이콘 + 타입명 + 비율(%)
- **범례**: 차트 하단에 가로 배치
- **카드 타이틀**: "작업 유형 분포"

#### 1-4. 기간별 트렌드 차트

- **레이아웃**: 전체 너비 1열
- **차트 타입**: Area Chart 또는 Line Chart (recharts `AreaChart`)
- **데이터**: 일별 세션 수, 도구 호출 수 (이중 Y축)
- **X축**: 날짜 (MM-DD 형식)
- **Y축 좌측**: 세션 수 (선: 파란 계열)
- **Y축 우측**: 도구 호출 수 (선: 주황 계열)
- **인터랙션**: 호버 시 툴팁에 해당 날짜의 세션 수, 도구 호출 수 표시
- **날짜 클릭**: 해당 날짜의 `/daily/:filename` 페이지로 이동
- **카드 타이틀**: "일별 활동 추이"

#### 1-5. 기술 스택 빈도

- **레이아웃**: 전체 너비 1열
- **표시 방식**: 태그 클라우드 형태
- **각 태그**: shadcn Badge 컴포넌트, 빈도에 따라 크기 또는 색상 농도 차등
    - 빈도 상위 20%: `default` variant (진한 색)
    - 빈도 중위: `secondary` variant
    - 빈도 하위 20%: `outline` variant
- **카테고리 구분**: "Languages", "Frameworks", "Tools" 탭 또는 그룹 헤딩으로 분리
- **카드 타이틀**: "기술 스택"

#### 1-6. 최근 활동 목록

- **레이아웃**: 전체 너비 1열, 세로 카드 목록
- **표시 개수**: 최근 7일 (데이터가 있는 날짜 기준)
- **각 카드 구성**:
    - 날짜 (text-lg, font-semibold): "2026-02-08 (일)"
    - 핵심 수치: 세션 수 | 도구 호출 수 | 프로젝트 수
    - 식별자 Badge (예: "work", "side")
    - 주요 작업 유형 태그 (상위 3개, Badge 컴포넌트)
    - 클릭 시 `/daily/:filename`으로 이동
- **"전체 보기" 링크**: 카드 목록 하단, `/daily`로 이동
- **카드 타이틀**: "최근 활동"

#### 상태별 UI

**로딩 상태**:

- 통계 카드: 4개의 Skeleton 카드 (높이 120px)
- 차트 영역: Skeleton 박스 (높이 300px) 2개
- 트렌드 차트: Skeleton 박스 (높이 250px) 1개
- 최근 활동: Skeleton 카드 3개

**에러 상태**:

- 전체 영역에 에러 Alert 컴포넌트 표시
- 아이콘: AlertCircle
- 메시지: "데이터를 불러오는 중 오류가 발생했습니다."
- "다시 시도" 버튼

**빈 상태** (데이터 파일이 하나도 없는 경우):

- 중앙 정렬 일러스트/아이콘 (FileText 아이콘, 크기 64px)
- 메시지: "아직 기록된 사용 일지가 없습니다."
- 서브 메시지: "public/data/ 디렉토리에 마크다운 파일을 추가해 주세요."

---

### 페이지 2: 사용 일지 상세 (`/daily/:filename`)

#### 2-1. 페이지 헤더

- **이전/다음 네비게이션**: 좌측 `<` 버튼, 우측 `>` 버튼 (이전/다음 일지로 이동, index.json 순서 기준)
- **날짜 타이틀**: "2026-02-08 (일)" (text-3xl, font-bold)
- **식별자 뱃지**: 파일명의 identifier 부분을 Badge로 표시 (예: "work", "side-project")
- **자동 생성일**: "자동 생성: 2026-02-11" (text-sm, text-muted-foreground)
- **목록으로 돌아가기**: "← 목록" 링크 (`/daily`로 이동)

#### 2-2. 전체 통계 카드

- **레이아웃**: 4열 그리드 (홈 대시보드와 동일한 카드 스타일)

| 카드 |     라벨     |          값          |
| :--: | :----------: | :------------------: |
|  1   |  총 세션 수  | `{totalSessions}개`  |
|  2   | 총 도구 호출 | `{totalToolCalls}회` |
|  3   | 작업 시간대  | `{workingHoursKST}`  |
|  4   | 프로젝트 수  |  `{projectCount}개`  |

- **프로젝트별 세션 수**: 통계 카드 아래에 테이블로 표시

#### 2-3. 기술 스택 섹션

- **카드 타이틀**: "기술 스택"
- **3개 서브 섹션**: Languages / Frameworks / Tools
- **각 항목**: shadcn Badge 컴포넌트, 가로 나열 (flex-wrap)
- **각 서브 섹션 라벨**: text-sm, font-medium, text-muted-foreground

#### 2-4. 클로드 코드 활용 방식 섹션

- **카드 타이틀**: "클로드 코드 활용 방식"
- **3개 서브 섹션**:
    - **사용한 모드**: 각 모드를 카드 또는 리스트로 표시, 퍼센티지가 있으면 Progress 바 포함
    - **활용한 기능**: 기능명 + 설명 리스트, 퍼센티지/횟수 수치 강조 표시
    - **작업 위임 스타일**: 불릿 리스트

#### 2-5. 프롬프트 패턴 섹션

- **카드 타이틀**: "프롬프트 패턴"
- **2개 서브 섹션**:
    - **효과적이었던 프롬프트**: 불릿 리스트
    - **대화 흐름**: 각 흐름 타입을 볼드 라벨 + 설명 형태로 표시

#### 2-6. 도구 활용 통계 테이블

- **카드 타이틀**: "도구 활용 통계"
- **테이블 컬럼**: 도구명 | 사용 횟수 | 주요 용도
- **정렬**: 사용 횟수 내림차순 (기본)
- **사용 횟수 셀**: 숫자 + 수평 Bar (전체 대비 비율을 시각적으로 표시)
- shadcn Table 컴포넌트 사용

#### 2-7. 작업 유형 분포

- **카드 타이틀**: "작업 유형"
- **표시 방식**: lucide-react 아이콘 + 타입명 + 건수 + 설명을 카드 형태로 표시
- **레이아웃**: 2열 그리드 (데스크탑), 1열 (모바일)
- **각 카드**: 좌측에 lucide-react 아이콘 (24px), 우측에 타입명(font-semibold) + 건수(Badge) + 설명(text-sm)

#### 2-8. 세션 상세

- **카드 타이틀**: "세션 상세"
- **표시 방식**: 아코디언 (shadcn Accordion 컴포넌트)
- **각 아코디언 아이템**:
    - **트리거(닫힌 상태)**: 세션 그룹명 + 시작 시간 + 작업 유형 태그
    - **콘텐츠(펼친 상태)**:
        - 활용 방식: 텍스트
        - 주요 작업: 텍스트
        - 수정 규모: 텍스트 (숫자 강조)
- **기본 상태**: 첫 번째 아코디언만 펼쳐진 상태

#### 2-9. 학습 인사이트

- **카드 타이틀**: "학습 인사이트"
- **표시 방식**: 불릿 리스트, 각 항목 앞에 Lightbulb 아이콘 (lucide-react)
- **각 항목에서 볼드 텍스트**: font-semibold로 강조

#### 2-10. 워크플로우 패턴

- **카드 타이틀**: "워크플로우 패턴"
- **표시 방식**: 번호 리스트, 각 항목을 카드 형태로
- **패턴명**: font-semibold
- **흐름**: 코드 스타일 폰트(monospace), 화살표로 연결된 도구명을 Badge로 표시

#### 상태별 UI

**로딩 상태**:

- 페이지 헤더: 날짜 영역 Skeleton
- 각 섹션: Skeleton 카드

**에러 상태** (파일을 불러올 수 없는 경우):

- Alert 컴포넌트: "해당 날짜의 일지를 불러올 수 없습니다."
- "목록으로 돌아가기" 버튼

**404 상태** (해당 날짜의 파일이 존재하지 않는 경우):

- 중앙 정렬 아이콘 + 메시지: "해당 날짜의 일지가 없습니다."
- "목록으로 돌아가기" 버튼

---

### 페이지 3: 사용 일지 목록 (`/daily`)

#### 3-1. 페이지 헤더

- **타이틀**: "Daily Logs" (text-3xl, font-bold)
- **서브타이틀**: "날짜별 클로드 코드 사용 일지" (text-muted-foreground)
- **뷰 전환 토글**: 달력 뷰 / 리스트 뷰 (shadcn ToggleGroup, 우측 상단 배치)

#### 3-2. 달력 뷰 (기본 뷰)

- **월 네비게이션**: `< 2026년 2월 >` 형태, 좌우 화살표로 월 이동
- **달력 그리드**: 7열 (일~토), 해당 월의 날짜 셀 표시
- **데이터 있는 날짜**:
    - 셀 배경: 연한 하이라이트 (primary 색상 10% opacity)
    - 일지 수를 작은 숫자로 표시 (같은 날짜에 여러 일지가 있을 수 있음)
    - 호버 시: 툴팁에 "일지: N개 | 세션: N개 | 도구 호출: N회" 표시
    - 일지 1개인 날짜 클릭: `/daily/:filename`으로 바로 이동
    - 일지 여러 개인 날짜 클릭: 해당 날짜의 일지 목록 팝오버 표시 → 개별 일지 클릭 시 `/daily/:filename`으로 이동
- **데이터 없는 날짜**: 기본 스타일, 클릭 불가
- **오늘 날짜**: 테두리 강조 (primary 색상 border)

#### 3-3. 리스트 뷰

- **정렬**: 최신 날짜순 (내림차순), 같은 날짜 내에서는 파일명 순
- **각 카드 구성**:
    - **좌측**: 날짜 (큰 글씨, text-xl, font-bold) + 요일
    - **중앙**:
        - 식별자 Badge (예: "work", "side-project")
        - 핵심 수치: 세션 `{N}개` | 도구 호출 `{N}회` | 프로젝트 `{N}개`
        - 주요 작업 유형 (상위 3개, Badge 컴포넌트)
    - **우측**: 화살표 아이콘 클릭 유도
- **카드 클릭**: `/daily/:filename`으로 이동
- **같은 날짜 그룹핑**: 같은 날짜의 카드들은 날짜 헤딩 아래에 묶어서 표시
- **카드 간격**: 8px

#### 상태별 UI

**로딩 상태**:

- 달력 뷰: 달력 그리드 Skeleton
- 리스트 뷰: Skeleton 카드 5개

**빈 상태**:

- 중앙 정렬 아이콘 + 메시지: "기록된 사용 일지가 없습니다."

---

## 기능 요구사항 (개발자용)

### 프로젝트 구조

```
claude-usage-dashboard/
├── public/
│   └── data/
│       ├── index.json            # 파일 목록
│       ├── 2026-02-08.md
│       └── ...
├── src/
│   ├── components/
│   │   ├── ui/                   # shadcn UI 컴포넌트
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── Layout.tsx
│   │   ├── dashboard/
│   │   │   ├── StatsCards.tsx
│   │   │   ├── ToolUsageChart.tsx
│   │   │   ├── TaskTypeChart.tsx
│   │   │   ├── TrendChart.tsx
│   │   │   ├── TechStackCloud.tsx
│   │   │   └── RecentActivity.tsx
│   │   ├── daily/
│   │   │   ├── DailyHeader.tsx
│   │   │   ├── OverviewStats.tsx
│   │   │   ├── TechStackSection.tsx
│   │   │   ├── ClaudeUsageSection.tsx
│   │   │   ├── PromptPatterns.tsx
│   │   │   ├── ToolStatsTable.tsx
│   │   │   ├── TaskTypeGrid.tsx
│   │   │   ├── SessionAccordion.tsx
│   │   │   ├── LearningInsights.tsx
│   │   │   └── WorkflowPatterns.tsx
│   │   └── daily-list/
│   │       ├── CalendarView.tsx
│   │       └── ListView.tsx
│   ├── hooks/
│   │   ├── useReports.ts         # react-query 기반 쿼리 훅 (useFileList, useDailyReport, useAllReports)
│   │   └── useTheme.ts           # 다크 모드 관리
│   ├── lib/
│   │   ├── parser.ts             # 마크다운 파싱 로직
│   │   ├── aggregator.ts         # 데이터 집계 로직
│   │   └── utils.ts              # 유틸리티 함수
│   ├── types/
│   │   └── index.ts              # TypeScript 타입 정의
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── DailyDetailPage.tsx
│   │   └── DailyListPage.tsx
│   ├── App.tsx
│   └── main.tsx
├── specs/
│   └── claude-usage-dashboard/
│       └── plan.md
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vite.config.ts
└── index.html
```

### 라우팅 설정

```typescript
// React Router v6
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/daily" element={<DailyListPage />} />
  <Route path="/daily/:filename" element={<DailyDetailPage />} />
</Routes>
```

- `:filename` 파라미터: 확장자를 제외한 파일명 (예: `2026-02-08-work`)
- 존재하지 않는 파일명 접근 시: 404 상태 UI 표시

### 데이터 Fetching

#### 파일 목록 로드

```typescript
// GET /data/index.json
async function fetchFileList(): Promise<string[]> {
    const response = await fetch("/data/index.json");
    const data = await response.json();
    return data.files; // ["2026-02-08.md", ...]
}
```

#### 단일 마크다운 파일 로드

```typescript
// GET /data/2026-02-08-work.md
async function fetchDailyMarkdown(filename: string): Promise<string> {
    const response = await fetch(`/data/${filename}.md`);
    if (!response.ok) throw new Error(`File not found: ${filename}.md`);
    return response.text();
}
```

#### 캐싱 전략 (TanStack Query / react-query)

- `@tanstack/react-query`를 사용하여 데이터 fetching과 캐싱을 처리한다.
- 일지 데이터는 자주 변경되지 않는 정적 데이터이므로 `staleTime: Infinity`, `gcTime: Infinity`로 설정하여 한 번 로드한 후 재요청하지 않는다.

```typescript
// 파일 목록 쿼리
const useFileList = () =>
    useQuery({
        queryKey: ["fileList"],
        queryFn: fetchFileList,
        staleTime: Infinity
    });

// 단일 일지 쿼리
const useDailyReport = (filename: string) =>
    useQuery({
        queryKey: ["report", filename],
        queryFn: () => fetchDailyMarkdown(filename).then(parseDailyReport),
        staleTime: Infinity,
        enabled: !!filename
    });

// 전체 일지 쿼리 (홈 대시보드용)
const useAllReports = () => {
    const { data: files } = useFileList();
    return useQueries({
        queries: (files ?? []).map((file) => ({
            queryKey: ["report", file.replace(".md", "")],
            queryFn: () => fetchDailyMarkdown(file.replace(".md", "")).then(parseDailyReport),
            staleTime: Infinity
        })),
        combine: (results) => ({
            data: results.map((r) => r.data).filter(Boolean),
            isLoading: results.some((r) => r.isLoading),
            isError: results.some((r) => r.isError)
        })
    });
};
```

### 마크다운 파싱 로직 (`lib/parser.ts`)

#### 핵심 함수

```typescript
function parseDailyReport(markdown: string): DailyReport;
```

#### 파싱 절차

1. unified + remark-parse로 AST 생성
2. AST에서 h1 노드를 찾아 날짜 추출
3. AST에서 blockquote 노드를 찾아 자동 생성일 추출
4. AST에서 h2 노드를 기준으로 섹션 분할
5. 각 섹션의 이모지 접두사로 섹션 타입 식별
6. 섹션 타입별 전용 파서 함수 호출

### 다크 모드

- `useTheme` 훅으로 관리
- 시스템 설정 감지: `window.matchMedia('(prefers-color-scheme: dark)')`
- 사용자 선택 저장: `localStorage`에 `theme` 키로 `'light' | 'dark' | 'system'` 저장
- 적용 방식: `<html>` 태그에 `class="dark"` 추가/제거 (Tailwind dark mode: class)
- 초기값: `'system'`

### 필요 패키지

```json
{
    "dependencies": {
        "react": "^18",
        "react-dom": "^18",
        "react-router-dom": "^6",
        "@tanstack/react-query": "^5",
        "recharts": "^2",
        "unified": "^11",
        "remark-parse": "^11",
        "unist-util-visit": "^5",
        "lucide-react": "latest",
        "class-variance-authority": "latest",
        "clsx": "latest",
        "tailwind-merge": "latest"
    },
    "devDependencies": {
        "typescript": "^5",
        "@types/react": "^18",
        "@types/react-dom": "^18",
        "tailwindcss": "^3",
        "autoprefixer": "latest",
        "postcss": "latest",
        "vite": "^5",
        "@vitejs/plugin-react": "^4"
    }
}
```

---

## 예외 처리 및 엣지 케이스

### 데이터 관련

|                    케이스                     |                     처리 방법                      |
| :-------------------------------------------: | :------------------------------------------------: |
|     `index.json` 파일이 없거나 fetch 실패     | 홈, 목록 페이지에 에러 Alert 표시 + 다시 시도 버튼 |
|            `index.json`이 빈 배열             |                  빈 상태 UI 표시                   |
|      특정 마크다운 파일 fetch 실패 (404)      |           상세 페이지에 404 상태 UI 표시           |
| 특정 마크다운 파일 fetch 실패 (네트워크 오류) |            에러 Alert + 다시 시도 버튼             |
| 마크다운 파일 구조가 예상과 다름 (섹션 누락)  |    파싱 가능한 섹션만 표시, 누락 섹션은 UI 숨김    |
|         숫자 데이터에 "약" 등 접두사          |     정규식으로 숫자만 추출, 실패 시 0으로 처리     |
|      존재하지 않는 filename URL 파라미터      |                  404 상태 UI 표시                  |

### UI 관련

|           케이스            |              처리 방법              |
| :-------------------------: | :---------------------------------: |
| 차트 데이터 부족 (일지 1개) | "데이터가 충분하지 않습니다" 메시지 |
|     기술 스택 20개 초과     |   초기 15개 표시 + "더 보기" 버튼   |
|       매우 긴 텍스트        |   `text-overflow: ellipsis` 처리    |

### 이전/다음 일지 네비게이션

- `index.json`의 파일 목록 기준으로 이전/다음 일지로 이동 (같은 날짜의 다른 일지 포함)
- 첫 번째 일지에서 "이전" 버튼: disabled
- 마지막 일지에서 "다음" 버튼: disabled

---

## 우선순위 및 구현 단계

### Phase 1: MVP (필수 핵심)

1. 프로젝트 초기 설정 (Claude Usage Dashboard)
2. 마크다운 파서 구현 (`lib/parser.ts`)
3. 사용 일지 상세 페이지 (`/daily/:filename`)
4. 사용 일지 목록 페이지 (`/daily`) - 리스트 뷰
5. 기본 레이아웃 및 라우팅
6. `public/data/index.json` 및 샘플 데이터

### Phase 2: 대시보드 및 차트

1. 데이터 집계 로직 (`lib/aggregator.ts`)
2. 홈 대시보드 (`/`) - 통계 카드, 차트, 최근 활동
3. recharts 차트 (Bar, Pie, Area)
4. 기술 스택 빈도 표시

### Phase 3: UX 향상

1. 다크 모드 지원
2. 달력 뷰
3. 이전/다음 날짜 네비게이션
4. 로딩 Skeleton UI
5. 에러 및 빈 상태 UI
6. 반응형 디자인 최적화
