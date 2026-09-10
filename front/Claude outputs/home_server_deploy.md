# 먹세편살 홈서버 이식 가이드

전제: 홈서버에 저장소 clone 완료, Docker/Compose 설치 완료, cloudflared 이미 운영 중 (다른 프로젝트도 같이 돌아가는 상태 — 그래서 3306 포트가 이미 다른 프로젝트에서 사용 중).

아래 순서대로 진행하면 됨. "(맥)"이라고 써진 건 네 맥 터미널에서, "(홈서버)"는 홈서버 SSH 접속해서 실행.

---

## 0. (맥) 정리된 코드 push

git push가 아직 성공 안 했으면 먼저:

```bash
cd ~/coding/Projects/MeokSe_PyeonSal
git status
git push origin main
```

Push protection 에러 없이 올라가는지 확인. (아까 문제된 커밋은 이미 로컬에서 amend로 정리해놨음.)

---

## 1. (홈서버) 최신 코드 pull

```bash
cd <홈서버의 저장소 경로>
git pull origin main
```

---

## 2. (홈서버) 포트 확인

기존에 떠있는 컨테이너/서비스가 쓰는 포트 확인해서 8082(백엔드), 3000(프론트) 비어있는지 체크:

```bash
sudo lsof -i -P -n | grep LISTEN
```

겹치면 아래 설정에서 왼쪽 호스트 포트 숫자만 바꾸면 됨 (오른쪽 컨테이너 내부 포트는 건드리지 말 것).

DB(3306)는 이미 다른 프로젝트가 쓰고 있는데, `prep/load.py`로 계속 메뉴 데이터를 추가하려면 DB에 외부에서 접속할 방법이 있어야 함. 그래서 **포트 번호만 다르게(3307), 루프백(127.0.0.1)에만 바인딩**해서 연다 — 인터넷/LAN에는 안 열리고, 홈서버 자기 자신에서만 접속 가능. 3306과 포트가 다르니 충돌도 없음.

---

## 3. (홈서버) 루트 `docker-compose.yml` 수정

`db` 서비스에서 `ports:` 섹션 통째로 제거(또는 주석 처리):

```yaml
  db:
    image: mysql:8.4
    container_name: msps-mysql
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
    volumes:
      - msps-mysql-data:/var/lib/mysql
      - ./docker/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 5s
      timeout: 5s
      retries: 10
    restart: unless-stopped
    ports:
      - "127.0.0.1:3307:3306"   # 루프백만 — 외부/LAN 노출 없음, 3306 충돌 회피
```

`backend` 서비스는 그대로 두되 포트 확인:

```yaml
  backend:
    container_name: msps-back
    build:
      context: ./back
    ports:
      - "8082:8082"   # 2번에서 겹치면 왼쪽만 다른 숫자로
    environment:
      SPRING_PROFILES_ACTIVE: prod
      DB_HOST: db
      DB_PORT: 3306
      DB_USER: root
      DB_PASSWORD: ${DB_PASSWORD}
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
      JWT_SECRET: ${JWT_SECRET}
      ALLOWED_EMAILS: ${ALLOWED_EMAILS}
      FRONTEND_BASE_URL: ${FRONTEND_BASE_URL}
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped
```

---

## 4. (홈서버) 루트 `.env` — 운영용 값으로

```
DB_PASSWORD=root
GOOGLE_CLIENT_ID=<맥의 .env에 있는 최신(14로 시작하는) 클라이언트 ID>
GOOGLE_CLIENT_SECRET=<맥의 .env에 있는 최신 시크릿>
ALLOWED_EMAILS=<가족 이메일들>
JWT_SECRET=<맥의 .env에 있는 값 그대로>
FRONTEND_BASE_URL=https://ochangbab.site
```

로컬 테스트 때 `http://localhost:3000`으로 해뒀던 `FRONTEND_BASE_URL`을 실제 도메인으로 바꾸는 게 핵심 — OAuth 로그인 성공 후 리다이렉트가 이 값으로 감.

---

## 5. (홈서버) `front/.env` (또는 compose 실행 시 환경변수)

```
VITE_API_BASE_URL=https://api.ochangbab.site
FRONTEND_PORT=3000
```

프론트는 빌드 시점에 이 주소를 정적 파일에 박아넣으니, 반드시 **실제 배포 도메인**으로 넣어야 함 (localhost 아님).

---

## 6. (홈서버) 빌드 & 기동

```bash
# db + backend
cd <저장소 루트>
docker compose down -v   # 처음 한 번은 DB 스키마 새로 만들어야 하니 -v로 볼륨까지 정리
docker compose up --build -d

# frontend
cd front
docker compose up --build -d
```

`docker ps`로 `msps-mysql`, `msps-back`, `msps-front` 세 개 다 healthy/running 확인.

---

## 7. (Cloudflare 대시보드) 퍼블릭 호스트네임 추가

`/etc/cloudflared/`에 `token`만 있고 `config.yml`이 없다는 건, 이 터널이 로컬 설정 파일이 아니라 **Cloudflare Zero Trust 대시보드에서 원격으로 관리되는 방식**이라는 뜻. ingress 규칙도 파일 대신 대시보드에서 추가하면 됨.

1. https://one.dash.cloudflare.com 접속
2. **Networks → Tunnels** → 지금 쓰고 있는 터널 클릭
3. **Public Hostname** 탭 → **Add a public hostname**을 두 번:

   | Subdomain | Domain | Service |
   |---|---|---|
   | (비워둠) | ochangbab.site | HTTP → `localhost:3000` |
   | api | ochangbab.site | HTTP → `localhost:8082` |

저장하면 DNS 레코드도 자동 생성되고, cloudflared 재시작도 필요 없이 바로 반영됨 (원격 관리형이라).

---

## 8. 구글 클라우드 콘솔 — 운영 리디렉션 URI 추가

승인된 리디렉션 URI에 추가:

```
https://api.ochangbab.site/login/oauth2/code/google
```

(기존 `http://localhost:8082/...`는 로컬 테스트용으로 남겨둬도 됨.)

---

## 9. 백엔드 CORS 허용 origin 확인

`WebConfig` 또는 `SecurityConfig`의 CORS 허용 origin 목록에 `https://ochangbab.site` 추가돼 있는지 확인 (로컬 개발용 origin들과 나란히).

---

## 10. (맥) 데이터 이전 — msps_prod 덤프 떠서 홈서버로

맥에 있는 로컬 도커 MySQL에서 운영 데이터 통째로 덤프:

```bash
docker exec msps-mysql mysqldump -uroot -proot --databases msps_prod > ~/msps_prod_dump.sql
```

이 파일을 홈서버로 옮기고 (scp, USB, 네가 평소 쓰는 방법 아무거나):

```bash
scp ~/msps_prod_dump.sql <홈서버계정>@<홈서버주소>:~/
```

홈서버에서 복원:

```bash
docker exec -i msps-mysql mysql -uroot -proot < ~/msps_prod_dump.sql
```

---

## 11. 앞으로 홈서버 DB에 메뉴 추가할 때 (load.py)

홈서버에 파이썬 venv 새로 깔 필요 없이, **맥에 이미 있는 venv/의존성을 그대로 쓰고 DB 연결만 SSH 터널로 이어줌**.

`prep/.env`는 로컬 테스트 때 값이랑 동일하게 그대로 두면 됨:
```
DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=root
DB_NAME=msps_prod
```

실행할 때마다:

```bash
# 1. 터널을 백그라운드로 띄움 (터미널 하나 계속 붙잡고 있을 필요 없음)
ssh -f -N -L 3307:localhost:3307 <홈서버계정>@<홈서버주소>

# 2. 평소처럼 맥에서 load.py 실행 (venv, 의존성 그대로)
cd prep
python load.py data/extracted/<파일명>.json

# 3. 끝나면 터널 종료
ssh -O exit -L 3307:localhost:3307 <홈서버계정>@<홈서버주소>
```

터널이 열려있는 동안만 맥의 `localhost:3307`이 홈서버의 `127.0.0.1:3307`(MySQL)로 이어지고, 끝나면 바로 닫히니까 평소엔 DB가 계속 잠겨있는 상태 그대로임.

---

## 12. 최종 확인

- `https://ochangbab.site` 접속 → 로그인 화면 뜨는지
- 구글 로그인 → 정상적으로 메인으로 리다이렉트되는지
- 메뉴 목록/상세/즐겨찾기/재료 체크 다 정상 작동하는지
- 브라우저 개발자도구 Network 탭에서 API 요청이 `https://api.ochangbab.site`로 가는지, `Authorization: Bearer` 헤더 붙는지

---

막히는 단계 있으면 그 단계 로그/에러 그대로 붙여넣어줘.
