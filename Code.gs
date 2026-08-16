// ==========================================================================
// Code.gs - Google Apps Script Backend (Web App)
// รองรับ: บันทึกรูปลง Drive, ลบรูปเดิมอัตโนมัติเมื่อแก้ไข/เปลี่ยนรูป, ป้องกันเลข 0 หาย
// ==========================================================================

// 1) กำหนด ID โฟลเดอร์ Google Drive สำหรับจัดเก็บรูปภาพ
const FOLDER_ID = "1hRl3JLjIxzFtdbbQMcSAuTdwHawZ2cBB";

// 2) กำหนดชีตที่ใช้บันทึกข้อมูล (ชื่อแท็บใน Google Sheets)
const SHEET_NAME = "Sheet1";

// ==========================================================================
// 🚨 ฟังก์ชันบังคับขอสิทธิ์สร้างและลบไฟล์ Google Drive (createFile & trash)
// ==========================================================================
function grantPermission() {
  var folder = DriveApp.getFolderById(FOLDER_ID);
  
  // บังคับเรียกสร้างและลบไฟล์เพื่อให้ Google ร้องขอสิทธิ์ https://www.googleapis.com/auth/drive
  var testBlob = Utilities.newBlob("Drive Permission OK", "text/plain", "auth_test.txt");
  var testFile = folder.createFile(testBlob);
  testFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  testFile.setTrashed(true);
  
  Logger.log("✅ สิทธิ์ Google Drive ผ่านสมบูรณ์แล้ว: " + folder.getName());
}

// --------------------------------------------------------------------------
// ดึง Object แผ่นงาน Google Sheets
// --------------------------------------------------------------------------
function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  
  // ตรวจสอบและสร้างหัวตารางอัตโนมัติหากชีตยังว่าง
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Timestamp", "Name", "Email", "Phone", "PhotoUrl"]);
    sheet.getRange(1, 1, 1, 5).setFontWeight("bold").setBackground("#eef2ff");
  }
  return sheet;
}

// --------------------------------------------------------------------------
// ฟังก์ชันแปลง File ID หรือ Drive URL ให้เป็นลิงก์ lh5.googleusercontent.com
// --------------------------------------------------------------------------
function convertToLh5Url(fileIdOrUrl) {
  if (!fileIdOrUrl) return "";
  const match = fileIdOrUrl.toString().match(/[-\w]{25,}/);
  if (match) {
    return "https://lh5.googleusercontent.com/d/" + match[0];
  }
  return fileIdOrUrl;
}

// --------------------------------------------------------------------------
// 🗑️ ฟังก์ชันลบรูปภาพเดิมออกจาก Google Drive (ย้ายลงถังขยะ)
// --------------------------------------------------------------------------
function deleteFileFromDrive(photoUrlOrFileId) {
  try {
    if (!photoUrlOrFileId) return false;
    const match = photoUrlOrFileId.toString().match(/[-\w]{25,}/);
    if (match) {
      const fileId = match[0];
      const file = DriveApp.getFileById(fileId);
      file.setTrashed(true); // ย้ายลงถังขยะ Google Drive
      Logger.log("✓ ลบไฟล์รูปเดิมออกจาก Google Drive สำเร็จ: " + fileId);
      return true;
    }
  } catch (err) {
    Logger.log("⚠️ ไม่สามารถลบไฟล์เก่าจาก Drive ได้: " + err.toString());
  }
  return false;
}

// --------------------------------------------------------------------------
// บันทึกรูปภาพลง Google Drive และรับลิงก์ URL ในรูปแบบ LH5
// --------------------------------------------------------------------------
function saveImageToDrive(base64Data, fileName, mimeType) {
  try {
    if (!base64Data || base64Data.length < 20) return "";
    
    let folder;
    try {
      folder = DriveApp.getFolderById(FOLDER_ID);
    } catch (e) {
      folder = DriveApp.getRootFolder();
    }
    
    let cleanBase64 = base64Data;
    let actualMime = mimeType || "image/jpeg";
    
    if (base64Data.indexOf(",") !== -1) {
      const parts = base64Data.split(",");
      const meta = parts[0];
      cleanBase64 = parts[1];
      
      const mimeMatch = meta.match(/data:([^;]+);/);
      if (mimeMatch && mimeMatch[1]) {
        actualMime = mimeMatch[1];
      }
    }
    
    cleanBase64 = cleanBase64.replace(/[\s\r\n]+/g, "");
    
    const decodedBytes = Utilities.base64Decode(cleanBase64);
    const timeStamp = new Date().getTime();
    const finalFileName = (fileName || "profile_" + timeStamp) + ".jpg";
    
    const blob = Utilities.newBlob(decodedBytes, actualMime, finalFileName);
    const file = folder.createFile(blob);
    
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (shareErr) {
      Logger.log("Sharing notice: " + shareErr.toString());
    }
    
    const fileId = file.getId();
    const lh5Url = "https://lh5.googleusercontent.com/d/" + fileId;
    Logger.log("✓ บันทึกรูปลง Drive สำเร็จ: " + lh5Url);
    return lh5Url;
  } catch (err) {
    Logger.log("❌ ข้อผิดพลาดในการบันทึกภาพลง Drive: " + err.toString());
    throw new Error("Drive Save Error: " + err.toString());
  }
}

// --------------------------------------------------------------------------
// 3) doPost = ทำงานตอน "บันทึกข้อมูลใหม่" หรือ "แก้ไขข้อมูล"
// --------------------------------------------------------------------------
function doPost(e) {
  try {
    const sheet = getSheet();
    const data = e.parameter || {};
    const action = data.action || "register"; // "register" หรือ "update"
    
    const name = data.name ? data.name.trim() : "";
    const email = data.email ? data.email.trim() : "";
    const oldEmail = data.oldEmail ? data.oldEmail.trim() : email;
    let phone = data.phone ? data.phone.trim() : "";
    const imageBase64 = data.imageBase64 || "";
    const imageMime = data.imageMime || "image/jpeg";
    const removePhoto = (data.removePhoto === "true" || data.removePhoto === true);
    
    // รักษาเลข 0 นำหน้าเบอร์โทรศัพท์
    let phoneFormatted = phone;
    if (phoneFormatted && !phoneFormatted.startsWith("'")) {
      phoneFormatted = "'" + phoneFormatted;
    }
    
    const allData = sheet.getDataRange().getValues();
    
    // ========================================================================
    // กรณีที่ 1: แก้ไขข้อมูลสมาชิกเดิม (Update)
    // ========================================================================
    if (action === "update" || action === "edit") {
      let rowIndexToUpdate = -1;
      
      for (let i = 1; i < allData.length; i++) {
        const rowEmail = allData[i][2] ? allData[i][2].toString().trim() : "";
        if (rowEmail.toLowerCase() === oldEmail.toLowerCase() || rowEmail.toLowerCase() === email.toLowerCase()) {
          rowIndexToUpdate = i + 1;
          break;
        }
      }
      
      if (rowIndexToUpdate > 0) {
        const existingPhoto = allData[rowIndexToUpdate - 1][4] ? allData[rowIndexToUpdate - 1][4].toString().trim() : "";
        let finalPhoto = existingPhoto;
        let updateNotice = "";
        
        // 1.1 ถ้าผู้ใช้อัปโหลดรูปใหม่มาแทนที่
        if (imageBase64 && imageBase64.length > 50) {
          // ลบรูปเดิมออกจาก Google Drive ทันที
          if (existingPhoto) {
            deleteFileFromDrive(existingPhoto);
          }
          // บันทึกรูปใหม่เข้า Google Drive
          const newPhotoUrl = saveImageToDrive(imageBase64, "profile_" + email.replace(/[^a-zA-Z0-9]/g, "_"), imageMime);
          if (newPhotoUrl) {
            finalPhoto = newPhotoUrl;
            updateNotice = " (เปลี่ยนรูปโปรไฟล์ใหม่และลบรูปเก่าใน Drive แล้ว)";
          }
        } 
        // 1.2 ถ้าผู้ใช้กดปุ่มลบรูปภาพ (ไม่ใส่รูป)
        else if (removePhoto) {
          if (existingPhoto) {
            deleteFileFromDrive(existingPhoto);
          }
          finalPhoto = "";
          updateNotice = " (ลบรูปโปรไฟล์ออกจาก Google Drive แล้ว)";
        }
        
        // อัปเดตข้อมูลลงแถวเดิมใน Google Sheets
        sheet.getRange(rowIndexToUpdate, 1, 1, 5).setValues([[
          new Date(),
          name,
          email,
          phoneFormatted,
          finalPhoto
        ]]);
        
        return ContentService.createTextOutput(JSON.stringify({
          status: "success",
          message: "แก้ไขข้อมูลสำเร็จเรียบร้อยแล้ว" + updateNotice,
          photoUrl: finalPhoto
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // ========================================================================
    // กรณีที่ 2: ลงทะเบียนสมาชิกใหม่ (Register)
    // ========================================================================
    let photoUrl = "";
    let uploadNotice = "";
    
    if (imageBase64 && imageBase64.length > 50) {
      try {
        const uploadedUrl = saveImageToDrive(imageBase64, "profile_" + email.replace(/[^a-zA-Z0-9]/g, "_"), imageMime);
        if (uploadedUrl) {
          photoUrl = uploadedUrl;
          uploadNotice = " (บันทึกรูปโปรไฟล์เข้า Drive สำเร็จ)";
        }
      } catch (err) {
        uploadNotice = " (เกิดข้อผิดพลาดในการบันทึกรูป: " + err.message + ")";
      }
    }
    
    sheet.appendRow([
      new Date(),
      name,
      email,
      phoneFormatted,
      photoUrl
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "ลงทะเบียนสมาชิกใหม่สำเร็จเรียบร้อยแล้ว" + uploadNotice,
      photoUrl: photoUrl
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "เกิดข้อผิดพลาด: " + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// --------------------------------------------------------------------------
// 4) doGet = ทำงานตอน "ดึงข้อมูลสรุป & รายชื่อโปรไฟล์" (GET Request)
// --------------------------------------------------------------------------
function doGet(e) {
  try {
    const sheet = getSheet();
    const allData = sheet.getDataRange().getValues();
    
    if (allData.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        total: 0,
        records: []
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const rows = allData.slice(1);
    const total = rows.length;
    
    const records = rows.map((r, i) => {
      const rawPhone = r[3] ? r[3].toString() : "";
      const cleanPhone = rawPhone.replace(/^'/, "");
      const lh5PhotoUrl = r[4] ? convertToLh5Url(r[4].toString()) : "";
      
      let formattedDate = "";
      if (r[0] instanceof Date) {
        formattedDate = Utilities.formatDate(r[0], "Asia/Bangkok", "dd/MM/yyyy HH:mm");
      } else {
        formattedDate = r[0] ? r[0].toString() : "";
      }
      
      return {
        id: i + 1,
        date: formattedDate,
        name: r[1] ? r[1].toString() : "",
        email: r[2] ? r[2].toString() : "",
        phone: cleanPhone,
        photoUrl: lh5PhotoUrl
      };
    }).reverse();
    
    const result = {
      status: "success",
      total: total,
      records: records
    };
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "เกิดข้อผิดพลาด: " + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
