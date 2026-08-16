# ระบบแดชบอร์ดลงทะเบียนและโปรไฟล์สมาชิก (Google Drive & Sheets)

ระบบแดชบอร์ดสรุปผลและลงทะเบียนสมาชิกแบบหน้าเดียว (Single Page Application) รองรับการอัปโหลดรูปภาพประจำตัวเข้าสู่ **Google Drive**, บันทึกข้อมูลลง **Google Sheets** พร้อมระบบแก้ไขข้อมูลโปรไฟล์ และดึงข้อมูลสถิติมาแสดงผลแบบเรียลไทม์

---

## 🚀 ฟีเจอร์หลัก (Features)

1. **Profile Photo Upload to Google Drive:** 
   - อัปโหลดรูปภาพประจำตัวจากหน้าเว็บ
   - บันทึกไฟล์ภาพเข้าโฟลเดอร์ Google Drive ID: `1hRl3JLjIxzFtdbbQMcSAuTdwHawZ2cBB`
   - กำหนดสิทธิ์รูปภาพให้อ่านได้สาธารณะ (Public View) พร้อมส่ง URL แสดงผลแบบความเร็วสูง
2. **Edit Profile Feature (ระบบแก้ไขข้อมูลส่วนตัว):** 
   - กดปุ่ม **"✏️ แก้ไข"** ในตาราง เพื่อเปิดหน้าต่างปรับปรุงชื่อ อีเมล เบอร์โทร หรือเปลี่ยนรูปโปรไฟล์ใหม่ โดยระบบจะอัปเดตทับแถวเดิมอัตโนมัติ
3. **Preserve Leading Zero:** 
   - รักษาเลข `0` นำหน้าของเบอร์โทรศัพท์ (เช่น `0812345678`) ไม่ให้ถูกแปลงเป็นตัวเลขในชีต
4. **Live Dashboard & Search (doGet):** 
   - แดชบอร์ดแสดงผลสถิติจำนวนสมาชิกทั้งหมด, แถบเป้าหมาย (Goal Progress), และตารางรายชื่อพร้อมรูปโปรไฟล์จริง
   - ช่องค้นหาข้อมูลแบบ Real-time Filter (ค้นหาตามชื่อ, อีเมล, หรือเบอร์โทร)

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
├── index.html       # แดชบอร์ดสรุปผล + ฟอร์มลงทะเบียน & แก้ไขโปรไฟล์ (HTML/CSS/JS)
├── Code.gs          # สคริปต์ Google Apps Script (Drive Upload, doGet & doPost)
└── README.md        # คู่มือการติดตั้งและตั้งค่าระบบ
```

---

## 🛠️ วิธีการติดตั้งและตั้งค่า (Installation & Setup)

### ขั้นตอนที่ 1: เตรียม Google Sheets
1. สร้าง **Google Sheets** ใหม่ขึ้นมา (หรือใช้ชีตเดิม)
2. ตั้งชื่อแผ่นงานเป็น `Sheet1`
3. ตั้งชื่อหัวตารางในแถวที่ 1 (เรียงจาก A ถึง E):
   - **คอลัมน์ A:** `Timestamp` (วันเวลา)
   - **คอลัมน์ B:** `Name` (ชื่อ - นามสกุล)
   - **คอลัมน์ C:** `Email` (อีเมล)
   - **คอลัมน์ D:** `Phone` (เบอร์โทรศัพท์)
   - **คอลัมน์ E:** `PhotoUrl` (ลิงก์รูปภาพ Google Drive)

---

### ขั้นตอนที่ 2: ตั้งค่าสิทธิ์โฟลเดอร์ Google Drive
1. เปิดโฟลเดอร์ Google Drive (ID: `1hRl3JLjIxzFtdbbQMcSAuTdwHawZ2cBB`)
2. คลิกขวาที่โฟลเดอร์ -> เลือก **แชร์ (Share)**
3. ตั้งค่าการเข้าถึงทั่วไปเป็น **"ทุกคนที่มีลิงก์ (Anyone with the link)"** และสิทธิ์เป็น **"มีสิทธิ์อ่าน (Viewer)"**

---

### ขั้นตอนที่ 3: ติดตั้ง Google Apps Script
1. ใน Google Sheets ไปที่เมนู **ส่วนขยาย (Extensions)** -> **Apps Script**
2. คัดลอกโค้ดทั้งหมดจากไฟล์ [Code.gs](Code.gs) ไปวางทับใน Script Editor
3. ตรวจสอบตัวแปร `FOLDER_ID` ว่าตรงกับ ID โฟลเดอร์ที่ต้องการ:
   ```javascript
   const FOLDER_ID = "1hRl3JLjIxzFtdbbQMcSAuTdwHawZ2cBB";
   ```
4. กด **บันทึก (Save)**

---

### ขั้นตอนที่ 4: Deploy เป็น Web App
1. กดปุ่มสีน้ำเงิน **ทำให้ใช้งานได้ (Deploy)** -> **การทำให้ใช้งานได้ใหม่ (New deployment)**
2. เลือกประเภทเป็น **เว็บแอป (Web app)**
3. ตั้งค่า:
   - **คำอธิบาย:** `v2-drive-upload`
   - **เรียกใช้ในฐานะ (Execute as):** `ฉัน (Me)`
   - **ผู้มีสิทธิ์เข้าถึง (Who has access):** `ทุกคน (Anyone)` *(จำเป็นสำหรับรับรูปจากหน้าเว็บ)*
4. กด **ทำให้ใช้งานได้ (Deploy)** และอนุมัติสิทธิ์ (Authorize access) ทั้ง Sheets และ Drive
5. คัดลอก **URL เว็บแอป (Web App URL)** ที่ลงท้ายด้วย `/exec`

---

### ขั้นตอนที่ 5: เชื่อมต่อกับหน้าเว็บ
1. เปิดไฟล์ [index.html](index.html)
2. นำ URL ที่ได้ไปวางในตัวแปร `API_URL` ที่ส่วนบนของ JavaScript:
   ```javascript
   const API_URL = "https://script.google.com/macros/s/YOUR_DEPLOYED_ID/exec";
   ```
3. บันทึกไฟล์ และเปิด [index.html](index.html) ในเว็บเบราว์เซอร์เพื่อเริ่มใช้งานได้ทันที

---

## 📄 License
MIT License &bull; พัฒนาเพื่อการใช้งานจริงร่วมกับ Google Workspace