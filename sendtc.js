const axios = require("axios");

const CHATWOOT_BASE_URL = "https://app.chatwoot.com";
const ACCOUNT_ID = "112993";
const API_ACCESS_TOKEN = "nJ2pkrZ3d3BHyqaaor29uaDY";
const INBOX_ID = "57123"; // ✅ Inbox ID שלך

/**
 * 🔹 שליחת הודעה ל-Chatwoot (רק עם מספר טלפון)
 * @param {string} customerPhone - מספר טלפון בפורמט מלא (לדוג' +972512345678)
 * @param {string} message - תוכן ההודעה
 */
async function sendMessageToChatwoot(customerPhone, message) {
  function formatPhoneNumber(phone) {
    // מסיר כל מה שאינו ספרה
    let cleaned = phone.replace(/\D/g, "");

    // בודק אם מתחיל עם 972 (ישראל), אם כן מוסיף "+"
    if (cleaned.startsWith("972")) {
      return `+${cleaned}`;
    }

    // אחרת מחזיר את המספר המעוצב עם "+"
    return `+${cleaned}`;
  }

  const formattedPhone = formatPhoneNumber(customerPhone);

  try {
    // 1️⃣ Search for contact by phone number
    const contactsResponse = await axios.get(
      `${CHATWOOT_BASE_URL}/api/v1/accounts/${ACCOUNT_ID}/contacts/search`,
      {
        params: { q: formattedPhone },
        headers: { api_access_token: API_ACCESS_TOKEN },
      }
    );

    let contactId;
    if (contactsResponse.data.payload.length > 0) {
      contactId = contactsResponse.data.payload[0].id;
      console.log(`✅ Existing contact found: Contact ID: ${contactId}`);
    } else {
      // If contact not found – create one
      const contactResponse = await axios.post(
        `${CHATWOOT_BASE_URL}/api/v1/accounts/${ACCOUNT_ID}/contacts`,
        {
          inbox_id: INBOX_ID,
          phone_number: formattedPhone,
        },
        {
          headers: { api_access_token: API_ACCESS_TOKEN },
        }
      );

      // 🔹 Retrieve the Contact ID from the API response
      contactId =
        contactResponse.data.payload?.contact?.id ||
        contactResponse.data.contact?.id;
      if (!contactId) {
        console.error(
          "❌ Error: Contact ID not found in API response!",
          JSON.stringify(contactResponse.data, null, 2)
        );
        return;
      }
      console.log(`✅ New contact created: Contact ID: ${contactId}`);
    }

    // 2️⃣ Check if there is an existing conversation for the contact
    const convResponse = await axios.get(
      `${CHATWOOT_BASE_URL}/api/v1/accounts/${ACCOUNT_ID}/contacts/${contactId}/conversations`,
      {
        headers: { api_access_token: API_ACCESS_TOKEN },
      }
    );

    let conversationId;
    if (convResponse.data.payload.length > 0) {
      // Existing conversation – take the first ID
      conversationId = convResponse.data.payload[0].id;
      console.log(
        `✅ Existing conversation found: Conversation ID: ${conversationId}`
      );
    } else {
      // If no conversation exists, create a new one
      const newConvResponse = await axios.post(
        `${CHATWOOT_BASE_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations`,
        {
          source_id: formattedPhone, // identifier based on phone number
          inbox_id: INBOX_ID,
          contact_id: contactId,
        },
        {
          headers: { api_access_token: API_ACCESS_TOKEN },
        }
      );

      conversationId =
        newConvResponse.data.id || newConvResponse.data.payload?.id;
      if (!conversationId) {
        console.error(
          "❌ Error: Conversation ID not found in API response!",
          JSON.stringify(newConvResponse.data, null, 2)
        );
        return;
      }
      console.log(
        `✅ New conversation created: Conversation ID: ${conversationId}`
      );
    }

    // 3️⃣ Send message to the conversation
    await axios.post(
      `${CHATWOOT_BASE_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}/messages`,
      {
        content: message,
        message_type: "incoming",
      },
      {
        headers: { api_access_token: API_ACCESS_TOKEN },
      }
    );

    console.log(`✅ Message sent successfully to Chatwoot!`);
  } catch (error) {
    console.error(
      "❌ Error sending message:",
      error.response
        ? JSON.stringify(error.response.data, null, 2)
        : error.message
    );
  }
}

// 🔹 Example usage of the function:
// sendMessageToChatwoot("+972512345676", "Hello, this is a test message!");
module.exports = {
  sendMessageToChatwoot,
};
