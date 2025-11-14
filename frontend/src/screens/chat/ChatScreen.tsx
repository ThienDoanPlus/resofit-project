import React, { useState, useCallback, useEffect } from "react";
import {
  GiftedChat,
  IMessage,
  Bubble,
  InputToolbar,
  Send,
  Composer,
} from "react-native-gifted-chat";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { useRoute, RouteProp } from "@react-navigation/native";
import { MemberStackParamList } from "../../navigation/types";
import Animated, { FadeInUp, Layout } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

// format message để lưu vào firestore
const formatMessageForFirestore = (message: IMessage) => ({
  _id: message._id,
  text: message.text,
  createdAt: message.createdAt,
  senderId: message.user._id,
});

// format message từ firestore để hiển thị ra GiftedChat
const formatMessageFromFirestore = (
  doc: any,
  currentUser: any,
  chatPartner: any
): IMessage => {
  const data = doc.data();
  const isCurrentUser = data.senderId === currentUser._id;
  return {
    _id: doc.id,
    text: data.text,
    createdAt: (data.createdAt as any).toDate(),
    user: {
      _id: data.senderId,
      name: isCurrentUser ? currentUser.name : chatPartner.username,
      avatar: isCurrentUser
        ? `https://ui-avatars.com/api/?name=${currentUser.name}&background=A0FF00&color=121212`
        : `https://ui-avatars.com/api/?name=${chatPartner.username}&background=333&color=EFEFEF`,
    },
  };
};

// Bong bóng chat có hiệu ứng
const AnimatedBubble = (props: any) => {
  return (
    <Animated.View
      layout={Layout.springify()}
      entering={FadeInUp.duration(500)}
    >
      <Bubble
        {...props}
        wrapperStyle={{
          right: { backgroundColor: "#A0FF00" },
          left: { backgroundColor: "#2E2E2E" },
        }}
        textStyle={{
          right: { color: "#121212" },
          left: { color: "#EFEFEF" },
        }}
      />
    </Animated.View>
  );
};

const ChatScreen = () => {
  const { user } = useAuth();
  const route = useRoute<RouteProp<MemberStackParamList, "Chat">>();
  const { chatPartner } = route.params;

  const [messages, setMessages] = useState<IMessage[]>([]);

  // tạo chatId duy nhất dựa theo 2 user
  const chatId = [`user_${user!.id}`, `user_${chatPartner.id}`]
    .sort()
    .join("-");
  const messagesCollectionRef = collection(db, "chats", chatId, "messages");

  // lắng nghe realtime tin nhắn
  useEffect(() => {
    const chatDocRef = doc(db, "chats", chatId);
    const messagesCollectionRef = collection(chatDocRef, "messages");
    const q = query(messagesCollectionRef, orderBy("createdAt", "desc"));

    const setupChat = async () => {
      try {
        const docSnap = await getDoc(chatDocRef);

        if (!docSnap.exists()) {
          console.log(`💬 Creating new chat document: ${chatId}`);
          await setDoc(chatDocRef, {
            users: [`user_${user!.id}`, `user_${chatPartner.id}`],
            lastMessage: null,
          });
        }

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const fetchedMessages = querySnapshot.docs.map((doc) =>
            formatMessageFromFirestore(
              doc,
              { _id: `user_${user!.id}`, name: user!.username },
              chatPartner
            )
          );
          setMessages(fetchedMessages);
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error setting up chat:", error);
        return () => {};
      }
    };

    const unsubscribePromise = setupChat();

    return () => {
      unsubscribePromise.then((unsubscribe) => {
        if (unsubscribe) {
          unsubscribe();
        }
      });
    };
  }, [chatId]);

  // gửi tin nhắn
  const onSend = useCallback(
    (newMessages: IMessage[] = []) => {
      const messageToSend = newMessages[0];
      addDoc(messagesCollectionRef, formatMessageForFirestore(messageToSend));
    },
    [chatId]
  );

  if (!user) {
    return null;
  }

  return (
    <GiftedChat
      messages={messages}
      onSend={(messages) => onSend(messages)}
      user={{
        _id: `user_${user.id}`,
        name: user.username,
        avatar: `https://ui-avatars.com/api/?name=${user.username}&background=A0FF00&color=121212`,
      }}
      // render bong bóng với hiệu ứng
      renderBubble={(props) => <AnimatedBubble {...props} />}
      // custom input toolbar (khung nhập)
      renderInputToolbar={(props) => (
        <InputToolbar
          {...props}
          containerStyle={{
            backgroundColor: "#1E1E1E",
            borderTopWidth: 1,
            borderTopColor: "#333",
            paddingVertical: 8,
          }}
        />
      )}
      // custom composer (TextInput bên trong InputToolbar)
      renderComposer={(props) => (
        <Composer {...props} textInputStyle={{ color: "#EFEFEF" }} />
      )}
      // custom nút gửi
      renderSend={(props) => (
        <Send {...props} containerStyle={{ justifyContent: "center" }}>
          <Ionicons
            name="send"
            size={28}
            color="#A0FF00"
            style={{ marginRight: 10 }}
          />
        </Send>
      )}
    />
  );
};

export default ChatScreen;
