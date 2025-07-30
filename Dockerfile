# ===========================================
# Render 배포용 최적화된 Spring Boot Dockerfile
# ===========================================

# 1. 빌드 단계 - Java 21 JDK
FROM eclipse-temurin:21-jdk-alpine AS build

# 메타데이터 설정
LABEL maintainer="keybaegg"
LABEL description="Keyboard Warrior Management System - Spring Boot Backend"

# 시스템 패키지 업데이트 및 필요한 도구 설치
RUN apk update && apk add --no-cache \
    curl \
    bash \
    && rm -rf /var/cache/apk/*

# 작업 디렉터리 설정
WORKDIR /app

# 2. Gradle 캐시 최적화 - 의존성 먼저 복사
# build.gradle과 settings.gradle을 먼저 복사하여 캐시 레이어 활용
COPY gradle gradle/
COPY gradlew build.gradle settings.gradle ./

# Gradle Wrapper 권한 설정
RUN chmod +x gradlew

# Gradle 의존성 다운로드 (캐시 레이어 최적화)
RUN ./gradlew dependencies --no-daemon

# 3. 소스 코드 복사 및 빌드
# 의존성이 변경되지 않았다면 이 단계부터 캐시 사용
COPY src src/

# 프로덕션 빌드 (테스트 제외, 최적화 옵션 추가)
RUN ./gradlew clean build -x test \
    --no-daemon \
    --parallel \
    --build-cache \
    -Dorg.gradle.jvmargs="-Xmx2g -XX:+UseG1GC"

# 4. 실행 단계 - Java 21 JRE (경량화)
FROM eclipse-temurin:21-jre-alpine

# 메타데이터 설정
LABEL maintainer="keybaegg"
LABEL description="Keyboard Warrior Management System - Runtime"

# 시스템 패키지 설치 (curl for healthcheck)
RUN apk update && apk add --no-cache \
    curl \
    bash \
    && rm -rf /var/cache/apk/*

# 보안을 위한 비root 사용자 생성
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# 작업 디렉터리 설정
WORKDIR /app

# 5. 애플리케이션 파일 복사
COPY --from=build /app/build/libs/*.jar app.jar

# 6. 권한 설정 (보안 강화)
RUN chown -R appuser:appgroup /app

# 7. 비root 사용자로 전환
USER appuser

# 8. 포트 노출
EXPOSE 8080

# 9. 환경변수 설정
ENV JAVA_OPTS="-Xmx512m -Xms256m -XX:+UseG1GC -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

# 10. 헬스체크 (Render 최적화)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/api/test/health || exit 1

# 11. 애플리케이션 실행
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"] 