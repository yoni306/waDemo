const axios     = require("axios");
const fs        = require("fs");
const FormData  = require("form-data");
const mime      = require("mime-types");
const path      = require("path");

// שולח קובץ מקומי לצ'אט פרטי ב-WhatsApp
async function sendWhatsAppFileLocal(chatId, filePath, caption = "") {
  if (!fs.existsSync(filePath)) {
    console.error("❌ File not found:", filePath);
    return;
  }

  const fileStream = fs.createReadStream(filePath);
  const fileName   = path.basename(filePath);
  const mimeType   = mime.lookup(filePath) || "application/octet-stream";

  const form = new FormData();
  form.append("chatId",   chatId);                   // 972…@c.us
  form.append("file",     fileStream, {
    filename: fileName,
    contentType: mimeType,
  });
  form.append("fileName", fileName);                 // ← חובה ב-Classic
  form.append("caption",  caption);

  // *** שים לב: sendFileByUploadClassic ***
  const url = "https://7105.api.greenapi.com/waInstance7105233885/sendFileByUploadClassic/76b502f623244d898cc105f0728c9d563f9f7344d9f14c0ebf";

  try {
    const res = await axios.post(url, form, { headers: form.getHeaders() });
    console.log("✅ File sent successfully, Green-API id:", res.data?.idMessage);
    return res.data;
  } catch (err) {
    console.error("❌ Error sending file:");
    if (err.response) {
      console.error("Status:",   err.response.status);
      console.error("Response:", err.response.data);
    } else {
      console.error(err.message);
    }
    throw err;
  }
}
// בדיקת Smoke Test
sendWhatsAppFileLocal("972527755722@c.us", "./f.pdf", "הנה הקובץ 📎")
  .catch(()=>{});

module.exports = { sendWhatsAppFileLocal };
