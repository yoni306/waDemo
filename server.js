const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const { MongoClient } = require("mongodb");
const chatData = require("./chatdata"); // מכיל את messageMapping בצורת עץ
const { sendMessageToChatwoot } = require("./sendtc");
const mssql = require("mssql"); // הוספת חיבור ל-MSSQL
const app = express();
const PORT = 3000;
const ngrok = require("ngrok");
require("dotenv").config();
let db = null;
// בראש server.js - החלף לשורה הזו:
const { downloadBlobs } = require("./downloedPhtos");
// ← ייבוא הפונקציה
const fs = require("fs"); // ← כי sendBotPhotos משתמש ב-fs
const path = require("path"); // ← כי sendBotPhotos משתמש ב-path
app.use(bodyParser.json());
const { sendWhatsAppFileLocal } = require("./whatsappSender");
// =====================
//  מקבל הודעה מ-GreenAPI
// =====================
app.post("/api/get-message", async (req, res) => {
  if (!req.body) return res.end();

  const { typeWebhook, timestamp, senderData, messageData } = req.body;

  if (!typeWebhook || !typeWebhook.includes("incoming")) {
    console.log(`Ignoring webhook type: ${typeWebhook}`);
    return res.end();
  }

  if (isOldMessage(timestamp)) return res.end();

  let text = "";
  if (messageData) {
    if (
      messageData.extendedTextMessageData &&
      messageData.extendedTextMessageData.text
    ) {
      text = messageData.extendedTextMessageData.text.trim();
    } else if (
      messageData.textMessageData &&
      messageData.textMessageData.textMessage
    ) {
      text = messageData.textMessageData.textMessage.trim();
    }
  }

  const senderPhone = senderData ? senderData.chatId : "unknown";
  console.log(`From phone: ${senderPhone}`);
  console.log(`Message text: ${text}`);

  if (senderPhone.endsWith("@g.us")) {
    console.log("Ignoring group chat message.");
    return res.end();
  }

  const BOT_NUMBER = "972522997112@c.us";
  if (senderPhone === BOT_NUMBER) {
    console.log("Ignoring message sent by the bot itself.");
    return res.end();
  }
  if (senderPhone === "unknown") return res.end();

  // ★ שמירת הודעת הלקוח (client)
  await updateCustomerHistory(senderPhone, { type: "client", message: text });

  // בדיקה אם הלקוח קיים - אם לא, ניצור לקוח חדש ונשלח הודעת ברוכים הבאים
  let customer = await findCustomerByPhone(senderPhone);
  if (!customer) {
    await saveCustomer(senderPhone);
    customer = await findCustomerByPhone(senderPhone);
    const startNode = chatData.messageMapping.start;
    await sendWhatsAppMessage(senderPhone, startNode.text);
    await updateCustomerHistory(senderPhone, "server start");
    await updateLastInteraction(senderPhone, new Date());
    return res.end();
  }

  const now = new Date();
  const passed12Hours =
    customer.lastInteraction &&
    (now - customer.lastInteraction) / (1000 * 60 * 60) >= 12;

  if (passed12Hours) {
    console.log(
      `Customer ${senderPhone} was inactive for 12+ hours. Resetting state.`
    );
    await updateCustomerState(senderPhone, "start");
    await updateCustomerHumanStatus(senderPhone, false);
    // הסרנו את sendWhatsAppMessage(...);
  }

  // אם הלקוח במצב נציג אנושי – מעבירים את ההודעה ישירות ל־Chatwoot
  if (customer.human) {
    if (text === "99") {
      console.log(`Ending chat for customer ${senderPhone}.`);
      await updateCustomerState(senderPhone, "start");
      await updateCustomerHumanStatus(senderPhone, false);

      // הודעת סיום השיחה
      await sendWhatsAppMessage(
        senderPhone,
        "✅ השיחה עם הנציג הסתיימה, חזרת לתפריט הראשי."
      );
      await updateCustomerHistory(senderPhone, "server chat ended");

      // הודעת ברוכים הבאים (התפריט הראשי)
      const startNode = chatData.messageMapping.start;
      await sendWhatsAppMessage(senderPhone, startNode.text);
      await updateCustomerHistory(senderPhone, "server start");
      return res.end();
    } else {
      console.log(`Forwarding message to Chatwoot: ${text}`);
      await sendMessageToChatwoot(senderPhone, text);
      return res.end();
    }
  }

  // מעבר למצב נציג אנושי כאשר בתפריט הראשי נלחץ "3"
  if (customer.currentState === "start" && text === "3") {
    console.log("Switching customer to human support mode.");
    await updateCustomerState(senderPhone, "humanRepresentative");
    await updateCustomerHumanStatus(senderPhone, true);
    const hrNode = chatData.messageMapping.humanRepresentative;
    if (hrNode && hrNode.text) {
      await sendWhatsAppMessage(senderPhone, hrNode.text);
    } else {
      await sendWhatsAppMessage(senderPhone, "🔄 הנך מועבר לנציג אנושי...");
    }
    return res.end();
  }

  // ממשיכים במצב האוטומטי לפי מפת ההודעות
  const currentState = customer.currentState || "start";
  const currentNode = chatData.messageMapping[currentState];

  if (!currentNode) {
    console.log(
      "Warning: currentState not found in messageMapping. Resetting to start."
    );
    await updateCustomerState(senderPhone, "start");
    const startNode = chatData.messageMapping.start;
    await sendWhatsAppMessage(senderPhone, startNode.text);
    await updateCustomerHistory(senderPhone, "server start");
    await updateLastInteraction(senderPhone, now);
    return res.end();
  }

  const nextState = currentNode.next[text];
  if (!nextState) {
    console.log(`Unrecognized input '${text}' in state ${currentState}.`);
    if (currentState === "start") {
      const startNode = chatData.messageMapping.start;
      const msgToSend = "לא זיהיתי מה שלחת.\n\n" + (startNode?.text || "");
      await sendWhatsAppMessage(senderPhone, msgToSend);
      await updateCustomerHistory(senderPhone, "server default-start");
    } else {
      const msgToSend =
        "לא זיהיתי את מה ששלחת.\nתוכל להקיש 0 לתפריט הקודם או 99 לתפריט הראשי.";
      await sendWhatsAppMessage(senderPhone, msgToSend);
      await updateCustomerHistory(senderPhone, "server default-other");
    }
    await updateLastInteraction(senderPhone, now);
    return res.end();
  }

  // ⭐⭐ כטיפול בשליחת הצילומי⭐⭐
  if (nextState === "sendWhatsAppPhotos") {
    try {
      await sendBotPhotos(senderPhone);
      await sendWhatsAppMessage(
        senderPhone,
        "📸 הצילומים נשלחו בהצלחה כאן בווטסאפ!\n\n0) חזרה לתפריט הקודם\n99) חזרה לתפריט הראשי"
      );
      await updateCustomerHistory(senderPhone, "server sent photos success");
    } catch (error) {
      console.error("Failed to send photos:", error);
      await sendWhatsAppMessage(
        senderPhone,
        "❗ לא נמצאו צילומים לשליחה.\n\n0) חזרה לתפריט הקודם\n99) חזרה לתפריט הראשי"
      );
      await updateCustomerHistory(senderPhone, "server sent photos failed");
    }
    await updateLastInteraction(senderPhone, now);
    return res.end();
  }

  const nextNode = chatData.messageMapping[nextState];
  if (!nextNode) {
    console.log(
      `Warning: nextState '${nextState}' not found in mapping. Sending default.`
    );
    const defaultMsg = chatData.messageMapping.default
      ? chatData.messageMapping.default.text
      : "לא זיהיתי את מה ששלחת.\nתוכל להקיש 0 לתפריט הקודם או 99 לתפריט הראשי.";
    await sendWhatsAppMessage(senderPhone, defaultMsg);
    await updateCustomerHistory(senderPhone, "server default");
    await updateLastInteraction(senderPhone, now);
    return res.end();
  }

  await sendWhatsAppMessage(senderPhone, nextNode.text);
  await updateCustomerHistory(senderPhone, `server ${nextState}`);
  await updateCustomerState(senderPhone, nextState);
  await updateLastInteraction(senderPhone, now);
  return res.end();
});

//***************************************************************
//קריאה מאור השן
//************************************************************
app.post("/api/or-hashen", async (req, res) => {
  if (!req.body) return res.end();

  const { action, data, phone } = req.body;

  switch (action) {
    case "sendToPatient":
      try {
        let customer = await findCustomerByPhone(phone);
        if (!customer) {
          await saveCustomer(phone); // יצירת לקוח חדש אם אין
          customer = await findCustomerByPhone(phone); // טוענים שוב
        }
        // ✅ עכשיו מנסים לשלוח את הצילומים
        const success = await handleSendToPatient(data, phone);
        if (success) {
          const niceMessage =
            "😊 שלום לך,\n\n" +
            "📸 להלן צילומים מוכנים מאת *אור השן*.\n\n" +
            "נשמח תמיד לעמוד לשירותך!";

          // שולחים את ההודעה ללקוח
          await sendWhatsAppMessage(phone, niceMessage);

          // שומרים במסד שהשרת שלח את הודעת השליחה
          await updateCustomerHistory(phone, "server Sent ready photos");

          // מחזירים אותו לתפריט הראשי
          await updateCustomerState(phone, "start");

          console.log(
            `✅ Sent ready photos message to ${phone} and reset to start menu.`
          );
        } else {
          console.log(
            `⚠️ Photos sending failed or no photos for ${phone}. No message sent.`
          );
        }
      } catch (error) {
        console.error(
          `❌ Failed during sending photos to ${phone}:`,
          error.message
        );
        // במקרה של שגיאה לא עושים כלום
      }
      break;

    case "justLoggedIn":
      // נכנס רק עכשיו למחשב
      await handleJustLoggedIn(phone);
      break;

    case "Doctor":
      // בעדר יהיה רשום שזה לא פציינט אלא רופא
      await Doctor(phone);
      break;

    default:
      console.log(`Unknown action: ${action}`);
      res.status(400).send("Unknown action");
      return;
  }

  res.status(200).send("Action processed");
});

async function handleSndToPatient(clientId, phone) {
  try {
    console.log(
      `📥 Received request to send files for ClientID: ${clientId} to phone: ${phone}`
    );

    // 1. Fetch document names
    const clientNumbers = [clientId.toString()];
    const docNames = await fetchDocumentNamesForClients(clientNumbers);

    if (!docNames || docNames.length === 0) {
      console.log(`❌ No documents found for ClientID: ${clientId}`);
      return false;
    }

    console.log(
      `✅ Found ${docNames.length} document(s) for ClientID ${clientId}:`,
      docNames
    );

    // 2. Download documents into a local folder
    const downloadResult = await downloadBlobs(docNames, phone);

    if (!downloadResult.success) {
      console.error("❌ Failed to download files from Azure storage.");
      return false;
    }

    console.log(`✅ Files downloaded successfully into clients/${phone}/`);

    // 3. Send each file to WhatsApp
    const downloadFolder = path.join(__dirname, "clients", phone);
    const files = fs.readdirSync(downloadFolder);

    let sentAny = false;

    for (const file of files) {
      const filePath = path.join(downloadFolder, file);
      const caption = "📸 להלן צילום ממרפאת אור השן (נשלח אוטומטית)";

      try {
        console.log(`📤 Sending file: ${file}`);
        await sendWhatsAppFileLocal(toChatId(phone), filePath, caption);
        sentAny = true;
      } catch (err) {
        console.error(`⚠️ Failed sending ${file}:`, err.message);
        // ממשיכים לקובץ הבא
      }
    }

    if (!sentAny) {
      throw new Error("No files could be sent to WhatsApp.");
    }

    // 4. Delete local folder after sending
    fs.rmSync(downloadFolder, { recursive: true, force: true });
    console.log(`🗑️ Deleted folder: clients/${phone}/`);

    return true; // הצלחה
  } catch (error) {
    console.error("❌ Error in handleSendToPatient:", error.message);
    return false;
  }
}

async function handleJustLoggedIn(phone) {
  try {
    console.log("📥 Handling just logged in with data:", phone);

    // 🔹 בדיקה אם הלקוח כבר קיים
    let customer = await findCustomerByPhone(phone);
    if (!customer) {
      // אם לא קיים, ניצור חדש
      await saveCustomer(phone);
      customer = await findCustomerByPhone(phone);
      console.log(`✅ Created new customer for phone: ${phone}`);
    }

    // 🔹 שליחת הודעת קבלת פנים
    const welcomeMessage =
      "😊 שלום וברוך הבא ל-*אור השן*!\n\n" +
      "בהמשך אשלח לך את הצילומים לכאן.\n" +
      "תוכל גם לקבל צילומים ישירות למייל דרך מערכת השליחה שלנו.";

    await sendWhatsAppMessage(phone, welcomeMessage);
    await updateCustomerHistory(phone, "server Sent welcome after login");
    console.log(`✅ Welcome message sent to ${phone}`);

    // 🔹 שליחת קישור למערכת שליחת צילומים
    const systemLinkMessage = "🔗 https://getphotos.or-hashen.co.il/";

    await sendWhatsAppMessage(phone, systemLinkMessage);
    await updateCustomerHistory(phone, "server Sent photo system link");
    console.log(`✅ System link message sent to ${phone}`);

    // 🔹 עדכון הלקוח למצב start
    await updateCustomerState(phone, "start");
    console.log(`✅ Customer state reset to 'start' for ${phone}`);
  } catch (error) {
    console.error("❌ Error handling justLoggedIn:", error.message);
  }
}

async function Doctor(clientId, phone) {
  try {
    console.log(
      `📥 Handling doctor flow for clientId: ${clientId}, phone: ${phone}`
    );

    if (!clientId || !phone) {
      console.error("❌ Missing clientId or phone in doctor request.");
      return;
    }

    // 🔹 שולחים את הצילומים לרופא
    const success = await handleSendToPatient(clientId, phone);

    if (success) {
      // 🔹 שולחים הודעה יפה לרופא
      const doctorMessage =
        '🦷 שלום ד"ר,\n\n' +
        "📸 להלן הצילומים של הפציינט שלך.\n\n" +
        "נשמח להמשיך לעמוד לשירותך בכל עת.";

      await sendWhatsAppMessage(phone, doctorMessage);
      await updateCustomerHistory(
        phone,
        "server Sent patient photos to doctor"
      );

      console.log(
        `✅ Sent patient photos and doctor message successfully to ${phone}`
      );
    } else {
      console.log(
        `⚠️ No photos found for clientId ${clientId}, no message sent.`
      );
    }
  } catch (error) {
    console.error(`❌ Error in Doctor function for ${phone}:`, error.message);
  }
}

//***************************************************************
//קריאה מ-Chatwoot
//**************************************************************
app.post("/api/chatwoot-incoming", async (req, res) => {
  console.log("Chatwoot payload:", JSON.stringify(req.body, null, 2));
  if (req.body.event !== "message_created") {
    console.log("Ignoring event type:", req.body.event);
    return res.status(200).json({ status: "Event ignored" });
  }

  try {
    const { content, conversation, message_type } = req.body;
    if (message_type === "incoming") {
      console.log("Ignoring incoming message to prevent echo");
      return res.status(200).json({ status: "Incoming message ignored" });
    }

    let senderPhone = conversation?.contact_inbox?.source_id;
    if (!content || !senderPhone) {
      console.log("Missing content or phone number:", { content, senderPhone });
      return res.status(400).json({
        error: "Missing required fields",
        details: { content: !!content, senderPhone: !!senderPhone },
      });
    }

    // עיצוב מספר הטלפון באותה המתכונת כמו בהודעת get-message
    const formattedPhone = senderPhone.replace("+", "") + "@c.us";
    console.log(
      `Processing outgoing message for ${formattedPhone}: ${content}`
    );

    await sendWhatsAppMessage(formattedPhone, content);
    // שמירת ההודעה – כאן אנו משתמשים ב-formattedPhone כדי שהתיעוד יהיה עקבי
    await updateCustomerHistory(formattedPhone, {
      type: "server",
      message: content,
    });

    return res.json({ status: "Message sent and logged" });
  } catch (error) {
    console.error("Error processing Chatwoot message:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

// שליחת הודעה יזומה (ניתן להסיר אם לא צריך)
sendWhatsAppMessage("972527755722@c.us", "hey");

//====================================================//
//              פונקציות עזר
//====================================================//

function isOldMessage(timestamp) {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  return timestamp < nowInSeconds - 120; // מתעלמים מהודעות ישנות מ-2 דקות
}

// מוצא לקוח לפי מספר טלפון
async function findCustomerByPhone(phone) {
  return await db.collection("customers").findOne({ phone });
}

// יצירת לקוח חדש
async function saveCustomer(phone) {
  const newCustomer = {
    phone: phone,
    created_at: new Date(),
    status: "active",
    currentState: "start", // מצב התחלתי
    history: [],
  };
  await db.collection("customers").insertOne(newCustomer);
  console.log(`New customer saved: ${phone}`);
}

// עדכון מצב הלקוח
async function updateCustomerState(phone, newState) {
  await db
    .collection("customers")
    .updateOne({ phone: phone }, { $set: { currentState: newState } });
}

// עדכון היסטוריה עם תמיכה בסוג הודעה (client/server)
// הפונקציה מקבלת או מחרוזת (שמציינת הודעת שרת) או אובייקט המכיל את סוג ההודעה (client/server) ואת התוכן
async function updateCustomerHistory(phone, messageRecord) {
  let record;
  if (typeof messageRecord === "string") {
    record = {
      timestamp: new Date(),
      type: "server",
      message: messageRecord,
    };
  } else {
    record = {
      timestamp: new Date(),
      ...messageRecord,
    };
  }
  await db
    .collection("customers")
    .updateOne({ phone: phone }, { $push: { history: record } });
  console.log(
    `Updated customer history for: ${phone}, message=${record.message}`
  );
}

// עדכון זמן אינטראקציה אחרונה
async function updateLastInteraction(phone, lastInteraction) {
  await db
    .collection("customers")
    .updateOne(
      { phone: phone },
      { $set: { lastInteraction: lastInteraction } }
    );
}

// עדכון מצב תמיכת נציג אנושי
async function updateCustomerHumanStatus(phone, isHuman) {
  try {
    await db
      .collection("customers")
      .updateOne({ phone: phone }, { $set: { human: isHuman } });
    console.log(`✅ Updated human support status for ${phone} to ${isHuman}`);
  } catch (error) {
    console.error(
      `❌ Error updating human support status for ${phone}:`,
      error.message
    );
  }
}

// שליחת הודעה בפועל
async function sendWhatsAppMessage(chatId, message) {
  const url =
    "https://7105.api.greenapi.com/waInstance7105233885/sendMessage/76b502f623244d898cc105f0728c9d563f9f7344d9f14c0ebf";

  const payload = { chatId, message };
  const headers = { "Content-Type": "application/json" };

  try {
    const response = await axios.post(url, payload, { headers });
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error.message);
    throw error;
  }
}

// ───── Helper: מוודא שיש בדיוק @c.us אחד ─────
function toChatId(phone) {
  return phone.endsWith("@c.us") ? phone : `${phone}@c.us`;
}

/**
 * שולח ללקוח את כל הקבצים שנמצאו ב־Azure:
 * 1. מאתר ClientID-ים עפ״י מספר טלפון (חמש שנים אחורה)
 * 2. שולף שמות קבצים (docNames)
 * 3. מוריד את מה שקיים ל-clients/<phone>/
 * 4. שולח כל קובץ אחד-אחד ל-WhatsApp, מדלג על שגיאות ספציפיות
 * 5. מוחק את התיקייה המקומית
 */
async function sendBotPhotos(phone) {
  try {
    // ✅ שולח ללקוח הודעה לפני התחלת השליחה
    await sendWhatsAppMessage(
      toChatId(phone),
      "⌛ נא להמתין... הצילומים בדרך אליך 📤"
    );
    /* ───────── 1. חיפוש ClientID-ים ───────── */
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    const formattedDate = fiveYearsAgo.toISOString().split("T")[0];

    let localPhone = phone.replace(/\D/g, "");
    if (localPhone.startsWith("972") && localPhone.length > 9) {
      localPhone = "0" + localPhone.slice(3);
    }

    console.log(`🔍 phone=${localPhone}  from=${formattedDate}`);

    const query = `
      SELECT ClientID
      FROM dbo.Client
      WHERE Tel  = @clientPhone
        AND KDate >= @formattedDate;`;

    const result = await pool
      .request()
      .input("clientPhone", mssql.NVarChar, localPhone)
      .input("formattedDate", mssql.Date, formattedDate)
      .query(query);

    if (!result.recordset.length) {
      throw new Error("No photos found for the last five years.");
    }

    const clientNumbers = result.recordset.map((row) =>
      row.ClientID.toString()
    );
    console.log("✅ session numbers:", clientNumbers);

    /* ───────── 2. שמות קבצים והורדה ───────── */
    const docNames = await fetchDocumentNamesForClients(clientNumbers);
    if (!docNames.length) throw new Error("No docs");

    console.log("✅ doc files:", docNames.length);

    const dl = await downloadBlobs(docNames, phone); // phone הוא 972…@c.us
    if (!dl.success) throw new Error("download failed");

    const downloadFolder = path.join(__dirname, "clients", phone);
    console.log("✅ files downloaded to", downloadFolder);

    /* ───────── 3. שליחה ל-WhatsApp ───────── */
    const files = fs.readdirSync(downloadFolder);
    let sentAny = false;

    for (const file of files) {
      const filePath = path.join(downloadFolder, file);
      const caption = "📸 Your photo file from Or Hashen";

      try {
        console.log("📤 Sending", file);
        await sendWhatsAppFileLocal(toChatId(phone), filePath, caption);
        sentAny = true;
      } catch (err) {
        console.error("⚠️  skip", file, "-", err.message);
        // מדלג וממשיך לקובץ הבא
      }
    }

    if (!sentAny) throw new Error("nothing went through to WhatsApp");

    /* ───────── 4. ניקוי תיקייה ───────── */
    fs.rmSync(downloadFolder, { recursive: true, force: true });
    console.log(`🗑️  Deleted folder clients/${phone}/`);
  } catch (err) {
    console.error("❌ Error in sendBotPhotos:", err.message);
    throw err; // יעבור לטיפול השגיאה של הקריאה
  }
}

/// פונקציה למציאת שמות תמונות לפי מספרי לקוח
async function fetchDocumentNamesForClients(clientNumbers) {
  try {
    let allDocuments = [];

    for (let i = 0; i < clientNumbers.length; i++) {
      const query = `
        SELECT docName
        FROM [dbo].[Documents]
        WHERE ClientID = @clientNumber;
      `;

      const result = await pool
        .request()
        .input("clientNumber", mssql.NVarChar, clientNumbers[i]) // פרמטר למספר לקוח
        .query(query);

      if (result.recordset.length > 0) {
        const docsForClient = result.recordset.map((row) => row.docName);
        allDocuments.push(...docsForClient);
      }
    }

    return allDocuments;
  } catch (err) {
    console.error("Error fetching document names:", err);
    return [];
  }
}

//====================================================//
//            חיבור ל-MongoDB והרצת שרת
//====================================================//

async function connectToMongoDB() {
  const uri =
    "mongodb+srv://yoni306:D6GOxsOYUbv1udvd@whatsappmongoapi.iic8c.mongodb.net/?retryWrites=true&w=majority&appName=WhatsappMongoAPI";
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log("Connected to MongoDB successfully");
    db = client.db("whatsapp"); // שמירת החיבור במשתנה גלובלי
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

// התחברות למסד הנתונים
(async () => {
  await connectToMongoDB();
})();

const dbConfig = {
  user: process.env.DB_USER, // שם המשתמש למסד הנתונים
  password: process.env.DB_PASSWORD, // סיסמה
  server: process.env.DB_SERVER, // שם השרת
  database: "OrHashen", // שם מסד הנתונים
  encrypt: true, // נדרש אם אתה מתחבר ל-Azure
};

// חיבור למסד נתונים
ConnectSQL();
async function ConnectSQL() {
  try {
    pool = await mssql.connect(dbConfig);
    console.log("Connected successfully to SQL Server");
    const result = await pool
      .request()
      .query("SELECT DB_NAME() AS CurrentDatabase;");
    console.log("Connected to database:", result.recordset[0].CurrentDatabase);
  } catch (err) {
    console.error("SQL Connection Error: ", err);
  }
}

async function startNgrokAndUpdateWebhook() {
  // 1. מאמתים טוקן ngrok
  await ngrok.authtoken("2rtENTLEfSmTkYy2pvhp7K6I4uA_K3Fkhcr5xeC38PuV9xHo");

  // 2. פותחים את הטאנל
  const url = await ngrok.connect({ addr: PORT, region: "eu" });
  console.log(`✅ NGROK URL: ${url}`);

  // 3. עדכון ה-webhook ב-GreenAPI בלבד
  await axios.post(
    "https://7105.api.greenapi.com/waInstance7105233885/setSettings/76b502f623244d898cc105f0728c9d563f9f7344d9f14c0ebf",
    { webhookUrl: `${url}/api/get-message`, allowWebhook: true },
    { headers: { "Content-Type": "application/json" } }
  );

  console.log("✅ GreenAPI Webhook updated:", `${url}/api/get-message`);
}

app.listen(PORT, async () => {
  await startNgrokAndUpdateWebhook();
  console.log(`Server is running on http://localhost:${PORT}`);
});

// // ─────────────────────────────────────────────
// // Tadiran Call-Monitor  →  WhatsApp
// // ─────────────────────────────────────────────
// conCall: async ({ callerExt, calledExt }) => {
//   const waId = `972${callerExt}@c.us`;

//   // 🔹 בדיקה אם קיים במסד
//   let customer = await findCustomerByPhone(waId);
//   if (!customer) {
//     await saveCustomer(waId); // יצירת לקוח חדש
//     customer = await findCustomerByPhone(waId); // טען מחדש
//   }

//   const menu = chatData.messageMapping.start.text;
//   const msg =
//     "😊 היי, ראינו שהתקשרת!\n" + "תוכל לבצע כאן מגוון פעולות:\n\n" + menu;

//   await sendWhatsAppMessage(waId, msg);
//   await updateCustomerHistory(waId, "server auto-ring");
//   await updateCustomerState(waId, "start");
//   await updateLastInteraction(waId, new Date());
// };
