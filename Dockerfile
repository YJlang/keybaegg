# Railway 배포용 Dockerfile
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Gradle 캐시를 위한 설정
COPY gradle gradle
COPY gradlew build.gradle settings.gradle ./
RUN chmod +x gradlew

# 의존성 다운로드
RUN ./gradlew dependencies --no-daemon

# 소스 코드 복사
COPY src src

# 애플리케이션 빌드
RUN ./gradlew clean build -x test --no-daemon

# 런타임 스테이지
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# curl 설치 (healthcheck용)
RUN apk add --no-cache curl

# JAR 파일 복사
COPY --from=build /app/build/libs/*.jar app.jar

# 정적 파일 디렉토리 생성
RUN mkdir -p /app/static

EXPOSE 8080

# 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "app.jar"] 