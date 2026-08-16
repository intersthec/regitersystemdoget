// ==============================================
// Code.gs - โค้ด Google Apps Script
// เชื่อม Google Sheet กับฟอร์ม HTML ด้วย doGet และ doPost
// ==============================================

// 1) ระบุแผ่นงานที่ต้องการบันทึก (ตรวจสอบชื่อแท็บชีตให้ตรงกับใน Google Sheets เช่น "Sheet1" หรือ "ชีต1")
const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");

// 2) doPost = ทำงานตอน "บันทึกข้อมูล" (ฟอร์มส่งข้อมูลมาแบบ POST)
function doPost(e) {
  try {
    const data = e.parameter; // ข้อมูลจากฟอร์ม: data.name, data.email, data.phone

    // จัดการเบอร์โทรศัพท์ให้มีเลข 0 นำหน้าเสมอ ไม่ถูกแปลงเป็นตัวเลขในชีต
    let phoneStr = data.phone ? data.phone.toString().trim() : "";
    if (phoneStr && !phoneStr.startsWith("'")) {
      phoneStr = "'" + phoneStr;
    }

    // เพิ่มแถวใหม่ในชีต เรียงตามคอลัมน์ A, B, C, D
    sheet.appendRow([
      new Date(),   // A: วันเวลาที่บันทึก
      data.name,    // B: ชื่อ-นามสกุล
      data.email,   // C: อีเมล
      phoneStr      // D: เบอร์โทร (คงเลข 0 นำหน้าไว้เสมอ)
    ]);

    return ContentService.createTextOutput("บันทึกข้อมูลสำเร็จเรียบร้อยแล้ว");
  } catch (error) {
    return ContentService.createTextOutput("เกิดข้อผิดพลาด: " + error.toString());
  }
}

// 3) doGet = ทำงานตอน "ดึงข้อมูล" (เปิด URL ตรง ๆ หรือ fetch แบบไม่ระบุ method)
function doGet(e) {
  try {
    // นับจำนวนแถวข้อมูลทั้งหมด (ลบแถวหัวตารางออก 1 แถว)
    const lastRow = sheet.getLastRow();
    const total = lastRow > 1 ? lastRow - 1 : 0;

    return ContentService.createTextOutput("จำนวนคนที่ลงทะเบียนแล้ว: " + total + " คน");
  } catch (error) {
    return ContentService.createTextOutput("เกิดข้อผิดพลาด: " + error.toString());
  }
}
