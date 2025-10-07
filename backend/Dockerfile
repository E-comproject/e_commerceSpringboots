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

# ติดตั้ง curl สำหรับ healthcheck (ทำก่อนเปลี่ยน user)
RUN apk add --no-cache curl

# สร้าง user แบบ non-root
RUN addgroup -S spring && adduser -S spring -G spring

# เตรียมโฟลเดอร์สำหรับอัปโหลดใต้ /data และโอนสิทธิ์ให้ user
ENV UPLOAD_ROOT=/data/uploads
RUN mkdir -p ${UPLOAD_ROOT} && chown -R spring:spring /data

# คัดลอก JAR
COPY --from=build /app/target/*.jar app.jar

# ประกาศ volume (ให้ Railway ผูก storage ถาวร)
# VOLUME ["/data"]

# ใช้สิทธิ์ non-root
USER spring:spring

# เปิดพอร์ต (Railway จะส่ง PORT มาเอง)
EXPOSE 8080

# Healthcheck (แก้ path ตามของแอปคุณ เช่น /api/health หรือ /actuator/health)
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD curl -fsS http://127.0.0.1:${PORT:-8080}/actuator/health || exit 1

# รันแอป + สร้างโฟลเดอร์ย่อยตอน runtime
# ส่งค่า server.port จาก $PORT และส่ง path อัปโหลดให้แอปอ่าน
CMD sh -c "mkdir -p ${UPLOAD_ROOT}/products ${UPLOAD_ROOT}/profiles ${UPLOAD_ROOT}/shops ${UPLOAD_ROOT}/chat \
  && java -Dserver.port=${PORT} -Dfile.upload.root=${UPLOAD_ROOT} -jar app.jar"
