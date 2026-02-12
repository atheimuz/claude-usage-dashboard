---
name: md-to-json
description: |
  마크다운 일지 파일을 JSON으로 변환하는 스킬.
  public/data/ 내 MD 파일을 파싱하여 DailyReport JSON을 생성하고 index.json을 업데이트한다.

  트리거 키워드:
  - /md-to-json
  - "마크다운 변환", "MD 변환", "JSON 변환"
  - "데이터 변환", "일지 변환"
---

# MD → JSON 변환 Skill

마크다운 일지 파일(`public/data/{location}/*.md`)을 DailyReport JSON 파일로 변환한다.

## 워크플로우

### 1단계: 변환 범위 확인

AskUserQuestion으로 변환 범위를 확인한다.

```yaml
questions:
  - question: "어떤 파일을 변환할까요?"
    header: "변환 범위"
    multiSelect: false
    options:
      - label: "전체 파일"
        description: "모든 MD 파일을 JSON으로 변환합니다."
      - label: "특정 파일"
        description: "특정 MD 파일만 변환합니다."
```

### 2단계: 변환 실행

Bash로 변환 스크립트를 실행한다.

**전체 파일 변환:**
```bash
npm run md-to-json
```

**특정 파일만 변환 시:**
사용자가 지정한 파일의 MD를 직접 읽고 `scripts/parser.ts`의 `parseDailyReport()`로 파싱한 후 JSON으로 저장한다.

### 3단계: 결과 확인

변환된 파일 수와 실패 여부를 보고한다.
`public/data/index.json`이 올바르게 업데이트되었는지 확인한다.

## 파일 구조

```
scripts/
├── md-to-json.ts    # 변환 스크립트 (진입점)
└── parser.ts        # MD → DailyReport 파서

public/data/
├── index.json       # 파일 목록 (.json 참조)
├── work/*.md        # 원본 마크다운 (유지)
├── work/*.json      # 변환된 JSON (앱에서 소비)
├── side/*.md
└── side/*.json
```

## 새 일지 추가 시

1. `public/data/{location}/YYYY-MM-DD.md` 파일 작성
2. `public/data/index.json`의 files 배열에 MD 항목 추가: `{ "name": "YYYY-MM-DD.md", "location": "work" }`
3. `/md-to-json` 실행
4. 스크립트가 자동으로 `.md` → `.json` 변환 및 index.json 업데이트
