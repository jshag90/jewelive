---
trigger: always_on
---

🚀 Antigravity Project Development Guide
1. 개요
Backend: Python 3.10+ (FastAPI)

Frontend: React.js

Database: MariaDB

Core Principle: 객체지향 설계(SOLID), 관심사의 분리, 유지보수 용이성

2. Backend Coding Rules (FastAPI)
2.1 아키텍처 레이어
Schemas (Pydantic): 요청(Request) 및 응답(Response) 데이터 규격 정의.

API (Routers): 엔드포인트 정의. 비즈니스 로직 없이 서비스 레이어를 호출.

Services: 핵심 비즈니스 로직 수행. 인터페이스 기반으로 설계하여 확장성 확보.

Models (SQLAlchemy): MariaDB 테이블 정의 및 관계 설정.

Repositories: 데이터베이스 CRUD 직접 수행. 서비스 레이어와 DB 사이의 추상화 계층.

2.2 주요 규칙
의존성 주입 (DI): Depends()를 사용하여 객체 간 결합도를 낮춤.

Type Hinting: 모든 함수 인자와 반환값에 타입을 명시함.

비동기 처리: I/O 작업(DB, API 호출)은 async / await를 기본으로 사용함.

예외 처리: 커스텀 Exception 클래스를 정의하고 전역 Exception Handler에서 통합 관리함.

3. Frontend Coding Rules (React.js)
3.1 컴포넌트 및 상태 관리
Functional Components: 클래스형 대신 함수형 컴포넌트와 Hook 사용.

Custom Hooks: 비즈니스 로직(데이터 fetch, 상태 로직)은 UI 컴포넌트에서 분리하여 hooks/ 폴더에서 관리.

Service Layer: API 호출은 services/ 폴더 내에 별도 클래스/함수로 작성 (Axios 인스턴스 활용).

3.2 스타일 및 규격
Component Composition: 상속보다 합성을 통해 UI 재사용성을 높임.

Props Validation: 타입 안정성을 위해 TypeScript 사용 권장 혹은 PropTypes 정의.

4. Database Rules (MariaDB)
Naming: 테이블명은 snake_case와 복수형(users)을 사용.

Migration: 스키마 변경 시 반드시 Alembic을 사용하며, 직접 DB 수정을 금지함.

Index: 자주 조회되는 필드(FK, 검색 조건 등)에는 인덱스를 설정하되 과도한 사용은 지양함.

Audit Columns: 모든 테이블에 created_at, updated_at 컬럼을 포함함.

5. 프로젝트 폴더 구조
Bash

antigravity/
├── backend/
│   ├── app/
│   │   ├── api/          # Route handlers (Controller)
│   │   ├── core/         # Config, Security, Constants
│   │   ├── models/       # DB Entities (SQLAlchemy)
│   │   ├── repository/   # Data Access Logic
│   │   ├── services/     # Business Logic (OOP)
│   │   └── schemas/      # Pydantic Models (DTO)
│   ├── main.py           # Entry point
│   └── alembic/          # DB Migration scripts
├── frontend/
│   ├── src/
│   │   ├── components/   # Shared UI Components
│   │   ├── hooks/        # Business Logic Hooks
│   │   ├── pages/        # View Components
│   │   └── services/     # API Client (Axios)
│   └── App.js
└── docker-compose.yml
6. Git & Workflow Rules
Commit Message Convention:

feat: 새로운 기능 추가

fix: 버그 수정

docs: 문서 수정

refactor: 코드 리팩토링 (기능 변화 없음)

chore: 빌드 업무, 패키지 매니저 설정 등

Branch Strategy: feature/기능명 → develop → main 순으로 병합.

mariad db 접속 정보
ip : 127.0.0.1
port : 3306
사용자 : root
비밀번호 : 12345