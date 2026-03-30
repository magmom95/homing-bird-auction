# DESIGN.md — 모의 부동산 경매 예측 이벤트

| 버전 | 날짜 | 모델 | 변경 내용 |
|------|------|------|----------|
| v1.0 | 2026-03-30 | Sonnet | 최초 설계 문서 작성 |
| v1.1 | 2026-03-30 | Opus | DESIGN.md를 실제 구현 구조에 맞게 정정 (Next.js 버전, 파일 구조) |

---

## 1. 기술 스택

| 구분 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | Next.js 16 (App Router, Turbopack) | Vercel 최적화, SSR/API Routes 일체형 |
| 언어 | TypeScript | 타입 안정성 |
| 스타일 | Tailwind CSS v4 | 빠른 UI 구현 |
| DB | Supabase (PostgreSQL) | Vercel 배포 환경에서 무료 호스팅 가능, Row Level Security 지원 |
| 이미지 업로드 | Supabase Storage | DB와 동일 플랫폼 통합 |
| 배포 | Vercel | SPEC 요구사항 |

---

## 2. 프로젝트 구조

```
Homing-Bird-Auction/
├── app/
│   ├── page.tsx                  # 사용자 메인 페이지 (경매 공고 + 예측 입력 + 결과 인라인 표시)
│   ├── layout.tsx                # 루트 레이아웃
│   ├── globals.css               # 전역 스타일
│   ├── admin/
│   │   ├── page.tsx              # 관리자 비밀번호 입력 페이지
│   │   └── dashboard/page.tsx    # 관리자 대시보드 (경매 등록/수정 폼 포함)
│   └── api/
│       ├── auction/route.ts      # GET: 현재 경매 조회 / POST: 경매 등록 (관리자)
│       ├── auction/[id]/route.ts # PUT: 경매 수정 (관리자)
│       ├── prediction/route.ts   # POST: 예측 제출 / GET: 입찰 데이터 조회 (관리자)
│       └── result/route.ts       # GET: 결과 조회 (당일 공개 제어)
├── components/
│   ├── AuctionNotice.tsx         # 경매 공고문 UI 컴포넌트
│   ├── PredictionForm.tsx        # 예측 입력 폼
│   ├── ResultBoard.tsx           # TOP3 결과 표시
│   └── WinnerModal.tsx           # 1등 축하 모달
├── lib/
│   ├── supabase.ts               # Supabase 클라이언트 (createAdminClient, createBrowserClient)
│   └── utils.ts                  # 금액 포맷, 날짜 유틸
├── types/
│   └── index.ts                  # AuctionItem, Prediction, PredictionWithDiff 타입 정의
└── ...
```

> **참고**: 결과 확인 페이지는 별도 라우트(`/result`) 없이 메인 페이지(`/`)에서 인라인 렌더링한다. 관리자 폼도 별도 컴포넌트(`AdminForm.tsx`) 없이 대시보드 페이지에 직접 구현되어 있다.

---

## 3. 데이터베이스 스키마 (Supabase)

### 3.1 auctions 테이블

```sql
create table auctions (
  id            uuid primary key default gen_random_uuid(),
  case_number   text not null,
  title         text not null,
  address       text not null,
  image_url     text,
  appraisal_price    bigint not null,
  minimum_bid_price  bigint not null,
  deposit_amount     bigint generated always as (minimum_bid_price / 10) stored,
  end_at        timestamptz not null,
  detail_url    text,
  status        text not null default 'open' check (status in ('open', 'closed')),
  actual_price  bigint,
  result_date   date,
  result_open   boolean not null default false,
  created_at    timestamptz default now()
);
```

### 3.2 predictions 테이블

```sql
create table predictions (
  id              uuid primary key default gen_random_uuid(),
  auction_id      uuid references auctions(id),
  email           text not null,
  nickname        text,
  predicted_price bigint not null,
  created_at      timestamptz default now(),
  unique(auction_id, email)  -- 1인 1회 제한
);
```

---

## 4. 주요 로직

### 4.1 결과 공개 제어

```ts
// GET /api/result
const today = new Date().toISOString().split('T')[0]
const isResultVisible = auction.result_open && auction.result_date === today
```

- `result_open`: 관리자가 수동으로 켜는 스위치
- `result_date`: 결과 공개 날짜 (당일만 노출)
- 두 조건 모두 충족 시에만 TOP3 데이터 반환

### 4.2 결과 계산

```ts
predictions
  .map(p => ({ ...p, diff: Math.abs(p.predicted_price - auction.actual_price) }))
  .sort((a, b) => a.diff - b.diff)
  .slice(0, 3)
```

### 4.3 1인 1회 제한

- `predictions` 테이블의 `unique(auction_id, email)` 제약으로 DB 레벨에서 강제
- 프론트에서는 제출 후 localStorage에 참여 여부 저장 → 폼 비활성화 처리

### 4.4 관리자 인증

- 환경변수 `ADMIN_PASSWORD`와 입력값 비교
- 일치 시 `sessionStorage`에 플래그 저장 (새로고침 유지, 탭 종료 시 소멸)
- Next.js API Route에서 요청 시 `x-admin-password` 헤더로 검증

---

## 5. 페이지별 동작

### 5.1 메인 페이지 (`/`)

1. 클라이언트에서 `/api/auction`으로 현재 경매 1건 조회
2. `AuctionNotice` 컴포넌트로 공고문 렌더링
3. `status === 'open'` 이고 마감 전이면 `PredictionForm` 표시
4. 결과 공개 조건 충족 시 `ResultBoard` + `WinnerModal` 인라인 표시

### 5.2 관리자 페이지 (`/admin/dashboard`)

1. `/admin` 에서 비밀번호 입력
2. 통과 시 대시보드로 이동
3. 경매 등록/수정, 이미지 업로드, 결과 공개 토글
4. 참여 현황 조회

---

## 6. 환경변수

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # 관리자 API에서 사용
ADMIN_PASSWORD=0623
```

---

## 7. 배포

- Vercel에 GitHub 연동 배포
- Supabase 프로젝트는 별도 생성 후 환경변수 설정
