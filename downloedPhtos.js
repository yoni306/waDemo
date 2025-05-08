const { ContainerClient } = require("@azure/storage-blob");
const fs = require("fs");
const path = require("path");
const FileType = require("file-type"); // גרסה 16 – CommonJS
require("dotenv").config();

const AZURE_STORAGE_SAS_URL = process.env.AZURE_STORAGE_SAS_URL;


async function downloadBlobs(docNames, tz) {
  try {
    const containerClient = new ContainerClient(AZURE_STORAGE_SAS_URL);

    const downloadFolder = path.join(__dirname, "clients", tz.toString());
    if (!fs.existsSync(downloadFolder)) {
      fs.mkdirSync(downloadFolder, { recursive: true });
    }

    if (!Array.isArray(docNames)) {
      docNames = [docNames];
    }

    let successCount = 0;

    for (const docName of docNames) {
      try {
        const blockBlobClient = containerClient.getBlockBlobClient(docName);
        const tempFilePath = path.join(downloadFolder, docName);

        await blockBlobClient.downloadToFile(tempFilePath); // ⬇⬇⬇

        // מנסים לזהות סוג קובץ כדי להוסיף סיומת
        const type = await FileType.fromFile(tempFilePath);
        const ext = type?.ext ? "." + type.ext : "";
        const finalFilePath = path.join(downloadFolder, docName + ext);

        fs.renameSync(tempFilePath, finalFilePath);

        console.log(`✅ downloaded ${docName} → ${finalFilePath}`);
        successCount++;
      } catch (err) {
        console.error(`❌ failed ${docName}: ${err.message}`);
        // לא זורקים החוצה – פשוט עוברים לקובץ הבא
        continue;
      }
    }

    if (successCount === 0) {
      return { success: false, message: "no files downloaded" };
    }
    return { success: true, message: `downloaded ${successCount} file(s)` };
  } catch (err) {
    console.error("❌ critical error in downloadBlobs:", err);
    return { success: false, message: "critical error", error: err };
  }
}

module.exports = { downloadBlobs };
