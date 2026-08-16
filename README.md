# ระบบลงทะเบียนออนไลน์เชื่อมต่อ Google Sheets (doGet & doPost)

ระบบลงทะเบียนแบบหน้าเดียว (Single Page Application) ดีไซน์สวยงามและทันสมัย เชื่อมต่อฐานข้อมูล Google Sheets ผ่าน Google Apps Script Web App รองรับทั้งการส่งข้อมูล (POST) และการดึงข้อมูลสถิติ (GET) พร้อมระบบรักษาเลข `0` นำหน้าของเบอร์โทรศัพท์

---

## 🚀 ฟีเจอร์หลัก (Features)

1. **Modern UI Design:** โทนสี Indigo & Emerald สวยงาม สบายตา พร้อมระบบ Responsive รองรับทุกอุปกรณ์ (มือถือ, แท็บเล็ต, เดสก์ท็อป)
2. **Google Sheets Database:** บันทึกข้อมูล วัน-เวลา, ชื่อ, อีเมล และเบอร์โทรศัพท์ ลง Google Sheets แบบเรียลไทม์
3. **Preserve Leading Zero:** แก้ปัญหาเลข 0 นำหน้าเบอร์โทรศัพท์หาย โดยการจัดเก็บเป็น Text Format อัตโนมัติ
4. **Live Registered Counter (doGet):** ระบบตรวจสอบและแสดงผลจำนวนผู้ลงทะเบียนทั้งหมดผ่าน API
5. **Interactive Feedback:** ระบบ Spinner ขณะกำลังส่ง และแจ้งเตือนสถานะความสำเร็จ / ข้อผิดพลาด

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
├── index.html       # หน้าเว็บฟอร์มลงทะเบียน (HTML, CSS, JS ในไฟล์เดียว)
├── Code.gs          # สคริปต์ Google Apps Script (doGet & doPost)
└── README.md        # คู่มือการติดตั้งและใช้งานระบบ
```

---

## 🛠️ วิธีการติดตั้งและใช้งาน (Installation & Setup)

### ขั้นตอนที่ 1: เตรียม Google Sheets
1. สร้าง **Google Sheets** ใหม่ขึ้นมา
2. ตั้งชื่อแผ่นงาน (Sheet Tab) ด้านล่างเป็น `Sheet1` (หรือตั้งชื่อตามที่ระบุใน [Code.gs](Code.gs))
3. เพิ่มหัวตารางในแถวที่ 1:
   - **คอลัมน์ A:** `Timestamp` (วันเวลา)
   - **คอลัมน์ B:** `Name` (ชื่อ - นามสกุล)
   - **คอลัมน์ C:** `Email` (อีเมล)
   - **คอลัมน์ D:** `Phone` (เบอร์โทรศัพท์)

---

### ขั้นตอนที่ 2: ติดตั้ง Google Apps Script
1. ไปที่เมนู **ส่วนขยาย (Extensions)** -> **Apps Script**
2. คัดลอกโค้ดจากไฟล์ [Code.gs](Code.gs) ไปวางทับในหน้าแก้ไขโค้ด
3. กด **บันทึก (Save)** (รูปแผ่นดิสก์)

---

### ขั้นตอนที่ 3: Deploy เป็น Web App
1. กดปุ่มสีน้ำเงิน **ทำให้ใช้งานได้ (Deploy)** -> **การทำให้ใช้งานได้ใหม่ (New deployment)**
2. เลือกประเภทเป็น **เว็บแอป (Web app)**
3. ตั้งค่าดังนี้:
   - **คำอธิบาย (Description):** `v1`
   - **เรียกใช้ในฐานะ (Execute as):** `ฉัน (Me / บัญชีของคุณ)`
   - **ผู้มีสิทธิ์เข้าถึง (Who has access):** `ทุกคน (Anyone)` *(สำคัญมาก)*
4. กด **ทำให้ใช้งานได้ (Deploy)** และให้สิทธิ์การเข้าถึง (Authorize access)
5. คัดลอก **URL เว็บแอป (Web App URL)** ที่ลงท้ายด้วย `/exec`

---

### ขั้นตอนที่ 4: เชื่อมต่อเข้ากับหน้าเว็บ
1. เปิดไฟล์ [index.html](index.html)
2. นำ Web App URL ที่ได้ไปวางแทนที่ตัวแปร `API_URL`:
   ```javascript
   const API_URL = "https://script.google.com/macros/s/YOUR_DEPLOYED_ID/exec";
   ```
3. บันทึกไฟล์ และเปิด [index.html](index.html) ในเว็บเบราว์เซอร์เพื่อเริ่มใช้งานได้ทันที

---

## 📄 License
MIT License &bull; พัฒนาเพื่อการเรียนรู้และการใช้งานจริง