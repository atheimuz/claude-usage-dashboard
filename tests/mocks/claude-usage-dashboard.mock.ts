/**
 * 목업 데이터: Claude Usage Dashboard
 *
 * 실제 API 존재 여부와 관계없이 항상 목업 데이터를 사용
 * - /data/index.json: 파일 목록
 * - /data/*.md: 마크다운 파일
 */

// 파일 목록 (index.json)
export const MOCK_INDEX_JSON = {
    files: [
        { name: "2026-02-08.md", location: "work" },
        { name: "2026-02-08.md", location: "side" },
        { name: "2026-02-09.md", location: "work" },
        { name: "2026-02-10.md", location: "work" }
    ]
};

// 마크다운 파일 내용
export const MOCK_MARKDOWN_FILES: Record<string, string> = {
    "work/2026-02-08": `# 2026-02-08 클로드 코드 사용 일지

> 자동 생성: 2026-02-11

## 📊 전체 통계

- 총 세션 수: **102개**
- 총 도구 호출: **1600회**
- 작업 시간대 (UTC): 04:53 ~ 15:22
- 작업 시간대 (KST): 13:53 ~ 00:22
- 프로젝트 수: **4개**

### 프로젝트별 세션 수

| 프로젝트 | 세션 수 |
|:---:|:---:|
| 트렌드 블로그 프로젝트 | 97 |
| 문서 작업 | 3 |
| 설정 작업 | 2 |

## 🛠 주요 기술 스택

### Languages
- TypeScript
- Python
- Markdown

### Frameworks
- Astro
- Tailwind CSS
- React

### Tools
- Git
- npm
- Google AdSense
- Playwright

## 🤖 클로드 코드 활용 방식

### 사용한 모드
- **Plan Mode**: 전체 세션의 36.1%에서 사용
- **Code Mode**: 전체 세션의 63.9%에서 사용

### 활용한 기능
- **서브에이전트 위임**: 전체 세션의 25.5%에서 사용 (26회)
- **파일 수정**: 전체 세션의 74.5%에서 직접 사용 (76회)

### 작업 위임 스타일
- 구조 설계 → 구현 위임
- 문제 상황 공유 → 해결 방안 위임

## 💬 프롬프트 패턴

### 효과적이었던 프롬프트
- "X 기능을 Y 방식으로 구현해주세요"
- "현재 Z 문제가 발생하는데, 원인을 분석하고 해결해주세요"

### 대화 흐름
- **단발 요청**: 명확한 작업 지시
- **연속 대화**: 점진적 개선
- **반복 세션**: 유사 작업 패턴화

## 🔧 도구 활용 통계

| 도구명 | 사용 횟수 | 주요 용도 |
|:---:|:---:|:---:|
| Read | 394 | 코드 탐색 및 기존 구조 분석 |
| Edit | 245 | 파일 수정 |
| Write | 123 | 새 파일 생성 |
| Bash | 89 | Git 커밋, npm 명령 |
| Grep | 67 | 코드베이스 검색 |

## 📝 작업 유형

- 💻 **Coding** (78회) — 컴포넌트 개발, 페이지 생성, 기능 구현
- 🔄 **Refactoring** (15회) — 코드 구조 개선, 타입 정리
- 🗺️ **Planning** (5회) — 아키텍처 설계, 명세서 작성
- 📄 **Content Creation** (3회) — 문서 작성
- 🐛 **Debugging** (1회) — 버그 수정

## 🗂 세션 상세

### 자동화 블로그 인프라 구축
- 시작 시간: 04:53 (UTC)
- 작업 유형: Coding, Planning
- 활용 방식: 대화형 요구사항 분석 → 아키텍처 설계 → 단계별 구현
- 주요 작업: 트렌드 수집 파이프라인, 블로그 프레임워크, SEO 최적화
- 수정 규모: 45개 파일 생성, 9건 수정

### 컴포넌트 개발
- 시작 시간: 10:15 (UTC)
- 작업 유형: Coding
- 활용 방식: 요구사항 전달 → 구현 → 테스트
- 주요 작업: React 컴포넌트 작성, 스타일링
- 수정 규모: 12개 파일 수정

## 💡 학습 인사이트

- **명확한 컨텍스트 제공**이 결과물 품질을 크게 향상시킴
- **단계별 검증**을 통해 오류를 조기에 발견
- **패턴 재사용**으로 작업 속도 향상

## 📈 워크플로우 패턴

1. **탐색 → 수정 → 검증**: Read → Edit → Bash
2. **검색 → 분석 → 수정**: Grep → Read → Edit
3. **생성 → 테스트 → 커밋**: Write → Bash → Bash
`,

    "side/2026-02-08": `# 2026-02-08 클로드 코드 사용 일지 (사이드 프로젝트)

> 자동 생성: 2026-02-11

## 📊 전체 통계

- 총 세션 수: **25개**
- 총 도구 호출: **350회**
- 작업 시간대 (UTC): 12:00 ~ 15:00
- 작업 시간대 (KST): 21:00 ~ 00:00
- 프로젝트 수: **1개**

### 프로젝트별 세션 수

| 프로젝트 | 세션 수 |
|:---:|:---:|
| 개인 포트폴리오 | 25 |

## 🛠 주요 기술 스택

### Languages
- TypeScript
- HTML
- CSS

### Frameworks
- Next.js
- Tailwind CSS

### Tools
- Git
- Vercel

## 🤖 클로드 코드 활용 방식

### 사용한 모드
- **Code Mode**: 전체 세션의 100%에서 사용

### 활용한 기능
- **파일 수정**: 전체 세션의 100%에서 직접 사용 (25회)

### 작업 위임 스타일
- 직접 구현 요청

## 💬 프롬프트 패턴

### 효과적이었던 프롬프트
- "포트폴리오 페이지 디자인 개선"

### 대화 흐름
- **단발 요청**: 명확한 작업 지시

## 🔧 도구 활용 통계

| 도구명 | 사용 횟수 | 주요 용도 |
|:---:|:---:|:---:|
| Read | 120 | 코드 분석 |
| Edit | 95 | 파일 수정 |
| Write | 78 | 새 파일 생성 |
| Bash | 57 | Git 명령 |

## 📝 작업 유형

- 💻 **Coding** (20회) — 페이지 구현
- 🔄 **Refactoring** (5회) — 코드 정리

## 🗂 세션 상세

### 포트폴리오 레이아웃 구현
- 시작 시간: 12:00 (UTC)
- 작업 유형: Coding
- 활용 방식: 레이아웃 설계 → 구현 → 스타일링
- 주요 작업: 반응형 레이아웃, 애니메이션 추가
- 수정 규모: 8개 파일 생성, 3건 수정

## 💡 학습 인사이트

- **작은 단위로 나눠서 작업**하면 디버깅이 쉬움

## 📈 워크플로우 패턴

1. **설계 → 구현 → 확인**: Read → Write → Bash
`,

    "work/2026-02-09": `# 2026-02-09 클로드 코드 사용 일지

> 자동 생성: 2026-02-11

## 📊 전체 통계

- 총 세션 수: **45개**
- 총 도구 호출: **680회**
- 작업 시간대 (UTC): 05:00 ~ 14:00
- 작업 시간대 (KST): 14:00 ~ 23:00
- 프로젝트 수: **2개**

### 프로젝트별 세션 수

| 프로젝트 | 세션 수 |
|:---:|:---:|
| E2E 테스트 프레임워크 | 30 |
| API 서버 개발 | 15 |

## 🛠 주요 기술 스택

### Languages
- TypeScript
- JavaScript

### Frameworks
- Playwright
- Express

### Tools
- Git
- npm
- Docker

## 🤖 클로드 코드 활용 방식

### 사용한 모드
- **Plan Mode**: 전체 세션의 40%에서 사용
- **Code Mode**: 전체 세션의 60%에서 사용

### 활용한 기능
- **서브에이전트 위임**: 전체 세션의 30%에서 사용
- **파일 수정**: 전체 세션의 70%에서 직접 사용

### 작업 위임 스타일
- 테스트 시나리오 작성 → 구현 위임

## 💬 프롬프트 패턴

### 효과적이었던 프롬프트
- "E2E 테스트를 Page Object 패턴으로 작성해주세요"

### 대화 흐름
- **연속 대화**: 단계별 개선

## 🔧 도구 활용 통계

| 도구명 | 사용 횟수 | 주요 용도 |
|:---:|:---:|:---:|
| Read | 210 | 테스트 코드 분석 |
| Write | 156 | 테스트 파일 생성 |
| Edit | 134 | 파일 수정 |
| Bash | 102 | 테스트 실행 |
| Grep | 78 | 코드 검색 |

## 📝 작업 유형

- 💻 **Coding** (35회) — 테스트 작성, API 구현
- 🗺️ **Planning** (8회) — 테스트 시나리오 설계
- 🐛 **Debugging** (2회) — 테스트 실패 분석

## 🗂 세션 상세

### E2E 테스트 프레임워크 구축
- 시작 시간: 05:00 (UTC)
- 작업 유형: Coding, Planning
- 활용 방식: 테스트 전략 수립 → Page Object 구현 → 테스트 작성
- 주요 작업: Playwright 설정, 테스트 스펙 작성
- 수정 규모: 24개 파일 생성, 6건 수정

## 💡 학습 인사이트

- **Page Object 패턴**이 테스트 유지보수를 크게 개선

## 📈 워크플로우 패턴

1. **분석 → 작성 → 실행**: Read → Write → Bash
`,

    "work/2026-02-10": `# 2026-02-10 클로드 코드 사용 일지

> 자동 생성: 2026-02-11

## 📊 전체 통계

- 총 세션 수: **68개**
- 총 도구 호출: **890회**
- 작업 시간대 (UTC): 03:30 ~ 16:00
- 작업 시간대 (KST): 12:30 ~ 01:00
- 프로젝트 수: **3개**

### 프로젝트별 세션 수

| 프로젝트 | 세션 수 |
|:---:|:---:|
| 대시보드 프로젝트 | 50 |
| 성능 최적화 | 10 |
| 문서 작업 | 8 |

## 🛠 주요 기술 스택

### Languages
- TypeScript
- Python

### Frameworks
- React
- FastAPI
- Tailwind CSS

### Tools
- Git
- npm
- Docker
- AWS

## 🤖 클로드 코드 활용 방식

### 사용한 모드
- **Plan Mode**: 전체 세션의 35%에서 사용
- **Code Mode**: 전체 세션의 65%에서 사용

### 활용한 기능
- **서브에이전트 위임**: 전체 세션의 28%에서 사용
- **파일 수정**: 전체 세션의 72%에서 직접 사용

### 작업 위임 스타일
- 컴포넌트 설계 → 구현 위임
- 성능 이슈 분석 → 최적화 위임

## 💬 프롬프트 패턴

### 효과적이었던 프롬프트
- "대시보드 차트 컴포넌트를 recharts로 구현해주세요"
- "API 응답 시간을 개선해주세요"

### 대화 흐름
- **단발 요청**: 명확한 작업 지시
- **연속 대화**: 점진적 개선

## 🔧 도구 활용 통계

| 도구명 | 사용 횟수 | 주요 용도 |
|:---:|:---:|:---:|
| Read | 280 | 코드 분석 |
| Edit | 195 | 파일 수정 |
| Write | 167 | 새 파일 생성 |
| Bash | 134 | Git, npm 명령 |
| Grep | 114 | 코드 검색 |

## 📝 작업 유형

- 💻 **Coding** (55회) — 대시보드 구현
- 🔄 **Refactoring** (8회) — 성능 최적화
- 📄 **Content Creation** (5회) — 문서 작성

## 🗂 세션 상세

### 대시보드 차트 구현
- 시작 시간: 03:30 (UTC)
- 작업 유형: Coding
- 활용 방식: 요구사항 분석 → 차트 컴포넌트 구현 → 데이터 연동
- 주요 작업: recharts 설정, 커스텀 차트 구현
- 수정 규모: 18개 파일 생성, 12건 수정

### API 성능 최적화
- 시작 시간: 11:00 (UTC)
- 작업 유형: Refactoring
- 활용 방식: 병목 분석 → 캐싱 추가 → 쿼리 최적화
- 주요 작업: Redis 캐시 적용, DB 인덱스 추가
- 수정 규모: 8개 파일 수정

## 💡 학습 인사이트

- **컴포넌트 재사용성**을 고려한 설계가 중요
- **점진적 최적화**가 안전한 접근법

## 📈 워크플로우 패턴

1. **분석 → 구현 → 테스트**: Read → Write → Bash
2. **검색 → 분석 → 최적화**: Grep → Read → Edit
`
};

// 빈 index.json (빈 상태 테스트용)
export const MOCK_EMPTY_INDEX_JSON = {
    files: []
};

// 집계된 통계 데이터 (홈 대시보드용)
export const MOCK_AGGREGATED_STATS = {
    totalDays: 3, // 2026-02-08, 2026-02-09, 2026-02-10
    totalSessions: 240, // 102 + 25 + 45 + 68
    totalToolCalls: 3520, // 1600 + 350 + 680 + 890
    totalProjects: 9, // 중복 제거된 고유 프로젝트 수
    toolUsageAggregated: [
        { toolName: "Read", usageCount: 1004, primaryUse: "코드 탐색 및 분석" },
        { toolName: "Edit", usageCount: 669, primaryUse: "파일 수정" },
        { toolName: "Write", usageCount: 524, primaryUse: "새 파일 생성" },
        { toolName: "Bash", usageCount: 382, primaryUse: "Git, npm, 테스트 실행" },
        { toolName: "Grep", usageCount: 259, primaryUse: "코드베이스 검색" }
    ],
    taskTypeAggregated: [
        { type: "Coding", count: 188, description: "컴포넌트 개발, 페이지 생성, 기능 구현" },
        { type: "Refactoring", count: 28, description: "코드 구조 개선, 타입 정리, 성능 최적화" },
        { type: "Planning", count: 13, description: "아키텍처 설계, 명세서 작성" },
        { type: "Content Creation", count: 8, description: "문서 작성" },
        { type: "Debugging", count: 3, description: "버그 수정, 테스트 실패 분석" }
    ],
    weeklyTrend: [
        {
            date: "2026-02-08",
            reportCount: 2,
            sessions: 127, // 102 + 25
            toolCalls: 1950 // 1600 + 350
        },
        {
            date: "2026-02-09",
            reportCount: 1,
            sessions: 45,
            toolCalls: 680
        },
        {
            date: "2026-02-10",
            reportCount: 1,
            sessions: 68,
            toolCalls: 890
        }
    ]
};

// API 응답 래퍼
export interface ApiResponse<T> {
    status: number;
    data: T;
}

// 제네릭 응답 래퍼 헬퍼
export const wrapResponse = <T>(data: T): string => {
    return JSON.stringify(data);
};
