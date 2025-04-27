const { ContainerClient } = require("@azure/storage-blob");
const fs = require("fs");
const path = require("path");
const FileType = require("file-type"); // שימוש בגרסה 16 שתומכת ב-CommonJS
require("dotenv").config(); // קריאה למשתני סביבה

// ה-URL של קונטיינר עם SAS Token מתוך משתנה סביבה
const AZURE_STORAGE_SAS_URL = process.env.AZURE_STORAGE_SAS_URL;

// פונקציה להורדת קבצים מה-Azure Blob Storage לתיקייה זמנית
async function downloadBlobs(docNames, tz) {
  try {
    // יצירת חיבור ל-Container Client באמצעות SAS URL
    const containerClient = new ContainerClient(AZURE_STORAGE_SAS_URL);

    // תיקיית יעד לשמירת הקבצים בתוך clients/ת.ז
    const downloadFolder = path.join(__dirname, "clients", tz);
    if (!fs.existsSync(downloadFolder)) {
      fs.mkdirSync(downloadFolder, { recursive: true });
    }

    // ודא ש-docNames הוא מערך. אם הוא מחרוזת אחת, הפוך אותו למערך עם פריט אחד
    if (!Array.isArray(docNames)) {
      docNames = [docNames];
    }

    for (let docName of docNames) {
      const blockBlobClient = containerClient.getBlockBlobClient(docName);

      // נתיב זמני להורדת הקובץ ללא סיומת
      const tempFilePath = path.join(downloadFolder, docName);

      // הורדת הבלוב לקובץ זמני
      await blockBlobClient.downloadToFile(tempFilePath);

      // קריאת הבתים הראשונים של הקובץ כדי לזהות את סוג הקובץ
      const readStream = fs.createReadStream(tempFilePath, {
        start: 0,
        end: 4100,
      });

      // שימוש ב-file-type לזיהוי סוג הקובץ
      const fileTypeResult = await FileType.fromStream(readStream);

      // סגירת ה-ReadStream
      readStream.close();

      let extension = "";
      if (fileTypeResult && fileTypeResult.ext) {
        extension = "." + fileTypeResult.ext;
      } else {
        // אם לא ניתן לזהות את סוג הקובץ, ניתן להגדיר סיומת ברירת מחדל או להשאיר ללא סיומת
        extension = ""; // או למשל '.bin'
      }

      // בניית שם הקובץ עם הסיומת
      const fileName = docName + extension;

      const finalFilePath = path.join(downloadFolder, fileName);

      // שינוי שם הקובץ מהנתיב הזמני לנתיב הסופי עם הסיומת
      fs.renameSync(tempFilePath, finalFilePath);

      console.log(`Downloaded file: ${fileName} to ${finalFilePath}`);
    }

    return { success: true, message: "Files downloaded successfully" };
  } catch (error) {
    console.error("Error downloading blobs:", error);
    return { success: false, message: "Error downloading blobs", error: error };
  }
}

module.exports = {
  downloadBlobs,
};
