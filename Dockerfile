# ===========================================
# Render 배포용 단순하고 안정적인 Dockerfile
# ===========================================

# 1. 빌드 단계
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# 2. Gradle 파일 복사 (캐시 최적화)
COPY gradle gradle/
COPY gradlew build.gradle settings.gradle ./
RUN chmod +x gradlew

# 3. 의존성 다운로드
RUN ./gradlew dependencies --no-daemon

# 4. 소스 코드 복사 및 빌드
COPY src src/
RUN ./gradlew clean build -x test --no-daemon

# 5. 실행 단계
FROM eclipse-temurin:21-jre
WORKDIR /app

# 6. JAR 파일 복사
COPY --from=build /app/build/libs/*.jar app.jar

# 7. 포트 노출 (Render에서 동적 할당)
EXPOSE ${PORT:-8080}

# 8. 헬스체크 (동적 포트 사용)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8080}/api/test/health || exit 1

# 9. 애플리케이션 실행
CMD ["java", "-jar", "app.jar"] 