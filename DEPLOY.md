# JEWELIVE 배포 가이드

FABRILL 스타일로 리뉴얼된 JEWELIVE는 Firebase 서버리스 스택 위에서 동작합니다.
- **Frontend + API**: Firebase App Hosting (백엔드 `jewel-live-web`)
- **Firestore**: 상품 · 사용자 · 브랜드 · 카테고리 (로컬 dev는 메모리 폴백)
- **Storage**: 상품 이미지
- **Functions**: `jewel-live-api` (헬스체크)

## 1. 로컬 동작 확인

```bash
# 루트와 프론트 의존성 설치 (최초 1회)
npm install --prefix frontend
npm install

# React 빌드
npm --prefix frontend run build

# Express + 정적 파일 서빙 (로컬 스모크 테스트)
node apphosting-server.js
# http://127.0.0.1:8080 접속
```

Firebase Admin 크리덴셜이 없는 로컬에서는 자동으로 메모리 저장소로 폴백하여 동작합니다.
프런트 개발서버(`npm --prefix frontend run dev`)는 `vite.config.ts`의 프록시로
`/api` 요청을 `127.0.0.1:8080`(Express)로 전달합니다. 따라서 dev 시 위 Express를 함께 실행하세요.

## 2. Firebase 프로젝트 선행 세팅 (최초 1회)

Claude Code가 실행 환경에서 로그인할 수 없어 아래 단계는 사용자님이 직접 진행해야 합니다.

1. **Firebase CLI 설치 & 로그인** (호스트 터미널에서)
   ```bash
   npm install -g firebase-tools
   firebase login
   ```
2. **프로젝트 선택** (이미 `.firebaserc`의 기본값은 `jewel-live`)
   ```bash
   firebase use jewel-live
   ```
3. **Blaze(종량제) 결제 플랜 필요**: App Hosting · Cloud Functions · Storage 사용에 필요합니다.
   - <https://console.firebase.google.com/project/jewel-live/usage/details> 에서 업그레이드.
4. **필요 API 활성화** (Firebase Console이 대부분 자동 활성화)
   - Cloud Functions, Cloud Run, Cloud Build, App Hosting, Firestore, Storage.
5. **App Hosting 백엔드 바인딩**
   - 콘솔 → Build → App Hosting → `jewel-live-web` 백엔드 확인.
   - App Hosting은 GitHub 저장소를 연결해야 Cloud Build가 배포를 트리거합니다.
     - (콘솔에서 "GitHub 연결" → 본 레포 선택 → 브랜치 `main`).
   - 콘솔에서 연결이 끝나면 `main` 브랜치에 `git push`만으로 자동 배포됩니다.
6. **(선택) JWT 시크릿 환경변수 설정**
   ```bash
   firebase apphosting:secrets:set JWT_SECRET
   # 프롬프트가 뜨면 안전한 문자열 입력
   firebase apphosting:secrets:grantaccess JWT_SECRET --backend jewel-live-web
   ```
   `apphosting.yaml`에 `env: [{ variable: JWT_SECRET, secret: JWT_SECRET }]` 가 필요합니다(요청 시 추가).

## 3. 배포 커맨드

```bash
# 1) Firestore 인덱스/룰 배포
firebase deploy --only firestore

# 2) Storage 룰 배포
firebase deploy --only storage

# 3) Functions 배포 (Python 3.13)
firebase deploy --only functions

# 4) App Hosting (프론트 + API)
#    → GitHub 연결이 되어있으면 `git push`로 자동 배포
#    → 수동 배포: firebase apphosting:rollouts:create jewel-live-web --git-branch main
firebase apphosting:rollouts:create jewel-live-web --git-branch main
```

모두 완료되면 `https://<backendId>--<project>.<region>.hosted.app` 또는 콘솔에 표시되는
App Hosting URL로 접속 가능합니다.

## 4. 사용자님께 필요한 정보/권한 체크리스트

| 항목 | 상태 | 설명 |
|------|------|------|
| Firebase 프로젝트 | **필요** | `.firebaserc`에 `jewel-live`로 설정됨. 실제 콘솔 소유/편집 권한 |
| 결제 플랜 Blaze | **필요** | App Hosting, Functions, Storage 사용에 필수 |
| Firebase CLI 로그인 | **필요** | `firebase login` |
| GitHub 저장소 연결 | **필요** | App Hosting이 Cloud Build로 자동 배포하려면 연결 필요 |
| Python 3.13 | (로컬 에뮬레이터용) | Functions 에뮬레이터 실행 시 |
| 도메인(선택) | 선택 | 기본 `.hosted.app` 대신 커스텀 도메인을 쓰고 싶다면 |
| 소셜 로그인 (카카오/애플) | 선택 | UI만 준비됨. 사용 시 각 개발자 콘솔에서 앱 등록 후 연동 필요 |

## 5. 자주 묻는 문제

- **`Error: Failed to authenticate`** → `firebase login --reauth`
- **App Hosting 빌드 실패** → 루트 `package.json`과 `frontend/package.json` 모두 커밋되었는지 확인
- **Functions 배포 시 Python 버전 오류** → Python 3.13 런타임 설정. `firebase.json`에 `"runtime": "python313"` 지정됨
- **Firestore 권한 오류** → `firestore.rules`는 소유자만 쓰기 가능. 시드 데이터는 서버 사이드에서만 삽입
