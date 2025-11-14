/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
// import { onRequest } from "firebase-functions/https";
// import * as logger from "firebase-functions/logger";
import {onDocumentCreated} from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();
// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({maxInstances: 10});

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

export const onNewMessage = onDocumentCreated(
  "chats/{chatId}/messages/{messageId}",
  async (event) => {
    // `event.data` chính là `snapshot` trong v1
    if (!event.data) {
      console.log("No data associated with the event");
      return;
    }

    const messageData = event.data.data();
    const chatId = event.params.chatId;

    // 1. Lấy thông tin về cuộc trò chuyện
    const chatDoc = await db.collection("chats").doc(chatId).get();
    const chatData = chatDoc.data();

    if (!chatData || !chatData.users) {
      console.log("Chat document or users array not found.");
      return;
    }

    const senderId = messageData.senderId;
    const messageText = messageData.text;

    // 2. Xác định người nhận
    const receiverId = chatData.users.find((uid: string) => uid !== senderId);
    if (!receiverId) {
      console.log("Receiver not found.");
      return;
    }

    // 3. Lấy thông tin chi tiết của người gửi và người nhận
    const receiverDoc = await db.collection("users").doc(receiverId).get();
    const receiverData = receiverDoc.data();
    const pushToken = receiverData?.expoPushToken;

    const senderDoc = await db.collection("users").doc(senderId).get();
    const senderData = senderDoc.data();
    const senderUsername = senderData?.username || "Một người dùng";

    if (!pushToken) {
      console.log(`Receiver ${receiverId} does not have a push token.`);
      return;
    }

    // 4. Tạo payload và gửi thông báo
    const payload = {
      // SỬ DỤNG `token` THAY VÌ `tokens` cho v2 messaging
      token: pushToken,
      notification: {
        title: `Tin nhắn mới từ ${senderUsername}`,
        body: messageText,
      },
      data: {
        screen: "Chat",
        params: JSON.stringify({
          chatPartner: {
            id: parseInt(senderId.replace("user_", "")),
            username: senderUsername,
            role: senderData?.role || "member",
          },
        }),
      },
    };

    try {
      // Cú pháp gửi của v2 hơi khác
      await admin.messaging().send(payload);
      console.log("Successfully sent notification to", pushToken);
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  }
);
