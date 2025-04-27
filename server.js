const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const { MongoClient } = require("mongodb");
const chatData = require("./chatdata"); // מכיל את messageMapping בצורת עץ
const { sendMessageToChatwoot } = require("./sendtc");
const mssql = require("mssql"); // הוספת חיבור ל-MSSQL
const app = express();
const PORT = 8080;
let db = null;

app.use(bodyParser.json());

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
      const msgToSend = "לא זיהיתי את מה ששלחת.\nתוכל להקיש 0 לתפריט הקודם.";
      await sendWhatsAppMessage(senderPhone, msgToSend);
      await updateCustomerHistory(senderPhone, "server default-other");
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
      : "לא זיהיתי את מה ששלחת.\nתוכל להקיש 0 לתפריט הקודם.";
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

  const { action, data } = req.body;

  switch (action) {
    case "sendToPatient":
      // שליחה לפציינט ברגע שעלה צילום
      await handleSendToPatient(data);
      break;
    case "justLoggedIn":
      // נכנס רק עכשיו למחשב
      await handleJustLoggedIn(data);
      break;
    case "Doctor":
      // בעדר יהיה רשום שזה לא פציינט אלא רופא
      await Doctor(data);
      break;
    default:
      console.log(`Unknown action: ${action}`);
      res.status(400).send("Unknown action");
      return;
  }

  res.status(200).send("Action processed");
});
async function handleSendToPatient(data) {
  // לוגיקה לשליחה לפציינט ברגע שעלה צילום
  console.log("Handling send to patient with data:", data);
  // הוסף כאן את הקוד המתאים
}

async function handleJustLoggedIn(data) {
  // לוגיקה לנכנס רק עכשיו למחשב
  console.log("Handling just logged in with data:", data);
  // הוסף כאן את הקוד המתאים
}

async function Doctor(data) {
  // לוגיקה שבעדר יהיה רשום שזה לא פציינט אלא רופא
  console.log("Handling not patient but doctor with data:", data);
  // הוסף כאן את הקוד המתאים
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
    "https://7105.api.greenapi.com/waInstance7105177666/sendMessage/a30c7152283640129f30f70c171078fa4ec39b88ba3a4144a2";
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

app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
