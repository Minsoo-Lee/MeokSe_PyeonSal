# 먹세편살 (MeokSe-PyeonSal)

가족이 함께 쓰는 식단 관리 앱. 유튜브 쇼츠 재생목록(레시피 영상)에서 메뉴·재료·레시피를 뽑아 DB에 적재해두고, 일별 메뉴 확인 / 재료 모아보기 / 즐겨찾기 / 진행 현황을 웹에서 확인할 수 있다.

- 서비스: https://ochangbab.site
- API: https://api.ochangbab.site

## 주요 기능

- **일별 메뉴**: N일차 메뉴를 카드 형식으로 페이징해서 확인
- **재료 모아보기**: 여러 날짜를 골라서 필요한 재료를 한 번에 합산 (같은 재료가 여러 날 필요하면 한 줄로 합쳐서 표시)
- **즐겨찾기**: 메뉴 카드에서 하트 뱃지로 즐겨찾기 등록/확인
- **홈 화면**: 진행 현황, 다음 메뉴 추천(마지막으로 체크한 날 이후의 미체크 메뉴), 즐겨찾기 미리보기
- **메뉴 썸네일**: 메뉴 상세 페이지에서 원본 영상 썸네일 이미지 확인 (자체 서버에 저장해서 직접 서빙)
- **구글 로그인**: OAuth2 + JWT, 이메일 화이트리스트 기반으로 가족 계정만 접근 허용
- **업데이트 알림**: 새 버전이 배포되면 로그인 시 이번 업데이트 내용을 모달로 안내 (유저별로 한 번만 노출)

## 기술 스택

**프론트 (`front/`)**
- React 19 (함수형 컴포넌트 + Hooks, TypeScript 미사용)
- Vite, react-router-dom v7, Tailwind CSS v4

**백엔드 (`back/`)**
- Spring Boot (Gradle)
- Spring Security + OAuth2 Client (구글 로그인)
- JJWT 0.12.x (JWT 발급/검증)
- Spring Data JPA + Hibernate, MySQL, Lombok

**데이터 적재 파이프라인 (`prep/`)**
- Python + yt-dlp + Gemini API (영상 정보/레시피 추출)
- pymysql (DB 적재), requests (썸네일 다운로드)

**인프라**
- Docker Compose (DB + 백엔드 / 프론트 각각 별도 compose)
- nginx (프론트 정적 파일 서빙 + 썸네일 이미지 서빙)
- Cloudflare Tunnel (홈 서버 배포)

## 프로젝트 구조

```
MeokSe_PyeonSal/
├── back/                 # Spring Boot 백엔드
├── front/                # React 프론트엔드 (자체 docker-compose.yml 보유)
├── prep/                 # 유튜브 → DB 데이터 적재 파이프라인 (Python, 별도 실행)
├── docker/
│   ├── init.sql          # DB 스키마 (msps_dev / msps_prod 둘 다 생성)
│   └── thumbnails/       # prep이 받아온 메뉴 썸네일 이미지 (git 추적 안 함)
├── docker-compose.yml    # DB + 백엔드
└── CHANGELOG.md
```

## 로컬 개발 환경 세팅

### 1. DB 띄우기

레포 루트에서 `.env`를 만들어 `DB_PASSWORD`를 채운 뒤:

```bash
docker compose up -d
```

컨테이너 하나 안에 `msps_dev`(개발용)와 `msps_prod`(운영용) 두 DB가 함께 생성된다. `docker/init.sql`은 컨테이너를 처음 띄울 때 한 번만 실행되므로, 스키마를 다시 만들어야 하면 `docker compose down -v && docker compose up -d`로 볼륨을 지우고 재생성해야 한다.

### 2. 백엔드 (`back/`)

`SPRING_PROFILES_ACTIVE=dev`로 실행. `application-dev.yml`은 `msps_dev`를 바라보고, 앱을 켤 때마다 스키마를 새로 만들며 `resources/data.sql`(있다면)을 자동 로드한다. 실행에 필요한 환경변수:

```
DB_HOST=localhost
DB_PORT=3306(또는 docker-compose에서 연 포트)
DB_USER=root
DB_PASSWORD=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
JWT_SECRET=...            # 32바이트 이상 랜덤 값
ALLOWED_EMAILS=...        # 콤마로 구분한 허용 이메일 목록
FRONTEND_BASE_URL=http://localhost:5173
```

### 3. 프론트 (`front/`)

```bash
cp .env.example .env   # VITE_API_BASE_URL을 로컬 백엔드 주소로
npm install
npm run dev
```

### 4. 데이터 적재 파이프라인 (`prep/`, 선택)

메뉴를 새로 추가하거나 기존 메뉴의 썸네일을 받아올 때만 필요. 자세한 사용법은 [`prep/README.md`](./prep/README.md) 참고.

```bash
cd prep
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # PLAYLIST_URL, GEMINI_API_KEY, DB_* 채우기

python extract.py                              # 1) 재생목록 → JSON
# data/extracted/*.json 검수 후
python load.py data/extracted/<파일명>.json     # 2) DB 적재 (+ 썸네일 다운로드)
python backfill_thumbnails.py                   # 이미 적재된 메뉴의 썸네일만 다시 받고 싶을 때
```

## 배포

홈 서버 + Docker Compose + Cloudflare Tunnel 조합으로 배포한다. 포트/인증/도메인 연결 등 상세 절차는 Notion 기술 문서의 "홈 서버 이식 가이드" / "메뉴 썸네일 파이프라인" 섹션에 정리되어 있다.

간단히:

1. 로컬에서 정리한 코드를 push → 홈 서버에서 pull
2. `docker compose up --build -d` (루트, `front/` 각각)
3. 메뉴/썸네일을 새로 추가했다면, `prep/`으로 로컬에서 데이터를 만든 뒤 DB 덤프 또는 `docker/thumbnails/`를 홈 서버로 옮겨 반영

## 버전 관리

- 변경 이력은 [`CHANGELOG.md`](./CHANGELOG.md)에 기록한다.
- 버전 표기는 `MAJOR.MINOR.PATCH`:
  - **MAJOR**: 기존 사용법이 깨지는 큰 변경 (DB 스키마 전면 교체 등)
  - **MINOR**: 기존 기능은 그대로 두고 새 기능 추가
  - **PATCH**: 기능 추가 없이 버그만 수정
