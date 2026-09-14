# 먹세편살 트러블슈팅 로그

배포 과정에서 겪은 문제들을 증상 → 원인 → 해결 순으로 정리. 나중에 비슷한 증상 겪으면 검색해서 바로 찾아보는 용도. (단순 실수를 되돌린 것이거나, 원인이 전적으로 안내 실수였던 항목은 제외했음.)

---

# DB 데이터 적재

## 1. day=0 메뉴(만능양념장)만 재료가 하나도 안 뜸
*`load.py`로 데이터 넣었는데, day=0(만능양념장)만 상세 페이지에서 재료 목록이 텅 빔. 다른 메뉴는 정상.*

**원인**: `menu_id`를 `day`값 그대로 넣는데(`day=0`인 메뉴도 있음), MySQL은 `AUTO_INCREMENT` 컬럼에 **명시적으로 0을 넣으면 NULL과 동일하게 취급**해서 자동 채번해버림 (세션에 `NO_AUTO_VALUE_ON_ZERO`가 안 걸려있으면). 그러면 실제 저장된 `menu_id`는 0이 아닌 다른 값인데, 코드는 여전히 `menu_id = day = 0`이라고 믿고 `menu_ingredient`를 연결해서 — 존재하지도 않는 `menu_id=0`에 재료들이 매달림.

**해결**: `load.py`의 `get_connection()`에서 접속 직후 세션 sql_mode에 옵션 추가.
```python
with conn.cursor() as cur:
    cur.execute("SET SESSION sql_mode = CONCAT(@@sql_mode, ',NO_AUTO_VALUE_ON_ZERO')")
```
이미 잘못 들어간 기존 행은 `UPDATE menu_ingredient SET menu_id = <실제ID> WHERE menu_id = 0;`으로 수동 보정. (dev/prod 스키마가 같은 MySQL 서버에 같이 있어서, `UPDATE` 전에 `SELECT DATABASE();`로 지금 어느 스키마에 붙어있는지 꼭 확인.)

---

## 2. `load.py`가 `ConnectionRefusedError: localhost:3306`
*도커로 다 옮기고 나서 `python load.py ...` 실행하면 DB 연결 자체가 거부됨.*

**원인**: 보안 목적으로 `db` 서비스의 호스트 포트 publish(`ports:`)를 꺼놨었는데, `load.py`는 **도커 밖(맥 자체)**에서 돌아가는 스크립트라 컨테이너 내부 네트워크에 못 들어가고, 호스트에 열린 포트가 있어야만 접속 가능.

**해결**: `db` 서비스에 `ports: "3307:3306"` 다시 추가(3306은 다른 로컬 서비스와 충돌 가능성 있어서 3307로), `prep/.env`의 `DB_PORT`도 3307로 맞춤.

---

# 배포 인프라 설정

## 1. Git Push Protection — `front/Claude outputs/env`에 실제 API 키 커밋됨
*`git push origin main`이 GitHub Push Protection에 막힘 — "GCP API Key Bound to a Service Account" 감지.*

**원인 조사**: 문제의 파일은 `front/Claude outputs/env`. 커밋 히스토리 확인 결과, 이 파일을 추가한 커밋은 **전혀 관계없는 다른 변경사항**("docker-compose db 포트 수정")을 커밋하면서 `git add`를 넓게 잡는 바람에 같이 딸려 들어간 것으로 확인됨(커밋 메시지와 무관한 파일). 내용은 `prep/.env`와 완전히 동일한 복사본. `.gitignore`는 `.env`(점 있음)만 막고 있었지, 점 없는 `env`라는 이름은 패턴에 안 걸려서 무방비였음.

**해결**:
1. 해당 커밋이 아직 원격에 push된 적 없음을 `git branch -r --contains <커밋>`으로 확인 (로컬 전용이라 히스토리 재작성이 안전).
2. `git commit --amend`로 그 파일만 제거하고 원래 의도했던 변경사항만 남김.
3. `git log --all -p`로 실제 키 값이 히스토리 어디에도 안 남아있는 것 확인.
4. `.gitignore`에 안전장치 추가:
   ```
   **/env
   **/*secrets*
   **/*credentials*
   ```
5. 노출된 걸로 간주하고 Gemini API 키 재발급.

**교훈**: 커밋하기 전 `git status`/`git diff --stat`로 의도한 파일만 올라가는지 확인하는 습관. `.gitignore`는 `.env`뿐 아니라 확장자/점 없는 변형까지 넉넉하게 잡아두기.

---

## 2. Cloudflare 대시보드에서 라우트 추가하는 탭을 못 찾음
*`/etc/cloudflared/`에 `config.yml` 없이 `token`만 있음 → 로컬 설정 파일 방식이 아니라 대시보드 원격 관리형 터널. 근데 "Public Hostname"이나 "Hostname routes" 탭엔 아무것도 없고, 기존에 쓰던 다른 프로젝트(`chatshire.site`) 라우트도 안 보임.*

**원인**: Cloudflare가 UI 이름을 바꿔서, 실제 "도메인 → 로컬 포트" 매핑을 관리하는 곳은 **"Published application routes"** 탭이었음. "Hostname routes"/"CIDR routes"는 WARP 사설망(Private Network) 기능이라 완전히 다른 용도.

**해결**: Tunnels & Mesh → 터널 선택 → **Published application routes** 탭 → Add a published application route (Path는 비워둠). 이 과정에서 추가로 겪은 것들:
- Path 필드에 `*`를 직접 입력하면 `invalid regex` 에러 (정규식으로 해석됨) → 그냥 비워두면 "전체 경로" 처리.
- "A DNS record with this name already exists" — 이전 시도에서 DNS 레코드(Type: Tunnel)만 반쪽으로 생성되고 라우트 저장은 실패한 상태였음 → DNS → Records에서 그 레코드 삭제 후 라우트 추가를 처음부터 재시도.
- "Could not route to /zones/undefined/dns_records" — 대시보드 자체의 일시적 글리치, 새로고침 후 재시도로 해결.

---

# 구글 로그인 연동

## 1. 구글 로그인 계속 401 / redirect_uri_mismatch — 진짜 원인은 포트였음
*로컬 도커로 전환 후 구글 로그인이 실패. 처음엔 401, 다음엔 구글의 `redirect_uri_mismatch` 에러. `.env`에 새 클라이언트 ID로 바꿔놨는데도 계속 예전 클라이언트 ID로 요청이 나감 — `docker exec msps-back env`로 확인해도 컨테이너엔 새 값이 정확히 들어있는데도.*

**원인**: 루트 `docker-compose.yml`의 `backend` 서비스가 템플릿 그대로 `ports: "8080:8080"`으로 남아있었는데, 실제 앱은 `server.port: 8082`. 즉 8082번 포트가 호스트에 전혀 publish되지 않고 있었고, 테스트할 때마다 우연히 로컬에 떠있던 (도커와 무관한) 예전 프로세스를 계속 두드리고 있었던 것 — 컨테이너의 최신 설정은 단 한 번도 실제로 테스트되지 않았음.

**해결**: `ports: "8082:8082"`로 수정, 혹시 남아있는 프로세스는 `lsof -i :8082`로 확인 후 종료, `docker compose up -d --force-recreate backend`.

**교훈**: 포트가 안 맞으면 온갖 곳(OAuth 설정, 캐싱, 브라우저)을 의심하기 전에 **`ports:` 매핑과 `server.port`가 실제로 일치하는지부터** 확인.

---

## 2. 운영 도메인에서 `redirect_uri_mismatch` — 이번엔 http vs https
*홈서버 배포 후 `https://ochangbab.site`에서 구글 로그인 시도하면 다시 `redirect_uri_mismatch`. 구글 콘솔엔 `https://api.ochangbab.site/login/oauth2/code/google`로 정확히 등록해놨는데도.*

**원인**: Cloudflare Tunnel은 **사용자↔Cloudflare 엣지 구간은 HTTPS**, **엣지↔백엔드(홈서버 내부) 구간은 평범한 HTTP**로 전달함. Spring Security는 기본적으로 "지금 들어온 요청의 scheme"을 기준으로 `redirect_uri`를 생성하는데, 내부 구간이 http라서 실제로는 `http://api.ochangbab.site/...`를 만들어서 구글로 보내고 있었음.

**해결**: `application.yml`에 추가.
```yaml
server:
  port: 8082
  forward-headers-strategy: framework
```
Cloudflare가 보내주는 `X-Forwarded-Proto: https` 헤더를 Spring이 신뢰하게 되어, `redirect_uri`를 https로 정확히 생성.

---

## 3. 로그인 성공했는데 `localhost:3000`으로 리다이렉트됨
*운영 도메인에서 구글 로그인 자체는 성공하는데, 로그인 완료 후 주소창이 `http://localhost:3000`으로 바뀜.*

**원인**: `SecurityConfig`/`OAuth2SuccessHandler` 둘 다 `@Value("${app.frontend-origin:http://localhost:3000}")`를 쓰고 있는데, `application.yml`에 `app.frontend-origin` 자체가 정의되어 있지 않아서 **항상 기본값(localhost)만** 사용되고 있었음. 루트 `.env`의 `FRONTEND_BASE_URL`은 있었지만, 이 값을 실제로 연결해주는 프로퍼티 매핑이 코드에 없었음.

**해결**: `application.yml`에 추가.
```yaml
app:
  frontend-origin: ${FRONTEND_BASE_URL:http://localhost:3000}
```
루트 `.env`의 `FRONTEND_BASE_URL`과 이름을 맞춰서, 기존 docker-compose 환경변수 설정을 그대로 재사용.

---
