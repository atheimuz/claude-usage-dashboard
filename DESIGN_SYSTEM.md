# Design System Guide

Metrix SaaS Dashboard UI Kit 기반의 디자인 시스템 가이드.

## Color Palette

### Primary Colors

| 용도 | Light Mode | Dark Mode | CSS Variable |
|------|-----------|-----------|--------------|
| Primary | `#5570f1` | `#6b82f4` | `--primary` |
| Primary Foreground | `#ffffff` | `#ffffff` | `--primary-foreground` |

### Semantic Colors

| 용도 | Light Mode | Dark Mode | CSS Variable |
|------|-----------|-----------|--------------|
| Success | `#32936f` | `#3da87f` | `--success` |
| Warning | `#fff1e2` | `#8b6914` | `--warning` |
| Destructive | `#f57e76` | `#e86b63` | `--destructive` |

### Neutral Colors

| 용도 | Light Mode | Dark Mode | CSS Variable |
|------|-----------|-----------|--------------|
| Background | `#ffffff` | `#1a1d1f` | `--background` |
| Foreground (Text) | `#2a2f31` | `#f2f4f5` | `--foreground` |
| Muted | `#f2f4f5` | `#2d3234` | `--muted` |
| Muted Foreground | `#83888c` | `#9ca3a7` | `--muted-foreground` |
| Border | `#e8ebed` | `rgba(255,255,255,0.12)` | `--border` |

### Accent Colors

| 용도 | Light Mode | Dark Mode | CSS Variable |
|------|-----------|-----------|--------------|
| Accent | `#eff0f8` | `#2d3654` | `--accent` |
| Accent Foreground | `#5570f1` | `#8fa0f5` | `--accent-foreground` |

## Typography

- **Font Family**: `Inter` (sans-serif)
- **Fallback**: `system-ui, -apple-system, BlinkMacSystemFont, sans-serif`

### Scale

| Name | Size | Weight | Line Height | 용도 |
|------|------|--------|-------------|------|
| xs | 12px | 400 | 16px | 캡션, 보조 텍스트 |
| sm | 14px | 400 | 20px | 본문 소형 |
| base | 16px | 400 | 24px | 본문 기본 |
| lg | 18px | 500 | 28px | 본문 강조 |
| xl | 20px | 600 | 28px | 소제목 |
| 2xl | 24px | 600 | 32px | 제목 |
| 3xl | 30px | 700 | 36px | 페이지 제목 |

## Spacing System

8px 기반 스페이싱 시스템:

| Token | Value | Tailwind |
|-------|-------|----------|
| 1 | 4px | `p-1`, `m-1` |
| 2 | 8px | `p-2`, `m-2` |
| 3 | 12px | `p-3`, `m-3` |
| 4 | 16px | `p-4`, `m-4` |
| 5 | 20px | `p-5`, `m-5` |
| 6 | 24px | `p-6`, `m-6` |
| 8 | 32px | `p-8`, `m-8` |

## Border Radius

| Token | Value | CSS Variable | Tailwind |
|-------|-------|--------------|----------|
| sm | 8px | `--radius-sm` | `rounded-sm` |
| md | 10px | `--radius-md` | `rounded-md` |
| lg | 12px | `--radius-lg` | `rounded-lg` |
| xl | 16px | `--radius-xl` | `rounded-xl` |
| full | 9999px | - | `rounded-full` |

## Component Guidelines

### Button

```tsx
// Primary 액션
<Button variant="default">저장</Button>

// Secondary 액션
<Button variant="secondary">취소</Button>

// 위험한 액션
<Button variant="destructive">삭제</Button>

// 외곽선 스타일
<Button variant="outline">더 보기</Button>

// 투명 배경
<Button variant="ghost">닫기</Button>
```

**Size variants:**
- `xs`: 24px 높이, 작은 인라인 액션
- `sm`: 32px 높이, 컴팩트 UI
- `default`: 36px 높이, 기본
- `lg`: 40px 높이, 강조 액션

### Badge (Status)

Figma의 Status 컴포넌트를 기반으로 한 상태 표시용 Badge.

```tsx
// 기본 (Primary 색상) - 진행 중
<Badge>진행 중</Badge>

// 성공 상태 - 완료
<Badge variant="success">완료</Badge>

// 경고 상태 - 대기 중
<Badge variant="warning">대기</Badge>

// 위험 상태 - 취소, 반품, 손상
<Badge variant="destructive">취소</Badge>

// 중립 상태
<Badge variant="secondary">보류</Badge>

// 외곽선 스타일
<Badge variant="outline">태그</Badge>
```

**Figma Status 매핑:**
| Status | Badge Variant |
|--------|---------------|
| Completed | `success` |
| In-Progress | `default` |
| Pending | `warning` |
| Canceled/Returned/Damaged | `destructive` |

### Input

Figma Input 컴포넌트 기반. 상태별 border 색상이 다름.

| State | Border Color | 설명 |
|-------|--------------|------|
| Default | `#cfd2d4` | 기본 상태 |
| Focus | `#5570f1` (Primary) | 포커스 상태 |
| Filled | `#5e6366` | 값이 입력된 상태 |
| Error | `#f57e76` (Destructive) | 에러 상태 |
| Disabled | `#dce2e5` + bg `#f2f4f5` | 비활성화 |

```tsx
// 기본 입력
<Input placeholder="텍스트 입력" />

// 에러 상태
<Input className="border-destructive" placeholder="에러" />

// 비활성화
<Input disabled placeholder="비활성화" />
```

### Card

Figma Dashboard Summary Card 기반. Border radius 12px, padding 15px.

```tsx
<Card>
  <CardHeader>
    <CardTitle>카드 제목</CardTitle>
    <CardDescription>카드 설명</CardDescription>
  </CardHeader>
  <CardContent>
    {/* 내용 */}
  </CardContent>
  <CardFooter>
    {/* 액션 버튼 */}
  </CardFooter>
</Card>
```

## Icon Guidelines

- **라이브러리**: `lucide-react`
- **크기**:
  - 제목/헤더: `h-5 w-5`
  - 본문/버튼: `h-4 w-4`
  - 소형 인라인: `h-3 w-3`
- **색상**: 텍스트와 동일 (`currentColor`)

```tsx
import { Clock, CheckCircle, AlertTriangle } from "lucide-react"

<Clock className="h-4 w-4" />
```

## Chart Colors

차트에서 사용하는 색상 팔레트:

| Variable | 용도 |
|----------|------|
| `--chart-1` | Primary 데이터 (파란색) |
| `--chart-2` | Success 데이터 (녹색) |
| `--chart-3` | Warning/Error 데이터 (빨간색) |
| `--chart-4` | Secondary 데이터 (노란색) |
| `--chart-5` | Tertiary 데이터 (보라색) |

## Dark Mode

다크 모드는 `<html>` 태그에 `class="dark"`로 적용됩니다.

- 모든 색상은 CSS 변수로 정의되어 자동 전환
- 다크 모드에서 Primary 색상은 약간 밝게 조정
- 배경과 텍스트 대비 유지 (WCAG AA 준수)

## Figma 컴포넌트 목록

Metrix UI Kit에서 제공하는 컴포넌트 (참조용):

### Controls
- **Controls (Tabs)**: 2~4개 탭, 스타일 1/2, 아이콘 위치 옵션
- **Stepper**: 4단계 진행 표시
- **Toggles**: On/Off 토글, 라벨 위치, 설명 옵션
- **Checkbox & Radio**: 체크박스/라디오, 라벨 위치, 설명 옵션

### Forms & Inputs
- **Input**: Text/Number/TextArea/Date, Outline/Filled 스타일, 상태별 (Default/Focus/Filled/Error/Disabled)
- **Select**: 드롭다운 선택, 아이콘 옵션
- **Search**: 검색 입력
- **Password**: 비밀번호 입력
- **Phone Number & Amount**: 전화번호/금액 입력
- **Buttons**: Primary/Green/Danger, Filled/Outline, 3가지 크기

### Navigations
- **sideBar**: 사이드바 네비게이션
- **Top Nav**: 상단 네비게이션 + 브레드크럼

### Components
- **Dashboard Summary Card**: Single/Double/Triple 레이아웃
- **Status**: 상태 Badge (Completed/In-Progress/Pending/Canceled)
- **Order Summary**: 주문 요약 카드
- **barChart**: 막대 차트
- **Filter**: 필터 컴포넌트
- **filterByDate**: 날짜 범위 필터

## 새 컴포넌트 개발 시 체크리스트

1. **CSS 변수 사용**: 하드코딩된 색상 대신 `bg-primary`, `text-foreground` 등 사용
2. **반응형 고려**: 모바일 우선, `sm:`, `md:`, `lg:` breakpoint 활용
3. **다크 모드 테스트**: 라이트/다크 모드 모두에서 확인
4. **접근성**:
   - 충분한 색상 대비
   - 키보드 네비게이션 지원
   - `aria-*` 속성 적절히 사용
5. **일관성**: 기존 컴포넌트와 동일한 패딩, 간격, 폰트 크기 사용
