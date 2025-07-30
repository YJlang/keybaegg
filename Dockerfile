# Railway 배포용 최적화 Dockerfile
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Gradle Wrapper 파일들 복사
COPY gradlew ./
COPY gradle gradle
COPY build.gradle settings.gradle ./
RUN chmod +x gradlew

# 의존성 다운로드 (캐시 최적화)
RUN ./gradlew dependencies --no-daemon --parallel

# 소스 코드 복사
COPY src src

# 애플리케이션 빌드 (테스트 제외, 최적화)
RUN ./gradlew clean build -x test --no-daemon --parallel

# 프로덕션 런타임 스테이지
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# 시스템 패키지 업데이트 및 curl 설치
RUN apk update && apk add --no-cache curl

# JAR 파일 복사
COPY --from=build /app/build/libs/*.jar app.jar

# 정적 파일 디렉토리 생성
RUN mkdir -p /app/static

# 포트 노출
EXPOSE 8080

# 헬스체크 설정
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/api/keyboard-warriors/allow || exit 1

# 애플리케이션 실행 (메모리 최적화)
ENTRYPOINT ["java", "-Xmx512m", "-Xms256m", "-jar", "app.jar"] 