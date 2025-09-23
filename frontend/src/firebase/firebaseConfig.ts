// import { initializeApp } from "firebase/app";
// import { getFirestore } from "firebase/firestore";
// // const firebaseConfig = {
// //   apiKey: "AIzaSy...",
// //   authDomain: "resofit-chat.firebaseapp.com",
// //   projectId: "resofit-chat",
// //   storageBucket: "resofit-chat.appspot.com",
// //   messagingSenderId: "...",
// //   appId: "..."
// // };
// const firebaseConfig = {
//   apiKey: "AIzaSyDTNA8Eo39lW0NGndTBtfQrwY2xc6wut98",
//   authDomain: "resofit-chat.firebaseapp.com",
//   projectId: "resofit-chat",
//   storageBucket: "resofit-chat.firebasestorage.app",
//   messagingSenderId: "199891539027",
//   appId: "1:199891539027:web:1a33b623299c993c81e2a6",
//   measurementId: "G-NM7GFXGZ9E",
// };

// // Khởi tạo Firebase
// const app = initializeApp(firebaseConfig);

// // Khởi tạo Firestore Database
// const db = getFirestore(app);

// export { db };

// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDTNA8Eo39lW0NGndTBtfQrwY2xc6wut98",
  authDomain: "resofit-chat.firebaseapp.com",
  projectId: "resofit-chat",
  storageBucket: "resofit-chat.firebasestorage.app",
  messagingSenderId: "199891539027",
  appId: "1:199891539027:web:1a33b623299c993c81e2a6",
  measurementId: "G-NM7GFXGZ9E",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const auth = getAuth(app);

export { db, auth };
