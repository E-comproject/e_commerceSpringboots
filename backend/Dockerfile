# ========= Stage 1: Build =========
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -e -DskipTests dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# ========= Stage 2: Run =========
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# tools: curl (healthcheck) + su-exec (สลับ user ตอน runtime)
RUN apk add --no-cache curl su-exec

# non-root user
RUN addgroup -S spring && adduser -S spring -G spring

# path อัปโหลด (Railway จะ mount /data มาให้ตอนรัน)
ENV UPLOAD_ROOT=/data/uploads

# คัดลอก JAR
COPY --from=build /app/target/*.jar app.jar

COPY ./uploads/ /data/uploads/
RUN chown -R spring:spring /data/uploads
RUN chmod -R 755 /data/uploads || true

# **อย่า set USER ที่นี่** ต้องคงเป็น root เพื่อแก้สิทธิ์หลัง mount
EXPOSE 8080

# ให้ตรงกับ context-path ของคุณ (จาก log คือ /api)
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=5 \
  CMD curl -fsS http://127.0.0.1:${PORT:-8080}/api/health || exit 1

# หลัง Railway mount volume แล้ว:
# 1) chown /data ให้ spring
# 2) สลับเป็น spring แล้วสร้างโฟลเดอร์ย่อย + รันแอป
CMD sh -c "\
  mkdir -p /data && chown -R spring:spring /data && \
  su-exec spring:spring sh -c '\
    mkdir -p ${UPLOAD_ROOT}/products ${UPLOAD_ROOT}/profiles ${UPLOAD_ROOT}/shops ${UPLOAD_ROOT}/chat && \
    java -Dserver.port=${PORT} -Dfile.upload.root=${UPLOAD_ROOT} -jar app.jar' \
"
