const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const mime = require("mime-types");
const path = require("path");

// פונקציה לשליחת קובץ מקומי לוואטסאפ
async function sendWhatsAppFileLocal(chatId, filePath, caption = "") {
  if (!fs.existsSync(filePath)) {
    console.error("❌ File not found:", filePath);
    return;
  }

  const fileStream = fs.createReadStream(filePath);
  const fileName = path.basename(filePath);
  const mimeType = mime.lookup(filePath) || "application/octet-stream";

  const form = new FormData();
  form.append("chatId", chatId);
  form.append("caption", caption);
  form.append("file", fileStream, {
    filename: fileName,
    contentType: mimeType,
  });

  const url =
    "https://7105.api.greenapi.com/waInstance7105177666/sendFileByUpload/a30c7152283640129f30f70c171078fa4ec39b88ba3a4144a2";

  try {
    const res = await axios.post(url, form, {
      headers: form.getHeaders(),
    });

    console.log("✅ File sent successfully:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ Error sending file:");
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Response:", err.response.data);
    } else {
      console.error(err.message);
    }
  }
}

// דוגמה לשימוש:
const chatId = "972527755722@c.us";
const caption = "הנה התמונה שלך! 📸";

sendWhatsAppFileLocal(chatId, "./f.pdf", caption);
