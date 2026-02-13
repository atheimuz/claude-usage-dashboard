# E2E Tests (Playwright)

## 디렉토리 구조

```
tests/
├── claude-usage-dashboard/   # 기능별 테스트 스펙
│   ├── home.spec.ts          # 홈 대시보드 (10개 시나리오)
│   ├── daily-list.spec.ts    # 일지 목록 (기존 유지)
│   ├── daily-detail.spec.ts  # 일지 상세 (17개 시나리오)
│   └── common.spec.ts        # 공통 기능 (네비게이션, 다크모드, 반응형)
├── page-objects/             # Page Object 클래스
│   ├── base.page.ts          # BasePage (navigate, waitForPageLoad, waitForSelector)
│   ├── home.page.ts
│   ├── daily-list.page.ts
│   └── daily-detail.page.ts
└── mocks/
    └── claude-usage-dashboard.mock.ts
```

## 테스트 작성 컨벤션

- **테스트명**: 한글, "~해야 한다" 또는 "~할 수 있다" 형식
- **구조**: `test.describe("섹션명 - 사용자 시나리오")` > `test.beforeEach` > `test("테스트명")`
- **패턴**: Given-When-Then 시나리오 패턴 사용
- **셀렉터**: `getByRole()` / `getByText()` 우선, `locator()` 보조

## API 인터셉트 패턴 (beforeEach)

```ts
test.beforeEach(async ({ page }) => {
    await page.route("**/data/index.json", (route) =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: wrapResponse(MOCK_INDEX_JSON)
        })
    );

    for (const [filename, content] of Object.entries(MOCK_MARKDOWN_FILES)) {
        await page.route(`**/data/${filename}.md`, (route) =>
            route.fulfill({
                status: 200,
                contentType: "text/markdown",
                body: content
            })
        );
    }
});
```

## Page Object 패턴

- `BasePage` 상속, Locator를 `readonly` 프로퍼티로 constructor에서 정의
- 헬퍼 메서드: `expect~Visible()`, `click~()`, `get~()`, `navigateTo~()`

## 목업 데이터 (mocks/)

| Export | 용도 |
|--------|------|
| `MOCK_INDEX_JSON` | 4개 파일 항목 (3일, work/side) |
| `MOCK_MARKDOWN_FILES` | 마크다운 원본 4개 (key: `"work/2026-02-08"` 등) |
| `MOCK_AGGREGATED_STATS` | 집계 통계 참고용 |
| `MOCK_EMPTY_INDEX_JSON` | 빈 상태 테스트용 |
| `wrapResponse(data)` | `JSON.stringify` 래퍼 |

## 상태별 테스트 패턴

- **로딩**: `page.context().newPage()` + route에 `setTimeout` 지연
- **에러**: `route.abort("failed")` 또는 `status: 500`
- **빈 상태**: `MOCK_EMPTY_INDEX_JSON` 사용

## 새 테스트 추가 시

1. `page-objects/`에 Page Object 클래스 생성 (BasePage 상속)
2. `claude-usage-dashboard/`에 `<feature>.spec.ts` 생성
3. 필요한 목업 데이터를 `mocks/claude-usage-dashboard.mock.ts`에 추가
4. `beforeEach`에서 API 인터셉트 설정 (위 패턴 복사)
5. Given-When-Then 시나리오 패턴으로 테스트 작성
