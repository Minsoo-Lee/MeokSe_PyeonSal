# 사전 작업 스크립트 (유튜브 재생목록 -> DB)

유튜브 쇼츠 재생목록의 영상 설명(description)에서 메뉴/재료/양/레시피를 추출해 정리하는 파이썬 스크립트입니다.
Spring 애플리케이션과는 완전히 분리된, 개발자가 직접 실행하는 일회성/반복 실행 도구입니다.

## 설치

```bash
python -m venv venv
source venv/bin/activate   # Windows는 venv\Scripts\activate
pip install -r requirements.txt
```

## 설정

`.env.example`을 `.env`로 복사하고 값을 채웁니다.

```bash
cp .env.example .env
```

- `PLAYLIST_URL`: 재생목록 URL. 유튜브에서 채널 → 재생목록 탭 → 원하는 재생목록 클릭하면
  주소창에 `https://www.youtube.com/playlist?list=PLxxxxxxxxxxxxxxxxxxxxxxxxxxxx` 형태로
  뜨는데, 이 전체 주소를 그대로 복사해서 넣으면 됩니다. (쇼츠 영상 하나짜리 링크인
  `youtube.com/shorts/...`가 아니라 재생목록 전체 링크여야 합니다.)
- `GEMINI_API_KEY`: https://aistudio.google.com/apikey 에서 구글 계정으로 로그인해서 무료로
  발급 (카드 등록 불필요)
- `DB_*`: 운영 MySQL/MariaDB 접속 정보 (load.py 실행 시에만 필요)

예시:

```
PLAYLIST_URL=https://www.youtube.com/playlist?list=PLxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GEMINI_API_KEY=여기에_발급받은_키
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=비밀번호
DB_NAME=msps_prod
```

## Docker로 MySQL 띄우기

`docker-compose.yml`은 이 `prep` 폴더가 아니라 **레포 루트**에 있습니다 (`prep`, `back` 둘 다
같은 DB를 쓰는 공유 인프라라서 특정 폴더에 종속시키지 않았습니다). 컨테이너 1개 안에
`msps_dev`(개발용) / `msps_prod`(운영용) 두 개의 데이터베이스를 만듭니다. Spring `dev`
프로파일에서 스키마를 매번 새로 만들어도(`ddl-auto=create-drop`) `msps_dev`만 영향받고, 이
스크립트로 수집한 실제 데이터가 들어있는 `msps_prod`는 안전합니다.

레포 루트에서:

```bash
cp .env.example .env   # DB_PASSWORD 채우기 (prep/.env 의 DB_PASSWORD와 같은 값으로)
docker compose up -d
```

- 레포 루트의 `.env`에 있는 `DB_PASSWORD`가 MySQL root 비밀번호로 사용됩니다. `prep/.env`의
  `DB_PASSWORD`와 반드시 같은 값이어야 `load.py`가 접속할 수 있습니다.
- `docker/init.sql`은 컨테이너를 **처음** 띄울 때 한 번만 실행됩니다. 이미 띄운 적이 있는데
  DB가 새로 안 생겼다면, 볼륨을 지우고 다시 띄워야 합니다: `docker compose down -v && docker
  compose up -d` (기존 데이터도 같이 삭제되니 주의).
- 이 파이썬 스크립트(`load.py`)는 항상 `msps_prod`를 바라봅니다 (`prep/.env`의
  `DB_NAME=msps_prod`). Spring `application-dev.yml`은 `msps_dev`를, `application-prod.yml`은
  `msps_prod`를 가리키도록 설정하면 됩니다. 호스트/포트(`localhost:3306`)는 두 프로파일 다
  동일합니다.
- 컨테이너 로그 확인: `docker compose logs -f mysql` / 중지: `docker compose down` (볼륨은 유지되어
  데이터가 남아있습니다).

## 사용법

### 1단계 — 추출 (extract.py)

```bash
python extract.py            # 신규 영상 전체 처리
python extract.py --limit 3  # 테스트로 3개만 처리
```

- `data/processed_videos.json`에 이미 처리한 video_id를 기록해두기 때문에, 재생목록에 영상이
  새로 추가된 뒤 다시 실행해도 신규 영상만 처리합니다.
- 결과는 `data/extracted/extracted_<타임스탬프>.json`에 저장됩니다.
- day를 못 찾았거나 재료가 하나도 안 뽑힌 항목은 `needs_review: true`로 표시됩니다.

### 2단계 — 검수 (사람이 직접)

`data/extracted/extracted_*.json` 파일을 열어서 직접 확인/수정합니다.

- 재료 이름 표기 통일 (예: "대파"/"파" 같은 표기 차이)
- `needs_review: true`인 항목의 day, 재료 확인
- 필요 없는 항목(레시피 아닌 영상 등)은 배열에서 삭제

### 3단계 — 적재 (load.py)

```bash
python load.py data/extracted/extracted_20260821_120000.json
```

- 검수된 JSON을 운영 DB(`.env`의 `DB_*`)에 직접 INSERT 합니다.
  - `menu.day`가 이미 존재하면 건너뜁니다 (덮어쓰지 않음).
  - `ingredient`는 이름 기준으로 중복 제거합니다 (이미 있으면 재사용).
  - `menu_ingredient`는 `INSERT IGNORE`로 넣어서, 같은 스크립트를 다시 돌려도 중복 삽입되지
    않습니다.
- 동시에 방금 실행한 것과 동일한 INSERT문을 `data/exported_<타임스탬프>.sql`로 저장합니다.
  이 파일을 자바 프로젝트의 `src/main/resources/data.sql`로 복사하면, `dev` 프로파일로 앱을
  실행할 때마다 자동으로 같은 데이터가 채워집니다 (해당 프로파일에서 `ddl-auto=create-drop`
  등으로 스키마도 매번 새로 만들도록 설정되어 있다는 전제).
- `needs_review: true`인 항목은 기본적으로 건너뜁니다. 확인 후 강제로 넣으려면 `--force` 옵션을
  사용하세요.

## 전제 조건 / DB 쪽에 미리 걸어둬야 하는 제약

- `menu.day` UNIQUE
- `menu_ingredient (menu_id, ingredient_id)` UNIQUE

이 두 제약이 없으면 스크립트를 여러 번 실행했을 때 중복 데이터가 쌓일 수 있습니다.

## amount_value / amount_unit / amount_text

- `amount_type = EXACT`: `amount_value`(숫자) + `amount_unit`(단위: g, ml, 개, 큰술 등)을 채우고
  `amount_text`는 null.
- `amount_type = APPROX`: `amount_text`(적당량, 약간 등 원문 표현)를 채우고 `amount_value`,
  `amount_unit`은 둘 다 null.

세 컬럼이 서로 배타적으로 채워지도록 추출 스크립트/DB insert 모두 이 규칙을 따릅니다.