# 🐳 키보드 배틀러 Docker 실행 가이드

## 📋 사전 요구사항

- Docker Desktop 설치
- Docker Compose 설치 (Docker Desktop에 포함됨)

## 🚀 빠른 시작

### 1. 전체 서비스 실행
```bash
# 프로젝트 루트 디렉토리에서
docker-compose up --build
```

### 2. 백그라운드 실행
```bash
docker-compose up -d --build
```

### 3. 서비스 상태 확인
```bash
docker-compose ps
```

### 4. 로그 확인
```bash
# 전체 로그
docker-compose logs

# 특정 서비스 로그
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mysql
```

## 🌐 접속 정보

- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:8080
- **MySQL**: localhost:3306
  - 데이터베이스: `demo_db`
  - 사용자: `keybaegg`
  - 비밀번호: `keybaeggpw`

## 🛠️ 관리 명령어

### 서비스 중지
```bash
docker-compose down
```

### 서비스 중지 + 볼륨 삭제 (데이터 초기화)
```bash
docker-compose down -v
```

### 특정 서비스만 재시작
```bash
docker-compose restart backend
docker-compose restart frontend
docker-compose restart mysql
```

### 컨테이너 내부 접속
```bash
# 백엔드 컨테이너 접속
docker exec -it keybaegg-backend sh

# MySQL 컨테이너 접속
docker exec -it keybaegg-mysql mysql -u keybaegg -p

# 프론트엔드 컨테이너 접속
docker exec -it keybaegg-frontend sh
```

## 📁 프로젝트 구조

```
keybaegg/
├── docker-compose.yml          # 전체 서비스 관리
├── Dockerfile.backend          # Spring Boot 백엔드
├── frontend/
│   ├── Dockerfile.frontend     # React 프론트엔드
│   └── nginx.conf              # nginx 설정
├── src/main/resources/
│   ├── application.properties  # 기본 설정
│   └── application-docker.properties  # Docker 환경 설정
└── .dockerignore               # Docker 빌드 제외 파일
```

## 🔧 환경변수

### MySQL
- `MYSQL_ROOT_PASSWORD`: rootpw
- `MYSQL_DATABASE`: demo_db
- `MYSQL_USER`: keybaegg
- `MYSQL_PASSWORD`: keybaeggpw

### Spring Boot
- `SPRING_DATASOURCE_URL`: MySQL 연결 URL
- `SPRING_DATASOURCE_USERNAME`: keybaegg
- `SPRING_DATASOURCE_PASSWORD`: keybaeggpw
- `SPRING_PROFILES_ACTIVE`: docker

### React
- `REACT_APP_API_URL`: http://localhost:8080

## 🐛 문제 해결

### 1. 포트 충돌
```bash
# 사용 중인 포트 확인
netstat -tulpn | grep :3000
netstat -tulpn | grep :8080
netstat -tulpn | grep :3306
```

### 2. 컨테이너 로그 확인
```bash
docker-compose logs -f backend
```

### 3. 데이터베이스 연결 확인
```bash
docker exec -it keybaegg-mysql mysql -u keybaegg -p
```

### 4. 전체 재빌드
```bash
docker-compose down
docker system prune -a
docker-compose up --build
```

## 📝 주의사항

1. **첫 실행 시 시간**: 초기 빌드에 5-10분 소요될 수 있습니다.
2. **데이터 보존**: MySQL 데이터는 `mysql_data` 볼륨에 저장됩니다.
3. **환경 분리**: Docker 환경은 로컬 개발 환경과 완전히 분리됩니다.
4. **포트 사용**: 3000, 8080, 3306 포트가 사용됩니다.

## 🎉 완료!

모든 서비스가 정상적으로 실행되면:
- 키보드 배틀러 웹사이트: http://localhost:3000
- 관리자 기능 사용 가능
- 모든 기능이 정상 작동합니다! 