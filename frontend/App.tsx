import React from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { Buffer } from "buffer";
global.Buffer = global.Buffer || Buffer;

export default function App() {
  console.log("--- App.tsx: Đang render AuthProvider và AppNavigator ---");
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
