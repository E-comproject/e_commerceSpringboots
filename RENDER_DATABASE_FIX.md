# วิธีแก้ปัญหา Database Connection บน Render

## 1. ตรวจสอบ Database Service ใน Render

1. ไปที่ Render Dashboard
2. คลิกที่ PostgreSQL database service ของคุณ
3. ไปที่แท็บ "Info"
4. จะเห็น 2 URLs:
   - **External Database URL** (สำหรับ connection จากภายนอก)
   - **Internal Database URL** (สำหรับ connection ภายใน Render - แนะนำ!)

## 2. ใช้ Internal Database URL

### ถ้า backend และ database อยู่ใน Render region เดียวกัน ควรใช้ Internal URL:

**ตัวอย่าง Internal URL:**
```
postgres://ecommerce_user:VjNCjpxwiQuQDqK35MkjcKLQLSObthJJ@dpg-d3i1837fte5s73datfj0:5432/ecommerce_prod_0o5
```

**แปลงเป็น JDBC format:**
```
jdbc:postgresql://dpg-d3i1837fte5s73datfj0:5432/ecommerce_prod_0o5
```

**สังเกต:** Internal URL ไม่มี `-pg.render.com` และไม่ต้องใช้ SSL

## 3. อัพเดท Environment Variables ใน Render

ไปที่ Backend Service > Settings > Environment Variables:

```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://dpg-d3i1837fte5s73datfj0:5432/ecommerce_prod_0o5
SPRING_DATASOURCE_USERNAME=ecommerce_user
SPRING_DATASOURCE_PASSWORD=VjNCjpxwiQuQDqK35MkjcKLQLSObthJJ
```

**หมายเหตุ:** 
- ไม่ต้องใส่ `?sslmode=require` สำหรับ Internal URL
- ไม่ต้องใส่ quotes รอบค่า
- ตรวจสอบให้แน่ใจว่าไม่มี space หรือ newline ต่อท้าย

## 4. ถ้ายังไม่ได้ ลองใช้ Direct Connection String

ใน Render Dashboard > Database > Info > Connection Details:
- Host: `dpg-d3i1837fte5s73datfj0`
- Database: `ecommerce_prod_0o5`
- Username: `ecommerce_user`
- Port: `5432`

แล้วสร้าง URL เอง:
```
SPRING_DATASOURCE_URL=jdbc:postgresql://dpg-d3i1837fte5s73datfj0:5432/ecommerce_prod_0o5
```

## 5. Debug Steps

1. **ดู Logs ใน Render:**
   - Backend Service > Logs
   - ดูว่ามี error message อะไร

2. **ตรวจสอบ Database Status:**
   - Database Service > Metrics
   - ดูว่า database กำลังรันอยู่หรือไม่

3. **Test Connection ด้วย psql:**
   ```bash
   psql "postgres://ecommerce_user:password@dpg-xxx:5432/ecommerce_prod_0o5"
   ```

## 6. Alternative: ใช้ DATABASE_URL แบบ Render

ถ้า Render auto-generate DATABASE_URL ให้ ลองใช้:

```java
// ใน DatabaseConfig.java
String databaseUrl = System.getenv("DATABASE_URL");
if (databaseUrl != null && databaseUrl.startsWith("postgres://")) {
    // แปลงจาก postgres:// เป็น jdbc:postgresql://
    databaseUrl = "jdbc:postgresql://" + databaseUrl.substring(11);
}
```

## 7. Contact Render Support

ถ้ายังไม่ได้ อาจต้องติดต่อ Render support พร้อมข้อมูล:
- Service URLs
- Error logs
- Database status
