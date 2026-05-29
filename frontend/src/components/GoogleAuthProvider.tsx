"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import React from "react";

export default function GoogleAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  // If no client ID, just render children without provider
  // Components will conditionally render GoogleLogin based on availability
  if (!googleClientId) {
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
