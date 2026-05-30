"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import React, { useMemo } from "react";

export default function GoogleAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  // Memoize to prevent re-initialization on re-renders (avoids GSI_LOGGER warning)
  const provider = useMemo(() => {
    if (!googleClientId) return <>{children}</>;
    return (
      <GoogleOAuthProvider clientId={googleClientId}>
        {children}
      </GoogleOAuthProvider>
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleClientId]);

  return provider;
}
