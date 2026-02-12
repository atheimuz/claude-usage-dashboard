# Claude Usage Dashboard E2E Tests

이 디렉토리는 Claude Usage Dashboard의 E2E 테스트를 포함합니다.

## 디렉토리 구조

```
tests/
├── claude-usage-dashboard/     # 기능별 테스트 스펙
│   ├── home.spec.ts            # 홈 대시보드 테스트
│   ├── daily-list.spec.ts      # 일지 목록 페이지 테스트
│   ├── daily-detail.spec.ts    # 일지 상세 페이지 테스트
│   ├── common.spec.ts          # 공통 기능 테스트
│   └── data-fetching.spec.ts   # 데이터 Fetching 테스트
├── page-objects/               # Page Object 클래스
│   ├── base.page.ts            # BasePage 클래스
│   ├── home.page.ts            # HomePage 클래스
│   ├── daily-list.page.ts      # DailyListPage 클래스
│   └── daily-detail.page.ts    # DailyDetailPage 클래스
├── mocks/                      # 목업 데이터
│   └── claude-usage-dashboard.mock.ts
└── README.md
```

## 테스트 실행

### 전체 테스트 실행

```bash
npx playwright test
```

### 특정 파일 실행

```bash
# 홈 대시보드 테스트
npx playwright test tests/claude-usage-dashboard/home.spec.ts

# 일지 목록 테스트
npx playwright test tests/claude-usage-dashboard/daily-list.spec.ts

# 일지 상세 테스트
npx playwright test tests/claude-usage-dashboard/daily-detail.spec.ts

# 공통 기능 테스트
npx playwright test tests/claude-usage-dashboard/common.spec.ts

# 데이터 Fetching 테스트
npx playwright test tests/claude-usage-dashboard/data-fetching.spec.ts
```

### 특정 테스트 실행 (grep)

```bash
# 특정 테스트 케이스만 실행
npx playwright test --grep "홈 페이지에 접속하면 헤더가 표시되어야 한다"

# 특정 describe 블록 실행
npx playwright test --grep "페이지 로드 및 레이아웃"
```

### UI 모드 (디버깅)

```bash
npx playwright test --ui
```

### Headed 모드 (브라우저 보기)

```bash
npx playwright test --headed
```

### 특정 브라우저만 실행

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## 테스트 우선순위

### High Priority (Phase 1)
- 일지 상세 페이지 전체 (daily-detail.spec.ts)
- 일지 목록 페이지 리스트 뷰 (daily-list.spec.ts)
- 데이터 Fetching (data-fetching.spec.ts)

### Medium Priority (Phase 2)
- 홈 대시보드 통계 카드 (home.spec.ts)
- 홈 대시보드 차트 (home.spec.ts)

### Low Priority (Phase 3)
- 달력 뷰 (daily-list.spec.ts)
- 다크 모드 (common.spec.ts)
- 반응형 (common.spec.ts)

## 목업 데이터

모든 테스트는 `tests/mocks/claude-usage-dashboard.mock.ts`의 목업 데이터를 사용합니다.

### 목업 데이터 구조

- **MOCK_INDEX_JSON**: 파일 목록 (`/data/index.json`)
- **MOCK_MARKDOWN_FILES**: 마크다운 파일 내용 (`/data/*.md`)
- **MOCK_EMPTY_INDEX_JSON**: 빈 파일 목록 (빈 상태 테스트용)
- **MOCK_AGGREGATED_STATS**: 집계된 통계 데이터 (홈 대시보드용)

### API 인터셉트

모든 테스트는 Playwright의 `page.route()`를 사용하여 API 호출을 인터셉트하고 목업 데이터를 반환합니다.

```typescript
await page.route("**/data/index.json", (route) =>
    route.fulfill({
        status: 200,
        contentType: "application/json",
        body: wrapResponse(MOCK_INDEX_JSON)
    })
);

await page.route("**/data/2026-02-08-work.md", (route) =>
    route.fulfill({
        status: 200,
        contentType: "text/markdown",
        body: MOCK_MARKDOWN_FILES["2026-02-08-work"]
    })
);
```

## Page Object 패턴

모든 테스트는 Page Object 패턴을 따릅니다.

### BasePage

모든 Page Object의 기본 클래스입니다.

```typescript
export class BasePage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async navigate(path: string) {
        await this.page.goto(path);
    }

    async waitForPageLoad() {
        await this.page.waitForLoadState("networkidle");
    }
}
```

### Page Object 사용 예시

```typescript
test("홈 페이지에 접속하면 헤더가 표시되어야 한다", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigateToHome();
    await homePage.expectHeaderVisible();
});
```

## Locator 전략 (우선순위)

1. `getByRole()` - 접근성 기반 (가장 권장)
2. `getByLabel()` - 폼 요소
3. `getByText()` - 텍스트 내용
4. `locator()` with `data-*` attributes - 테스트 전용 속성
5. `locator()` with CSS selectors - 최후 수단

## 테스트 시나리오 문서

전체 테스트 시나리오는 `specs/claude-usage-dashboard/test-scenarios.md`를 참고하세요.

## 주의사항

1. **목업 데이터 필수**: 실제 API 존재 여부와 관계없이 항상 목업 데이터를 사용합니다.
2. **API 인터셉트**: `page.route()`를 사용하여 모든 API 호출을 인터셉트합니다.
3. **테스트 독립성**: 각 테스트는 독립적으로 실행 가능해야 합니다.
4. **이모지 금지**: UI에서 이모지 대신 lucide-react 아이콘을 사용합니다.
5. **한글 테스트명**: 테스트명은 한글로 작성하고 "~해야 한다" 형식을 따릅니다.

## 추가 리소스

- [Playwright 공식 문서](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model](https://playwright.dev/docs/pom)
